import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateJudge, targetsFor, judgeMessages, parseJudgePayload, createRun, cellStatus, runSummary, metricSummary, evaluateRun, callJudge, normaliseBaseUrl } from "../app/advanced/core.mjs";
import { SETTINGS_KEY, DRAFT_KEY, readJSON, writeJSON, loadSettings, saveSettings, restoreJudge, saveRun, loadRun, listRuns } from "../app/advanced/storage.mjs";
import { CONNECTION_KEY, LEGACY_KEY, readConnection, writeConnection } from "../app/connection.mjs";

const { scenarios } = JSON.parse(await readFile(new URL("../data/scenarios.json", import.meta.url)));
const { judges } = JSON.parse(await readFile(new URL("../prompts/judges.json", import.meta.url)));
const judge = judges[0];
const advanced = scenarios[2];
const item = advanced.cases[0];
const makeRun = (overrides = {}) => createRun({ judge, scenarios, model: "test-model", temperature: 0, n: 1, name: "Test run", id: "test-run", ...overrides });
const payloadFor = targets => ({ results: targets.map(target => ({ criterionId: target.criterionId, targetId: target.targetId, score: 4, explanation: "Supported by the cited message.", evidence: [target.evidenceIds[0]] })) });
class MemoryStorage {
  data = new Map();
  get length() { return this.data.size; }
  key(index) { return [...this.data.keys()][index] ?? null; }
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) { this.data.set(key, value); }
}

test("fixtures preserve ten traces with zero, one and two paired calls and neutral variant labels", () => {
  assert.deepEqual(scenarios.map(scenario => scenario.cases.length), [4, 3, 3]);
  for (const [index, scenario] of scenarios.entries()) {
    for (const trace of scenario.cases) {
      const ids = trace.messages.map(message => message.id);
      assert.equal(new Set(ids).size, ids.length);
      const calls = trace.messages.filter(message => message.toolCall);
      assert.equal(calls.length, index);
      for (const call of calls) {
        assert.ok(scenario.tools.some(tool => tool.name === call.toolCall.name));
        assert.equal(trace.messages.filter(message => message.callId === call.toolCall.id).length, 1);
      }
      assert.ok(!Object.hasOwn(trace, "expectedScores"));
      if (index) assert.match(trace.label, /^Trace [ABC]$/);
    }
  }
});

test("custom criteria expand per tool call; future evidence is excluded from each call", () => {
  const custom = { ...judge, criteria: [{ id: "own-id", name: "My own metric", target: "tool_call", rubric: "Check extraction.", threshold: 3 }] };
  const targets = targetsFor(custom, item);
  assert.deepEqual(targets.map(target => target.targetId), ["call-1", "call-2"]);
  assert.deepEqual(targets[0].evidenceIds, ["system", "user", "call-1"]);
  assert.ok(targets[1].evidenceIds.includes("result-1"));
  assert.ok(!targets[1].evidenceIds.includes("result-2"));
  assert.equal(targetsFor(custom, scenarios[0].cases[0]).length, 0);
  const messages = judgeMessages(custom, advanced, item);
  const request = JSON.parse(messages[1].content);
  assert.equal(request.tools[0].name, "search_jobs");
  assert.equal(request.criteria[0].name, "My own metric");
});

test("tool-result criteria are N/A without tools; whole-trace criteria work without tools", () => {
  const custom = { ...judge, criteria: [
    { id: "g", name: "Grounding", target: "tool_results", threshold: 4, rubric: "Grounding" },
    { id: "t", name: "Trace", target: "trace", threshold: 4, rubric: "Trace" },
  ] };
  assert.deepEqual(targetsFor(custom, scenarios[0].cases[0]).map(target => target.criterionId), ["t"]);
  assert.equal(targetsFor(custom, item).length, 2);
});

test("parser accepts dynamically named metrics and fenced JSON without coercing scores", async t => {
  const targets = targetsFor(judge, item);
  const payload = payloadFor(targets);
  assert.equal(parseJudgePayload(JSON.stringify(payload), targets).length, 8);
  assert.equal(parseJudgePayload("```json\n" + JSON.stringify(payload) + "\n```", targets)[0].score, 4);
  for (const value of [0, 6, 2.5, "4", null, true]) await t.test(`rejects score ${JSON.stringify(value)}`, () => {
    const bad = structuredClone(payload); bad.results[0].score = value;
    assert.throws(() => parseJudgePayload(JSON.stringify(bad), targets), /integer/);
  });
});

test("parser rejects missing, duplicate, unknown and unsupported evidence results", async t => {
  const targets = targetsFor(judge, item);
  const modifications = [
    ["missing", payload => payload.results.pop()],
    ["duplicate", payload => { payload.results[1] = payload.results[0]; }],
    ["unknown criterion", payload => { payload.results[0].criterionId = "invented"; }],
    ["unknown target", payload => { payload.results[0].targetId = "made-up"; }],
    ["unknown evidence", payload => { payload.results[0].evidence = ["not-a-message"]; }],
    ["missing evidence", payload => { payload.results[0].evidence = []; }],
    ["missing reason", payload => { payload.results[0].explanation = " "; }],
    ["future evidence", payload => { payload.results.find(result => result.targetId === "call-1").evidence = ["answer"]; }],
  ];
  for (const [name, modify] of modifications) await t.test(name, () => {
    const payload = payloadFor(targets); modify(payload);
    assert.throws(() => parseJudgePayload(JSON.stringify(payload), targets));
  });
  assert.throws(() => parseJudgePayload("not json", targets), error => error.raw === "not json");
});

