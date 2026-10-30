import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { WORKFLOW_KEY, ROUNDS, STEPS, loadWorkflow, saveWorkflow, resolveRound, stepHref, validateRubric, addToolCriteria } from "../app/workflow.mjs";

const { judges } = JSON.parse(await readFile(new URL("../prompts/judges.json", import.meta.url)));
const advice = judges.find(judge => judge.id === "career-advice");
const tools = judges.find(judge => judge.id === "career-agent");
class MemoryStorage {
  data = new Map();
  getItem(key) { return this.data.get(key) ?? null; }
  setItem(key, value) { this.data.set(key, value); }
}

test("round and step links use separate pages under a relative Pages prefix", () => {
  assert.deepEqual(ROUNDS.map(round => round.tools), [0, 1, 2]);
  const base = "https://example.org/alta2026-evaluating-ai-agents/hands-on/app/";
  for (const step of STEPS) {
    const url = new URL(stepHref(step.id, "job-search", "report/id"), base);
    assert.equal(url.pathname, new URL(step.file, base).pathname);
    assert.equal(url.searchParams.get("round"), "job-search");
    assert.equal(url.searchParams.get("run"), step.id === "review" ? "report/id" : null);
  }
});

test("progress resumes a valid round, with explicit round links taking precedence", () => {
  const storage = new MemoryStorage();
  saveWorkflow(storage, { round: "job-search", step: "rubric" });
  const state = loadWorkflow(storage);
  assert.equal(resolveRound("", state).id, "job-search");
  assert.equal(resolveRound("?round=jobs-training", state).id, "jobs-training");
  assert.equal(resolveRound("?round=unknown", state).id, "advice");
  assert.equal(state.step, "rubric");
});

test("round transitions preserve other rounds' latest reports and run names", () => {
  const storage = new MemoryStorage();
  saveWorkflow(storage, { latestRuns: { advice: "run-1" }, runNames: { advice: "My first run" } });
  saveWorkflow(storage, { round: "job-search", latestRuns: { "job-search": "run-2" }, runNames: { "job-search": "My second run" } });
  const saved = loadWorkflow(storage);
  assert.deepEqual(saved.latestRuns, { advice: "run-1", "job-search": "run-2" });
  assert.deepEqual(saved.runNames, { advice: "My first run", "job-search": "My second run" });
});

test("missing or corrupt workflow storage falls back without inventing a report", () => {
  const storage = new MemoryStorage();
  for (const value of ["invalid JSON", "null", '42', JSON.stringify({ round: "missing", step: "missing", latestRuns: { advice: 1, unknown: "invalid" } })]) {
    storage.setItem(WORKFLOW_KEY, value);
    assert.deepEqual(loadWorkflow(storage), { round: "advice", step: "cases", latestRuns: {}, runNames: {} });
  }
  assert.equal(loadWorkflow(undefined).round, "advice");
  assert.throws(() => saveWorkflow(undefined, { step: "run" }), /could not save/);
});

test("rubric validation does not require instructions from a later page", () => {
  assert.doesNotThrow(() => validateRubric({ ...advice, instructions: "" }));
  assert.throws(() => validateRubric({ ...advice, criteria: [] }), /criterion/);
  const invalid = structuredClone(advice);
  invalid.criteria[0].threshold = 1.5;
  assert.throws(() => validateRubric(invalid), /threshold/);
});

test("suggested tool criteria preserve edits, custom criteria and instructions across rounds", () => {
  const custom = structuredClone(advice);
  custom.instructions = "My participant instructions";
  custom.criteria[0].rubric = "My edited rubric";
  custom.criteria.push({ id: "own", name: "Custom", target: "trace", threshold: 3, rubric: "My own criterion" });
  const original = structuredClone(custom);
  const extended = addToolCriteria(custom, tools);
  assert.equal(extended.criteria.length, custom.criteria.length + 3);
  assert.deepEqual(custom, original);
  assert.deepEqual(extended.criteria.slice(0, custom.criteria.length), original.criteria);
  extended.criteria.find(criterion => criterion.id === "arguments").threshold = 2;
  extended.criteria.find(criterion => criterion.id === "arguments").rubric = "Participant's tool rubric";
  const nextRound = addToolCriteria(extended, tools);
  assert.deepEqual(nextRound, extended);
  assert.equal(nextRound.instructions, "My participant instructions");
});
