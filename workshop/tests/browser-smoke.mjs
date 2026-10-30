// Install Playwright outside this repository. All model requests are mocked.
// PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs node workshop/tests/browser-smoke.mjs
// Optional: CHROMIUM_EXECUTABLE=/path/to/chrome, WORKSHOP_SCREENSHOTS=/tmp/screenshots
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, extname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

if (!process.env.PLAYWRIGHT_MODULE) throw new Error("Set PLAYWRIGHT_MODULE to an externally installed Playwright index.mjs.");
const { chromium } = await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE));
const root = await mkdtemp(join(tmpdir(), "alta-workshop-browser-"));
const prefix = "/alta2026-evaluating-ai-agents/hands-on/app/";
execFileSync("python3", [fileURLToPath(new URL("../../scripts/stage-workshop.py", import.meta.url)), join(root, prefix)]);
const mime = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json" };
const server = createServer(async (request, response) => {
  try {
    let pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname.endsWith("/")) pathname += "index.html";
    if (pathname.includes("..")) throw new Error("invalid path");
    response.writeHead(200, { "Content-Type": mime[extname(pathname)] || "text/plain" });
    response.end(await readFile(join(root, pathname)));
  } catch { response.writeHead(404); response.end("Not found"); }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}${prefix}`;
let browser;
const errors = [];
const requests = [];
const endpoint = "https://openrouter.ai/api/v1/chat/completions";
const connection = { apiKey: "fake-browser-test-key", baseUrl: "https://openrouter.ai/api/v1" };
const runPrefix = "alta2026-hands-on-run-v2:";
const draftKey = "alta2026-hands-on-judge-v2";

function mockReply(body) {
  const data = JSON.parse(body.messages[1].content);
  if (data.trace.some(message => typeof message.content === "string" && message.content.includes("temporary graduate visa"))) return "invalid judge JSON";
  const badSecondCall = data.trace.some(message => message.toolCall?.name === "find_courses" && message.toolCall.arguments.skill === "Python");
  return JSON.stringify({ results: data.criteria.map(target => ({
    criterionId: target.criterionId, targetId: target.targetId,
    score: badSecondCall && target.criterionId === "arguments" && target.targetId === "call-2" ? 1 : 4,
    explanation: badSecondCall && target.targetId === "call-2" ? "The course search uses Python instead of the SQL required by the returned job." : "Mocked score supported by a recorded evidence reference.",
    evidence: [target.evidenceIds.includes(target.targetId) ? target.targetId : target.evidenceIds.at(-1)],
  })) });
}
async function ready(page, step, round = "advice") {
  const files = { cases: "index.html", rubric: "rubric.html", judge: "judge.html", run: "run.html" };
  await page.goto(base + files[step] + "?round=" + round);
  await page.locator(step === "run" ? "#run:not([disabled])" : "#next-step:not([hidden])").waitFor();
}
async function next(page) {
  await page.locator("#next-step").click();
  await page.locator("#draft-status").filter({ hasText: "saved" }).waitFor();
}
async function screenshot(page, name) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${name}: no horizontal page overflow`);
  if (process.env.WORKSHOP_SCREENSHOTS) {
    await mkdir(process.env.WORKSHOP_SCREENSHOTS, { recursive: true });
    await page.screenshot({ path: join(process.env.WORKSHOP_SCREENSHOTS, name + ".png"), fullPage: true });
  }
}
async function runAndReview(page, expectedRequests) {
  await page.locator("#run").click();
  if (await page.locator("#key-dialog[open]").count()) {
    await page.locator("#key-input").fill(connection.apiKey);
    await page.getByRole("button", { name: "Save and run", exact: true }).click();
  }
  await page.locator("#view-report:not([hidden])").waitFor();
  assert.equal(requests.length, expectedRequests);
  const href = await page.locator("#view-report").getAttribute("href");
  const id = new URL(href, base).searchParams.get("run");
  const run = await page.evaluate(({ runPrefix, id }) => JSON.parse(localStorage.getItem(runPrefix + id)), { runPrefix, id });
  assert.ok(!JSON.stringify(run).includes(connection.apiKey));
  await page.locator("#view-report").click();
  await page.locator("#report-layout:not([hidden])").waitFor();
  assert.equal(await page.locator('.step-list [aria-current="step"]').innerText(), "5\nReview results");
  assert.equal(requests.length, expectedRequests, "Opening a report must not call a model");
  return run;
}