test("judge validation handles blank judges and thresholds", () => {
  assert.throws(() => validateJudge({ name: "New judge", instructions: "Evaluate.", criteria: [] }), /criterion/);
  const changed = structuredClone(judge);
  changed.criteria[0].threshold = 6;
  assert.throws(() => validateJudge(changed), /threshold/);
  changed.criteria[0].threshold = 3;
  changed.criteria[0].rubric = "";
  assert.throws(() => validateJudge(changed), /rubric/);
  changed.criteria[0].rubric = "Something custom";
  assert.equal(validateJudge(changed), changed);
});

test("run snapshots isolate fixtures, criteria and threshold settings from later edits", () => {
  const inputJudge = structuredClone(judge);
  const inputScenarios = structuredClone(scenarios);
  const run = makeRun({ judge: inputJudge, scenarios: inputScenarios, n: 2 });
  assert.equal(run.cells.length, 20);
  inputJudge.criteria[0].threshold = 1;
  inputScenarios[0].cases[0].messages[0].content = "changed";
  assert.equal(run.judge.criteria[0].threshold, 4);
  assert.notEqual(run.scenarios[0].cases[0].messages[0].content, "changed");
  for (const n of [0, 1.5, 6]) assert.throws(() => makeRun({ n }));
  assert.throws(() => makeRun({ scenarios: [] }));
});

test("one weak second-call criterion fails the repeat despite a strong final answer", () => {
  const run = makeRun({ scenarios: [advanced] });
  const cell = run.cells[0];
  cell.state = "done"; cell.results = payloadFor(cell.targets).results;
  const result = cell.results.find(result => result.criterionId === "arguments" && result.targetId === "call-2");
  result.score = 2;
  assert.equal(cellStatus(cell), "failed");
  const target = cell.targets.find(target => target.criterionId === result.criterionId && target.targetId === result.targetId);
  target.threshold = 2;
  assert.equal(cellStatus(cell), "passed");
  assert.equal(result.score, 2);
});

test("repeat summaries exclude errors, cancellations, N/A and queued work", () => {
  const run = makeRun({ scenarios: [scenarios[0]], judge: judges[1], n: 2 });
  for (const [index, cell] of run.cells.entries()) {
    cell.state = ["done", "done", "error", "cancelled", "not_applicable", "queued", "running", "error"][index];
    if (cell.state === "done") { cell.results = payloadFor(cell.targets).results; cell.results.forEach(result => { result.score = index ? 5 : 3; }); }
  }
  const summary = runSummary(run.cells);
  assert.equal(summary.scored, 2); assert.equal(summary.passRate, .5); assert.equal(summary.error, 2);
  const metric = metricSummary(run.cells, run.judge)[0];
  assert.deepEqual({ mean: metric.mean, min: metric.min, max: metric.max, count: metric.count, passed: metric.passed }, { mean: 4, min: 3, max: 5, count: 2, passed: 1 });
});

test("worker pool records errors, limits concurrency and stops queued requests on cancel", async () => {
  const run = makeRun();
  const controller = new AbortController();
  let calls = 0, active = 0, peak = 0;
  await evaluateRun(run, { signal: controller.signal, concurrency: 2, worker: async () => {
    calls++; active++; peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, 5));
    active--; controller.abort(); throw new Error("aborted");
  } });
  assert.equal(peak, 2); assert.equal(calls, 2);
  assert.ok(run.cells.every(cell => cell.state === "cancelled"));
  assert.ok(run.finishedAt);
  const errorRun = makeRun({ scenarios: [scenarios[0]] });
  await evaluateRun(errorRun, { signal: new AbortController().signal, worker: async () => { throw new Error("invalid reply"); } });
  assert.equal(runSummary(errorRun.cells).error, 4);
});

test("API request sends one dynamic judge contract and records response metadata", async () => {
  let sent;
  const targets = targetsFor(judge, item);
  const response = await callJudge({ baseUrl: "https://judge.example/v1", apiKey: "test-key", model: "test-model", temperature: 0,
    judge, scenario: advanced, item, signal: new AbortController().signal,
    fetchImpl: async (url, options) => {
      sent = { url, ...options };
      return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(payloadFor(targets)) } }], usage: { total_tokens: 123 } }), { status: 200 });
    },
  });
  assert.equal(sent.url, "https://judge.example/v1/chat/completions");
  const body = JSON.parse(sent.body);
  assert.equal(body.messages.length, 2); assert.ok(body.max_tokens > 400);
  assert.ok(!body.tools); // Evaluated tool calls are data, never executed by the API.
  assert.equal(response.results.length, 8); assert.equal(response.usage.total_tokens, 123);
  assert.ok(!JSON.stringify(response).includes("test-key"));
});

