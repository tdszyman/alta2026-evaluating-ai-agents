// Install Playwright outside this repository. Run against a temporary staged app:
// PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs node workshop/tests/browser-smoke.mjs
// Optional: CHROMIUM_EXECUTABLE=/path/to/chrome, WORKSHOP_SCREENSHOTS=/tmp/screenshots
// The browser must have its platform libraries. All judge API requests are mocked.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, extname } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const modulePath = process.env.PLAYWRIGHT_MODULE;
if (!modulePath) throw new Error("Set PLAYWRIGHT_MODULE to an externally installed Playwright index.mjs.");
const { chromium } = await import(pathToFileURL(modulePath));
const root = await mkdtemp(join(tmpdir(), "alta-workshop-browser-"));
const prefix = "/alta2026-evaluating-ai-agents/hands-on/app/";
execFileSync("python3", [fileURLToPath(new URL("../../scripts/stage-workshop.py", import.meta.url)), join(root, prefix)]);
const mime = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json" };
const server = createServer(async (request, response) => {
  try {
    let pathname = new URL(request.url, "http://localhost").pathname;
    if (pathname.endsWith("/")) pathname += "index.html";
    if (pathname.includes("..")) throw new Error("invalid path");
    const bytes = await readFile(join(root, pathname));
    response.writeHead(200, { "Content-Type": mime[extname(pathname)] || "text/plain" }); response.end(bytes);
  } catch { response.writeHead(404); response.end("Not found"); }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const starterBase = `http://127.0.0.1:${server.address().port}${prefix}`;
const base = starterBase + "advanced/";
const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE ? { executablePath: process.env.CHROMIUM_EXECUTABLE } : {}), args: ["--no-sandbox"] });
const errors = [];
const apiRequests = [];
let starterRequests = 0;
const context = await browser.newContext({ viewport: { width: 1600, height: 1100 } });
const page = await context.newPage();
page.on("pageerror", error => errors.push(error.message));
const repeats = new Map();

function mockReply(body) {
  const data = JSON.parse(body.messages[1].content);
  const key = JSON.stringify(data.trace);
  const repeat = (repeats.get(key) || 0) + 1; repeats.set(key, repeat);
  const visa = data.trace.some(message => typeof message.content === "string" && message.content.includes("temporary graduate visa"));
  if (visa) return "invalid judge JSON";
  const badSecondCall = data.trace.some(message => message.toolCall?.name === "find_courses" && message.toolCall.arguments.skill === "Python");
  return JSON.stringify({ results: data.criteria.map(target => ({
    criterionId: target.criterionId, targetId: target.targetId,
    score: badSecondCall && target.criterionId === "arguments" && target.targetId === "call-2" ? 1 : repeat % 2 ? 4 : 5,
    explanation: badSecondCall && target.targetId === "call-2" ? "The course search uses Python instead of the SQL required by the returned job, and exceeds the learner’s budget and weekly study limit." : "Mocked test score with a recorded evidence reference.",
    evidence: [target.evidenceIds.includes(target.targetId) ? target.targetId : target.evidenceIds.at(-1)],
  })) });
}

await context.route("https://openrouter.ai/api/v1/chat/completions", async route => {
  const body = route.request().postDataJSON();
  if (!body.messages[1].content.startsWith("{")) {
    starterRequests++;
    await route.fulfill({ json: { choices: [{ message: { content: JSON.stringify({ sound: 4, tone: 5, compliant: 3, rationale: "Mocked starter reply." }) } }] } });
    return;
  }
  apiRequests.push(body);
  await route.fulfill({ json: { choices: [{ message: { content: mockReply(body) } }], usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 } } });
});