try {
  browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}), args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  context.on("page", page => page.on("pageerror", error => errors.push(error.message)));
  await context.route(endpoint, async route => {
    const body = route.request().postDataJSON(); requests.push(body);
    await route.fulfill({ json: { choices: [{ message: { content: mockReply(body) } }], usage: { total_tokens: 150 } } });
  });
  const page = await context.newPage();
  await ready(page, "cases");
  assert.equal(await page.locator("#cases .trace-preview").count(), 4);
  assert.equal(await page.locator("#judge-prompt").count(), 0, "Cases are a separate page");
  assert.equal(requests.length, 0);
  const roundNavigation = page.getByRole("navigation", { name: "Exercise rounds", exact: true });
  assert.equal(await roundNavigation.getByRole("link").count(), 3);
  await roundNavigation.getByRole("link", { name: "Round 3:", exact: false }).click();
  await page.locator("#next-step:not([hidden])").waitFor();
  assert.match(page.url(), /round=jobs-training/);
  await roundNavigation.getByRole("link", { name: "Round 1:", exact: false }).click();
  await page.locator("#next-step:not([hidden])").waitFor();
  await screenshot(page, "cases-desktop");
  await page.locator("#next-step").focus(); await page.keyboard.press("Enter");
  await page.locator("#judge-builder:not([disabled])").waitFor();
  assert.ok(page.url().includes("rubric.html"));
  assert.equal(await page.locator(".criterion-editor").count(), 3);
  assert.equal(await page.locator("#add-tool-criteria").isVisible(), false);
  await page.locator("#judge-name").fill("My continuous judge");
  await page.locator('[data-id="sound"] [data-field="rubric"]').fill("Respect the participant's constraints.");
  await page.locator('[data-id="sound"] [data-field="threshold"]').fill("3");
  await screenshot(page, "rubric-desktop");
  // Navigate immediately after the final input: no debounce may lose that edit.
  await next(page);
  const instructions = (await page.locator("#judge-prompt").inputValue()) + "\nParticipant instructions carried across rounds.";
  await page.locator("#judge-prompt").fill(instructions);
  await page.goBack(); await page.locator("#judge-builder:not([disabled])").waitFor();
  assert.equal(await page.locator('[data-id="sound"] [data-field="threshold"]').inputValue(), "3");
  await page.goForward(); await page.locator("#judge-prompt:not([disabled])").waitFor();
  assert.equal(await page.locator("#judge-prompt").inputValue(), instructions);
  await page.reload(); await page.locator("#judge-prompt:not([disabled])").waitFor();
  assert.equal(await page.locator("#judge-prompt").inputValue(), instructions);
  await next(page);
  assert.equal(await page.locator("#n").inputValue(), "1");
  assert.equal(await page.locator("#temperature").inputValue(), "0");
  assert.equal(await page.locator(".more-settings").getAttribute("open"), null);
  assert.match(await page.locator("#call-count").innerText(), /4 judge requests/);
  await page.locator("#model").fill("test-model");
  await page.locator(".more-settings > summary").click();
  await page.locator("#run-id").fill("Advice round");
  await screenshot(page, "run-desktop");
  const adviceRun = await runAndReview(page, 4);
  assert.equal(adviceRun.scenarios.length, 1);
  assert.equal(adviceRun.cells.length, 4);
  assert.equal(adviceRun.cells.filter(cell => cell.state === "error").length, 1);
  assert.equal(adviceRun.judge.criteria[0].threshold, 3);
  assert.equal(await roundNavigation.getByRole("link").count(), 3);
  await screenshot(page, "review-desktop");

  await page.locator("#next-round").click();
  await page.locator("#next-step:not([hidden])").waitFor();
  assert.equal(await page.locator("#cases .trace-preview").count(), 3);
  assert.match(await page.locator(".round-label").innerText(), /Round 2 of 3/);
  await next(page);
  assert.equal(await page.locator(".criterion-editor").count(), 3, "Tool criteria are opt-in");
  assert.equal(await page.locator("#judge-name").inputValue(), "My continuous judge");
  assert.equal(await page.locator("#add-tool-criteria").isVisible(), false);
  // Round links save edits immediately and work in both directions.
  await page.locator("#judge-name").fill("Judge saved between rounds");
  await roundNavigation.getByRole("link", { name: "Round 1:", exact: false }).click();
  await page.locator("#next-step:not([hidden])").waitFor();
  await roundNavigation.getByRole("link", { name: "Round 2:", exact: false }).click();
  await page.locator("#next-step:not([hidden])").waitFor();
  await next(page);
  assert.equal(await page.locator("#judge-name").inputValue(), "Judge saved between rounds");
  await next(page);
  assert.equal(await page.locator("#judge-prompt").inputValue(), instructions);
  await next(page);
  assert.match(await page.locator("#call-count").innerText(), /3 judge requests/);
  const jobsRun = await runAndReview(page, 7);
  assert.equal(jobsRun.scenarios[0].id, "job-search");
  assert.equal(jobsRun.cells.length, 3);
  await page.locator("#next-round").click(); await page.locator("#next-step:not([hidden])").waitFor();
  await next(page);
  assert.equal(await page.locator("#add-tool-criteria").isVisible(), true);
  await page.locator("#add-tool-criteria").click();
  await page.locator('[data-id="arguments"] [data-field="threshold"]').fill("2");
  await page.locator('[data-id="arguments"] [data-field="rubric"]').fill("Participant's tool rubric.");
  await page.locator("#add-tool-criteria").click();
  assert.equal(await page.locator(".criterion-editor").count(), 6);
  assert.equal(await page.locator('[data-id="arguments"] [data-field="rubric"]').inputValue(), "Participant's tool rubric.");
  await next(page); await next(page);
  const trainingRun = await runAndReview(page, 10);
  assert.equal(trainingRun.scenarios[0].id, "jobs-training");
  assert.equal(await page.locator("#next-round").count(), 0);
  assert.match(await page.locator("#exercise-complete").innerText(), /final round/);
  await page.getByRole("tab", { name: /^Cases/ }).click();
  const index = trainingRun.cells.findIndex(cell => cell.caseId === "training-b");
  const row = page.locator(`#case-${index}`);
  await row.locator(":scope > summary").click(); await row.locator(".case-columns").waitFor();
  assert.equal(await row.locator(".tool-message").count(), 2);
  assert.equal(await row.locator(".metric-row").count(), 8);
  const metric = row.locator(".metric-row").filter({ has: page.locator(".metric-name", { hasText: "Argument accuracy · find_courses · call 2" }) });
  await metric.locator("summary").click();
  assert.match(await metric.innerText(), /Below threshold/);
  await metric.locator(".evidence-links a").click();
  assert.equal(await page.evaluate(() => document.activeElement.id), `evidence-${index}-call-2`);
  await page.getByRole("tab", { name: /^Cases/ }).focus(); await page.keyboard.press("ArrowLeft");
  assert.equal(await page.getByRole("tab", { name: "Overview", exact: true }).getAttribute("aria-selected"), "true");
  await page.keyboard.press("ArrowRight");
  await page.setViewportSize({ width: 390, height: 844 });
  await screenshot(page, "review-mobile");
  await page.reload(); await page.locator("#cases-panel:not([hidden])").waitFor();
  assert.equal(requests.length, 10);
  for (const step of ["cases", "rubric", "judge", "run"]) {
    await ready(page, step, "jobs-training");
    await screenshot(page, step + "-mobile");
  }
  await ready(page, "run", "advice");
  await page.locator(".more-settings > summary").click();
  assert.equal(await page.locator("#run-id").inputValue(), "Advice round");
  // API key removal is shared across the new pages and never revives a legacy key.
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.locator("#forget-key").click();
  await page.locator("#settings-close").click();
  await page.reload(); await page.locator("#run:not([disabled])").waitFor();
  assert.match(await page.locator("#key-status").innerText(), /No API key/);

  // Validate page-specific fields without making a paid call.
  await ready(page, "rubric");
  await page.locator(".rubric-starting-point > summary").click();
  await page.locator("#judge-template").selectOption("blank"); await page.locator("#load-template").click();
  await page.locator("#next-step").click();
  assert.match(await page.locator("#page-error").innerText(), /criterion/);
  assert.ok(page.url().includes("rubric.html"));
  await ready(page, "judge"); await page.locator("#judge-prompt").fill("");
  await page.locator("#next-step").click();
  assert.match(await page.locator("#page-error").innerText(), /instructions/);
  await ready(page, "rubric"); await page.locator("#add-criterion").click();
  await page.locator('[data-field="name"]').fill("Tool constraints");
  await page.locator('[data-field="rubric"]').fill("Check tool input constraints.");
  await page.locator('[data-field="target"]').selectOption("tool_call");
  await ready(page, "judge"); await page.locator("#judge-prompt").fill("Check the recorded tool inputs.");
  await ready(page, "run"); await page.locator("#run").click();
  assert.match(await page.locator("#panel-error").innerText(), /No criteria apply/);
  assert.equal(requests.length, 10);

  // Old entry and multi-scenario report URLs keep query strings and fragments.
  const legacy = await browser.newContext();
  await legacy.addInitScript(() => {
    if (!localStorage.getItem("legacy-seeded")) {
      localStorage.setItem("alta2026-hands-on-v1", JSON.stringify({ apiKey: "fake-legacy-key", prompt: "My saved starter instructions", model: "legacy-model" }));
      localStorage.setItem("legacy-seeded", "true");
    }
  });
  const old = await legacy.newPage();
  await old.goto(base + "advanced/?round=job-search#examples");
  await old.waitForURL(url => url.pathname.endsWith("/app/index.html"));
  assert.equal(new URL(old.url()).hash, "#examples");
  await ready(old, "judge");
  assert.equal(await old.locator("#judge-prompt").inputValue(), "My saved starter instructions");
  const multi = { ...adviceRun, id: "legacy-multi", scenarios: [...adviceRun.scenarios, ...jobsRun.scenarios], cells: [...adviceRun.cells, ...jobsRun.cells] };
  await old.evaluate(({ multi, runPrefix }) => localStorage.setItem(runPrefix + multi.id, JSON.stringify(multi)), { multi, runPrefix });
  await old.goto(base + "advanced/report.html?run=legacy-multi&view=cases&scenario=job-search&source=bookmark#saved-report");
  await old.locator("#report-layout:not([hidden])").waitFor();
  assert.ok(new URL(old.url()).pathname.endsWith("/app/report.html"));
  assert.equal(new URL(old.url()).hash, "#saved-report");
  assert.equal(new URL(old.url()).searchParams.get("source"), "bookmark");
  assert.equal(await old.locator('#scenario-nav [aria-current="true"]').innerText(), "Find suitable jobs\n3/3");
  assert.equal(await old.locator("#next-round").count(), 0);
  await legacy.close();

  // Cancellation and refresh stop active calls, with no automatic resumption.
  for (const action of ["cancel", "refresh"]) {
    const isolated = await browser.newContext();
    await isolated.addInitScript(connection => localStorage.setItem("alta2026-hands-on-connection-v1", JSON.stringify(connection)), connection);
    let calls = 0;
    await isolated.route(endpoint, async route => {
      calls++; await new Promise(resolve => setTimeout(resolve, 750));
      await route.fulfill({ json: { choices: [{ message: { content: mockReply(route.request().postDataJSON()) } }] } }).catch(() => {});
    });
    const testPage = await isolated.newPage();
    await ready(testPage, "run"); await testPage.locator("#run").click();
    await testPage.locator("#cancel:not([hidden])").waitFor();
    assert.equal(await testPage.locator("#round-select").isDisabled(), true);
    if (action === "cancel") {
      await testPage.locator("#cancel").click();
      await testPage.locator("#view-report:not([hidden])").waitFor();
      assert.match(await testPage.locator("#progress-live").innerText(), /4 cancelled/);
    } else {
      await testPage.reload(); await testPage.locator("#run:not([disabled])").waitFor();
      await testPage.waitForTimeout(900);
      assert.equal(await testPage.locator("#cancel").isHidden(), true);
    }
    assert.ok(calls <= 3, `${action} must stop queued requests`);
    await isolated.close();
  }

  // If the completed snapshot cannot be saved, offer its credential-free JSON.
  const quota = await browser.newContext({ acceptDownloads: true });
  await quota.addInitScript(connection => {
    localStorage.setItem("alta2026-hands-on-connection-v1", JSON.stringify(connection));
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key.startsWith("alta2026-hands-on-run-v2:") && JSON.parse(value).finishedAt) throw new DOMException("Full", "QuotaExceededError");
      return setItem.call(this, key, value);
    };
  }, connection);
  await quota.route(endpoint, route => route.fulfill({ json: { choices: [{ message: { content: mockReply(route.request().postDataJSON()) } }] } }));
  const quotaPage = await quota.newPage();
  await ready(quotaPage, "run"); await quotaPage.locator("#run").click();
  await quotaPage.locator('#view-report[download="evaluation-results.json"]').waitFor();
  assert.match(await quotaPage.locator("#report-error").innerText(), /Download/);
  const downloadEvent = quotaPage.waitForEvent("download");
  await quotaPage.locator("#view-report").click();
  const downloaded = JSON.parse(await readFile(await (await downloadEvent).path(), "utf8"));
  assert.equal(downloaded.cells.length, 4);
  assert.ok(downloaded.finishedAt);
  assert.ok(!JSON.stringify(downloaded).includes(connection.apiKey));
  await quota.close();

  const blocked = await browser.newContext();
  await blocked.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === "alta2026-hands-on-judge-v2") throw new DOMException("Blocked", "SecurityError");
      return setItem.call(this, key, value);
    };
  });
  const blockedPage = await blocked.newPage();
  await ready(blockedPage, "rubric");
  assert.match(await blockedPage.locator("#save-error").innerText(), /could not save/);
  await blockedPage.locator("#next-step").click();
  assert.ok(blockedPage.url().includes("rubric.html"), "Do not silently lose unsaved edits");
  await blocked.close();

  const missing = await context.newPage();
  await missing.goto(base + "report.html?run=missing");
  assert.match(await missing.locator("#report-empty").innerText(), /Report unavailable/);
  await missing.goto(base + "report.html?round=job-search&run=missing");
  assert.match(await missing.locator("#back-to-run").getAttribute("href"), /round=job-search/);
  assert.deepEqual(errors, []);
  console.log("Browser checks passed: all three rounds, page persistence, history, reports, migration, cancellation, interrupted runs, storage errors, and mobile layouts. All model calls were mocked.");
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
  await rm(root, { recursive: true, force: true });
}