test("API errors, empty replies and malformed judge output remain errors", async () => {
  const config = { baseUrl: "https://judge.example/v1", apiKey: "secret", model: "test", temperature: 0, judge, scenario: advanced, item, signal: new AbortController().signal };
  await assert.rejects(callJudge({ ...config, fetchImpl: async () => new Response('{"error":{"message":"bad key"}}', { status: 401 }) }), /bad key/);
  await assert.rejects(callJudge({ ...config, fetchImpl: async () => new Response('{"choices":[]}') }), /empty/);
  await assert.rejects(callJudge({ ...config, fetchImpl: async () => new Response('{"choices":[{"message":{"content":"oops"}}]}') }), /valid JSON/);
});

test("settings migration retains the old prompt and credentials stay outside reports", () => {
  const storage = new MemoryStorage();
  const settings = { apiKey: "secret-test-key", baseUrl: "https://example.com/v1", prompt: "My previous prompt", model: "old-model" };
  writeJSON(storage, LEGACY_KEY, settings);
  const draft = restoreJudge(storage, judge, () => "migrated");
  assert.equal(draft.judge.instructions, settings.prompt);
  assert.equal(draft.judge.criteria.length, 3);
  assert.deepEqual(readJSON(storage, LEGACY_KEY), settings);
  writeJSON(storage, DRAFT_KEY, draft);
  assert.deepEqual(restoreJudge(storage, judge, () => "unused"), draft);
  const run = makeRun(); saveRun(storage, run);
  assert.equal(loadRun(storage, run.id).name, run.name);
  assert.equal(listRuns(storage).length, 1);
  assert.ok(!JSON.stringify(loadRun(storage, run.id)).includes(settings.apiKey));
});

test("missing/corrupt browser storage is recoverable and failed writes are explicit", () => {
  const storage = new MemoryStorage();
  storage.setItem(SETTINGS_KEY, "broken json");
  assert.deepEqual(readJSON(storage, SETTINGS_KEY, {}), {});
  assert.equal(loadRun(storage, "missing"), null);
  assert.deepEqual(listRuns(undefined), []);
  assert.throws(() => saveRun({ setItem() { throw new Error("quota"); } }, makeRun()), /could not save/);
});

test("connection migration is idempotent, preserves starter preferences and never revives a removed key", () => {
  const storage = new MemoryStorage();
  const preferences = { prompt: "Starter prompt", model: "starter-model", n: 2, temperature: .5 };
  writeJSON(storage, LEGACY_KEY, { ...preferences, apiKey: "old-key", baseUrl: "https://old.example/v1" });
  assert.deepEqual(readConnection(storage), { apiKey: "old-key", baseUrl: "https://old.example/v1" });
  assert.deepEqual(readJSON(storage, LEGACY_KEY), preferences);
  writeConnection(storage, { apiKey: "", baseUrl: "https://new.example/v1" });
  // Simulate a stale older page writing the legacy key after migration.
  writeJSON(storage, LEGACY_KEY, { ...preferences, apiKey: "stale-key" });
  assert.equal(readConnection(storage).apiKey, "");
  assert.equal(readJSON(storage, CONNECTION_KEY).baseUrl, "https://new.example/v1");
  writeConnection(storage, { apiKey: "", baseUrl: "https://new.example/v1" });
  assert.deepEqual(readJSON(storage, LEGACY_KEY), preferences);
});

test("advanced preferences seed once, remain independent, and never contain credentials", () => {
  const storage = new MemoryStorage();
  writeJSON(storage, LEGACY_KEY, { prompt: "Original prompt", model: "starter", n: 2, apiKey: "shared-key" });
  assert.equal(loadSettings(storage).model, "starter");
  writeJSON(storage, LEGACY_KEY, { prompt: "Changed starter prompt", model: "changed-starter", n: 1 });
  assert.equal(loadSettings(storage).model, "starter", "Seed only on the first advanced visit");
  saveSettings(storage, { model: "advanced", n: 5, temperature: 1, apiKey: "must-not-copy", prompt: "must-not-copy" });
  assert.equal(loadSettings(storage).model, "advanced");
  assert.equal(loadSettings(storage).apiKey, "shared-key");
  assert.deepEqual(readJSON(storage, SETTINGS_KEY), { model: "advanced", n: 5, temperature: 1 });
  assert.equal(readJSON(storage, LEGACY_KEY).model, "changed-starter");
  assert.equal(readJSON(storage, LEGACY_KEY).prompt, "Changed starter prompt");
});

test("endpoint normalization accepts local mocks and rejects credentials or unsafe protocols", () => {
  assert.equal(normaliseBaseUrl("https://example.com/v1/chat/completions"), "https://example.com/v1");
  assert.equal(normaliseBaseUrl("http://localhost:8000/v1/"), "http://localhost:8000/v1");
  for (const url of ["http://example.com", "https://user:pass@example.com", "ftp://localhost", "garbage"]) assert.throws(() => normaliseBaseUrl(url));
});