try {
  await page.goto(base);
  await page.locator("#run:not([disabled])").waitFor();
  assert.equal(await page.locator("#criteria .criterion-editor").count(), 6);
  assert.match(await page.locator("#call-count").innerText(), /10 judge requests/);
  if (process.env.WORKSHOP_SCREENSHOTS) {
    await mkdir(process.env.WORKSHOP_SCREENSHOTS, { recursive: true });
    await page.screenshot({ path: join(process.env.WORKSHOP_SCREENSHOTS, "builder-desktop.png") });
  }
  await page.locator("#run-id").fill("Browser verification");
  await page.locator("#n").fill("2");
  await page.locator("#run").click();
  await page.locator("#key-dialog[open]").waitFor();
  await page.locator("#key-input").fill("fake-browser-test-key");
  await page.getByRole("button", { name: "Save and run", exact: true }).click();
  await page.locator("#view-report:not([hidden])").waitFor();
  assert.equal(apiRequests.length, 20);
  assert.match(await page.locator("#progress-live").innerText(), /18 scored · 2 errors/);
  const reportHref = await page.locator("#view-report").getAttribute("href");
  const id = new URL(reportHref, base).searchParams.get("run");
  const run = await page.evaluate(id => JSON.parse(localStorage.getItem("alta2026-hands-on-run-v2:" + id)), id);
  assert.equal(run.cells.length, 20);
  assert.ok(!JSON.stringify(run).includes("fake-browser-test-key"));
  assert.equal(run.cells.filter(cell => cell.state === "error").length, 2);
  await page.locator("#judge-name").fill("Changed after run");
  await page.locator("#view-report").click();
  await page.locator("#report-layout:not([hidden])").waitFor();
  assert.match(await page.locator("#report-meta").innerText(), /Career agent evaluator/);
  assert.ok(!(await page.locator("body").innerText()).includes("Changed after run"));
  assert.equal(apiRequests.length, 20, "Opening the report must not call a model");
  await page.locator("#scenario-nav").getByRole("button", { name: /Connect jobs and training/ }).click();
  assert.equal(await page.evaluate(() => document.activeElement.getAttribute("aria-current")), "true");
  await page.getByRole("tab", { name: /^Cases/ }).click();
  const index = run.cells.findIndex(cell => cell.caseId === "training-b" && cell.replicate === 1);
  const row = page.locator(`#case-${index}`);
  await row.locator(":scope > summary").click();
  await row.locator(".case-columns").waitFor();
  assert.equal(await row.locator(".tool-message").count(), 2);
  assert.equal(await row.locator(".metric-row").count(), 8);
  const argument = row.locator(".metric-row").filter({ has: page.locator(".metric-name", { hasText: "Argument accuracy · find_courses · call 2" }) });
  await argument.locator("summary").click();
  assert.match(await argument.innerText(), /1\/5/);
  assert.match(await argument.innerText(), /Below threshold/);
  assert.match(await argument.innerText(), /Python instead of the SQL/);
  await argument.locator(".evidence-links a").click();
  assert.equal(await page.evaluate(() => document.activeElement.id), `evidence-${index}-call-2`);
  assert.match(await row.locator(".repeat-table").innerText(), /1–1/);
  if (process.env.WORKSHOP_SCREENSHOTS) {
    await mkdir(process.env.WORKSHOP_SCREENSHOTS, { recursive: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: join(process.env.WORKSHOP_SCREENSHOTS, "report-desktop.png") });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  if (process.env.WORKSHOP_SCREENSHOTS) await page.screenshot({ path: join(process.env.WORKSHOP_SCREENSHOTS, "report-mobile.png"), fullPage: true });
  await page.reload();
  await page.locator("#cases-panel:not([hidden])").waitFor();
  assert.equal(await page.locator("#scenario-nav [aria-current=true]").innerText(), "Connect jobs and training\n4/6");
  await page.locator("#case-search").fill("Trace B");
  assert.equal(await page.locator(".report-case").count(), 2);
  await page.locator("#failed-only").check();
  assert.equal(await page.locator(".report-case").count(), 2);
  await page.getByRole("tab", { name: /^Cases/ }).focus();
  await page.keyboard.press("ArrowLeft");
  assert.equal(await page.getByRole("tab", { name: "Overview", exact: true }).getAttribute("aria-selected"), "true");
  await page.getByRole("link", { name: "Back to judge builder" }).click();
  await page.locator("#run:not([disabled])").waitFor();
  assert.equal(await page.locator("#judge-name").inputValue(), "Changed after run");
  await page.locator("#judge-template").selectOption("blank");
  await page.locator("#load-template").click();
  assert.equal(await page.locator("#criteria .criterion-editor").count(), 0);
  await page.locator("#run").click();
  assert.match(await page.locator("#panel-error").innerText(), /instructions/);
  await page.locator("#judge-prompt").fill("Check the next tool call.");
  await page.locator("#add-criterion").click();
  await page.locator('[data-field="name"]').fill("Constraint extraction");
  await page.locator('[data-field="rubric"]').fill("The arguments preserve all user constraints.");
  await page.locator('[data-field="target"]').selectOption("tool_call");
  await page.locator('#scenario-selection input[value="job-search"]').uncheck();
  await page.locator('#scenario-selection input[value="jobs-training"]').uncheck();
  await page.locator("#run").click();
  assert.match(await page.locator("#panel-error").innerText(), /No criteria apply/);
  assert.equal(apiRequests.length, 20);
  await page.getByRole("button", { name: "Remove Constraint extraction", exact: true }).click();
  assert.equal(await page.locator("#criteria .criterion-editor").count(), 0);
  if (process.env.WORKSHOP_SCREENSHOTS) await page.screenshot({ path: join(process.env.WORKSHOP_SCREENSHOTS, "builder-mobile.png"), fullPage: true });

  const missing = await context.newPage();
  await missing.goto(base + "report.html?run=missing");
  assert.match(await missing.locator("#report-empty").innerText(), /Report unavailable/);

  const legacyContext = await browser.newContext();
  await legacyContext.addInitScript(() => {
    if (!localStorage.getItem("legacy-test-initialized")) {
      localStorage.setItem("alta2026-hands-on-v1", JSON.stringify({ apiKey: "fake-legacy-key", model: "legacy-model", n: 2, temperature: .5, prompt: "My previous judge instructions" }));
      localStorage.setItem("legacy-test-initialized", "true");
    }
  });
  const legacy = await legacyContext.newPage();
  await legacy.goto(base); await legacy.locator("#run:not([disabled])").waitFor();
  assert.equal(await legacy.locator("#judge-prompt").inputValue(), "My previous judge instructions");
  assert.equal(await legacy.locator("#model").inputValue(), "legacy-model");
  assert.equal(await legacy.locator("#criteria .criterion-editor").count(), 3);
  await legacyContext.close();

  const cancelContext = await browser.newContext();
  await cancelContext.addInitScript(() => localStorage.setItem("alta2026-hands-on-v1", JSON.stringify({ apiKey: "fake-cancel-key" })));
  let cancelRequests = 0;
  await cancelContext.route("https://openrouter.ai/api/v1/chat/completions", async route => {
    cancelRequests++;
    await new Promise(resolve => setTimeout(resolve, 1000));
    await route.fulfill({ json: { choices: [] } }).catch(() => {});
  });
  const cancel = await cancelContext.newPage();
  await cancel.goto(base); await cancel.locator("#run:not([disabled])").waitFor();
  await cancel.locator("#run").click();
  await cancel.locator("#cancel:not([hidden])").waitFor();
  await cancel.locator("#cancel").click();
  await cancel.locator("#view-report:not([hidden])").waitFor();
  assert.match(await cancel.locator("#progress-live").innerText(), /10 cancelled/);
  assert.ok(cancelRequests <= 3);
  await cancelContext.close();

  const quotaContext = await browser.newContext();
  await quotaContext.addInitScript(() => {
    localStorage.setItem("alta2026-hands-on-v1", JSON.stringify({ apiKey: "fake-quota-key" }));
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key.startsWith("alta2026-hands-on-run-v2:")) throw new DOMException("Full", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  const quota = await quotaContext.newPage();
  await quota.goto(base); await quota.locator("#run:not([disabled])").waitFor();
  await quota.locator("#run").click();
  assert.match(await quota.locator("#panel-error").innerText(), /could not save/);
  await quota.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === "alta2026-hands-on-connection-v1") throw new DOMException("Blocked", "SecurityError");
      return original.call(this, key, value);
    };
  });
  await quota.getByRole("button", { name: "Settings", exact: true }).click();
  await quota.locator("#forget-key").click();
  assert.match(await quota.locator("#settings-error").innerText(), /could not save/);
  assert.match(await quota.locator("#key-status").innerText(), /API key saved/);
  await quotaContext.close();

  const redirect = await context.newPage();
  await redirect.goto(starterBase + `report.html?run=${id}&view=cases&scenario=jobs-training#saved-report`);
  await redirect.waitForURL(url => url.pathname.endsWith("/advanced/report.html"));
  await redirect.locator("#report-layout:not([hidden])").waitFor();
  assert.equal(new URL(redirect.url()).searchParams.get("run"), id);
  assert.equal(new URL(redirect.url()).searchParams.get("view"), "cases");
  assert.equal(new URL(redirect.url()).hash, "#saved-report");
  await redirect.close();

  const starter = await context.newPage();
  starter.on("pageerror", error => errors.push(error.message));
  await starter.goto(starterBase);
  await starter.locator("#cases .case").last().waitFor();
  assert.equal(await starter.locator("#cases .case").count(), 4);
  assert.equal(await starter.locator("#criteria").count(), 0);
  assert.equal(await starter.locator("#judge-prompt").inputValue().then(text => text.startsWith("You are judging a career-advice agent")), true);
  await starter.locator("#run").click();
  await starter.waitForFunction(() => document.querySelector("#progress-live").textContent.includes("4 of 4 calls scored"));
  assert.equal(starterRequests, 4);
  assert.equal(await starter.locator("#summary-wrap tbody tr").count(), 4);
  assert.equal(await starter.locator("#chart svg").count(), 1);
  assert.equal(await starter.locator("#detail-wrap tbody tr").count(), 4);
  if (process.env.WORKSHOP_SCREENSHOTS) await starter.screenshot({ path: join(process.env.WORKSHOP_SCREENSHOTS, "starter-desktop.png") });
  await starter.setViewportSize({ width: 390, height: 844 });
  assert.equal(await starter.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await starter.locator("#judge-prompt").fill("Starter prompt kept separate");
  await starter.locator("#model").fill("starter-test-model");
  await starter.waitForFunction(() => JSON.parse(localStorage.getItem("alta2026-hands-on-v1")).model === "starter-test-model");
  await page.locator("#judge-prompt").fill("Advanced prompt kept separate");
  await page.locator("#model").fill("advanced-test-model");
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("alta2026-hands-on-advanced-settings-v2")).model === "advanced-test-model");
  await starter.reload();
  assert.equal(await starter.locator("#model").inputValue(), "starter-test-model");
  assert.equal(await starter.locator("#judge-prompt").inputValue(), "Starter prompt kept separate");
  await page.reload(); await page.locator("#run:not([disabled])").waitFor();
  assert.equal(await page.locator("#model").inputValue(), "advanced-test-model");
  assert.equal(await page.locator("#judge-prompt").inputValue(), "Advanced prompt kept separate");
  await page.locator("#open-settings").click();
  await page.locator("#settings-key").fill("shared-updated-key");
  await page.locator("#settings-base").fill("https://api.example.test/v1");
  await page.locator("#settings-dialog").getByRole("button", { name: "Save", exact: true }).click();
  await starter.locator("#open-settings").click();
  assert.equal(await starter.locator("#settings-key").inputValue(), "shared-updated-key");
  assert.equal(await starter.locator("#settings-base").inputValue(), "https://api.example.test/v1");
  await starter.locator("#forget-key").click();
  await starter.locator("#settings-close").click();
  await page.waitForFunction(() => document.querySelector("#key-status").textContent.startsWith("No API key"));
  await starter.locator("#open-settings").click();
  await starter.locator("#settings-key").fill("shared-second-key");
  await starter.locator("#settings-dialog").getByRole("button", { name: "Save", exact: true }).click();
  await page.waitForFunction(() => document.querySelector("#key-status").textContent.includes("API key saved"));
  await page.locator("#open-settings").click();
  await page.locator("#forget-key").click();
  await page.locator("#settings-close").click();
  await starter.waitForFunction(() => document.querySelector("#key-status").textContent.startsWith("No API key"));
  await starter.locator("#judge-prompt").fill("Starter prompt edited after removing key");
  await starter.waitForFunction(() => JSON.parse(localStorage.getItem("alta2026-hands-on-v1")).prompt === "Starter prompt edited after removing key");
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("alta2026-hands-on-connection-v1")).apiKey), "");
  assert.equal(await starter.evaluate(() => Object.hasOwn(JSON.parse(localStorage.getItem("alta2026-hands-on-v1")), "apiKey")), false);
  await page.reload(); await page.locator("#run:not([disabled])").waitFor();
  assert.match(await page.locator("#key-status").innerText(), /No API key/);
  assert.equal(apiRequests.length, 20);
  assert.deepEqual(errors, []);
  console.log("Browser checks passed: restored four-case starter with inline chart/table, 20 mocked advanced evaluations, per-call evidence, report redirects, independent prompts/models, shared connection updates/removal across tabs, saved reports, mobile/keyboard checks, migration, cancellation and storage failures.");
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  await rm(root, { recursive: true, force: true });
}
