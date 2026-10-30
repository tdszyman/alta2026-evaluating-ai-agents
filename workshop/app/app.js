import { TARGETS, createRun, targetsFor, callJudge, evaluateRun, cleanKey, normaliseBaseUrl, cellStatus, runSummary } from "./advanced/core.mjs";
import { DRAFT_KEY, readJSON, writeJSON, loadSettings, saveSettings, restoreJudge, saveRun, loadRun, listRuns } from "./advanced/storage.mjs";
import { CONNECTION_KEY, readConnection, writeConnection, DEFAULT_BASE } from "./connection.mjs";
import { h, newId, badge, showError, transcript, toolDefinitions } from "./advanced/ui.mjs";
import { ROUNDS, STEPS, loadWorkflow, saveWorkflow, resolveRound, stepHref, validateRubric, addToolCriteria } from "./workflow.mjs";
import { exerciseNavigation, roundPicker } from "./workflow-ui.mjs";

const $ = selector => document.querySelector(selector);
const step = document.body.dataset.step;
let storage;
try { storage = localStorage; } catch { /* Save errors appear beside the exercise. */ }
let workflow = loadWorkflow(storage);
const round = resolveRound(location.search, workflow);
let settings = loadSettings(storage);
let judge;
let scenario;
let templates = [];
let activeController = null;
let activeRun = null;
let pendingRun = false;

renderNavigation();
$("#round-picker").append(roundPicker(round));
renderSavedReports();
setupSettings();

try {
  const responses = await Promise.all([fetch("advanced/data/scenarios.json"), fetch("advanced/prompts/judges.json")]);
  if (responses.some(response => !response.ok)) throw new Error("Workshop examples could not be loaded. Reload this page or try again from the hands-on page.");
  const [data, prompts] = await Promise.all(responses.map(response => response.json()));
  scenario = data.scenarios.find(item => item.id === round.id);
  templates = prompts.judges;
  const advice = templates.find(template => template.id === "career-advice");
  judge = restoreJudge(storage, advice, newId).judge;
  if (step === "cases") renderCases();
  if (step === "rubric") setupRubric();
  if (step === "judge") setupInstructions();
  if (step === "run") setupRun();
  persistSafely();
  renderNavigation();
} catch (error) { showError($("#startup-error"), error); }

function renderNavigation() {
  $("#step-navigation").replaceChildren(exerciseNavigation(round, step, workflow.latestRuns[round.id]));
  const index = STEPS.findIndex(item => item.id === step);
  const back = $("#previous-step");
  const next = $("#next-step");
  back.hidden = index === 0;
  if (index > 0) {
    back.href = stepHref(STEPS[index - 1].id, round.id);
    back.textContent = `Back: ${STEPS[index - 1].title.toLowerCase()}`;
  }
  next.hidden = !judge || step === "run";
  if (index < 3) {
    next.href = stepHref(STEPS[index + 1].id, round.id);
    next.textContent = `Next: ${STEPS[index + 1].title.toLowerCase()}`;
  }
}

function readPage() {
  if (step === "rubric") {
    judge.name = $("#judge-name").value.trim();
    judge.criteria = [...$("#criteria").children].map(card => ({
      id: card.dataset.id,
      ...Object.fromEntries(["name", "target", "rubric"].map(field => [field, card.querySelector(`[data-field="${field}"]`).value])),
      threshold: Number(card.querySelector('[data-field="threshold"]').value),
    }));
  }
  if (step === "judge") judge.instructions = $("#judge-prompt").value;
  if (step === "run") Object.assign(settings, {
    model: $("#model").value.trim(), temperature: Number($("#temperature").value), n: Number($("#n").value),
  });
}

function persistPage() {
  if (!judge) return;
  readPage();
  const previous = readJSON(storage, DRAFT_KEY, {});
  writeJSON(storage, DRAFT_KEY, { ...previous, judge });
  if (step === "run") saveSettings(storage, settings);
  workflow = saveWorkflow(storage, { round: round.id, step,
    ...(step === "run" ? { runNames: { [round.id]: $("#run-id").value } } : {}),
  });
}

function persistSafely() {
  try {
    persistPage(); showError($("#save-error"));
    $("#draft-status").textContent = "Your judge is saved in this browser and carries forward to the next round.";
    return true;
  } catch (error) {
    showError($("#save-error"), error);
    $("#draft-status").textContent = "Your latest changes have not been saved.";
    return false;
  }
}

function validateStep() {
  if (step === "rubric") validateRubric(judge);
  if (step === "judge" && !judge.instructions?.trim()) throw new Error("Write instructions for your judge before continuing.");
}

// Use normal links and full page loads. Flush edits before every navigation,
// including clicks that occur immediately after typing and modified clicks.
document.addEventListener("click", event => {
  const link = event.target.closest("a[href]");
  if (!link || link.hasAttribute("download") || link.getAttribute("href").startsWith("#")) return;
  if (activeController) { event.preventDefault(); return; }
  if (!judge) return;
  if (!persistSafely()) { event.preventDefault(); return; }
  const destination = new URL(link.href, location.href);
  const target = STEPS.findIndex(item => destination.pathname.endsWith("/" + item.file));
  if (target > STEPS.findIndex(item => item.id === step)) {
    try { validateStep(); showError($("#page-error")); }
    catch (error) { event.preventDefault(); showError($("#page-error"), error); $("#page-error").scrollIntoView({ block: "center" }); }
  }
});

$("#round-select").addEventListener("change", event => {
  if (!activeController && persistSafely()) location.href = stepHref("cases", event.target.value);
  else event.target.value = round.id;
});

window.addEventListener("pageshow", event => { if (event.persisted) location.reload(); });
window.addEventListener("pagehide", () => {
  // A refresh or navigation stops the current run. No page resumes paid calls.
  if (activeRun && activeController) {
    activeController.abort();
    try { saveRun(storage, activeRun); } catch { /* The visible save error was shown before leaving. */ }
  }
  if (judge) persistSafely();
});

function renderCases() {
  $("#cases-heading").textContent = scenario.title;
  $("#round-description").textContent = scenario.description;
  if (scenario.tools.length) $("#cases").append(toolDefinitions(scenario.tools));
  for (const [index, item] of scenario.cases.entries()) {
    const details = h("details", { class: "trace-preview", open: index === 0 });
    details.append(h("summary", {}, item.label), transcript(item, `preview-${round.id}-${item.id}`));
    $("#cases").append(details);
  }
}

function setupRubric() {
  $("#judge-name").value = judge.name;
  $("#judge-template").replaceChildren(...templates.map(template => h("option", { value: template.id }, template.name)), h("option", { value: "blank" }, "Blank rubric"));
  $("#judge-template").value = round.tools ? "career-agent" : "career-advice";
  $("#tool-criteria-offer").hidden = round.id !== "jobs-training";
  renderCriteria();
  $("#judge-builder").disabled = false;
  $("#judge-builder").addEventListener("input", event => {
    if (event.target.dataset.field === "name") {
      const card = event.target.closest(".criterion-editor");
      const name = event.target.value.trim() || "New criterion";
      card.querySelector("legend").textContent = name;
      card.querySelector("button").setAttribute("aria-label", `Remove ${name}`);
    }
    persistSafely();
  });
  $("#load-template").addEventListener("click", () => {
    readPage();
    const template = templates.find(item => item.id === $("#judge-template").value);
    judge.criteria = template ? structuredClone(template.criteria) : [];
    renderCriteria(); persistSafely();
    $("#add-criterion").focus();
  });
  $("#add-criterion").addEventListener("click", () => {
    readPage(); judge.criteria.push({ id: newId(), name: "", rubric: "", target: "answer", threshold: 4 });
    renderCriteria(); persistSafely();
    $("#criteria").lastElementChild.querySelector("input").focus();
  });
  $("#add-tool-criteria").addEventListener("click", () => {
    readPage(); const count = judge.criteria.length;
    judge = addToolCriteria(judge, templates.find(item => item.id === "career-agent"));
    renderCriteria(); persistSafely();
    const added = judge.criteria.length - count;
    $("#tool-criteria-status").textContent = added ? `${added} draft criteria added. Edit them to match your rubric.` : "The suggested criteria are already in your rubric. Your edits have been kept.";
  });
}

function renderCriteria() {
  $("#criteria").replaceChildren(...judge.criteria.map(criterion => {
    const card = h("fieldset", { class: "criterion-editor", "data-id": criterion.id });
    card.append(h("legend", {}, criterion.name || "New criterion"));
    const fields = h("div", { class: "criterion-fields" });
    for (const [field, label] of [["name", "Criterion name"], ["target", "Evaluate"], ["threshold", "Pass at"]]) {
      const input = field === "target"
        ? h("select", { "data-field": field }, Object.entries(TARGETS).map(([value, text]) => h("option", { value }, text)))
        : h("input", { type: field === "threshold" ? "number" : "text", "data-field": field, ...(field === "threshold" ? { min: 1, max: 5, step: 1 } : {}) });
      input.value = criterion[field];
      fields.append(h("label", {}, [h("span", { class: "field-label" }, label), input]));
    }
    const rubric = h("textarea", { "data-field": "rubric", rows: 3 });
    rubric.value = criterion.rubric;
    const remove = h("button", { type: "button", class: "ghost tiny danger", "aria-label": `Remove ${criterion.name || "New criterion"}` }, "Remove");
    remove.addEventListener("click", () => {
      readPage(); judge.criteria = judge.criteria.filter(item => item.id !== criterion.id);
      renderCriteria(); persistSafely(); $("#add-criterion").focus();
    });
    card.append(fields, h("label", {}, [h("span", { class: "field-label" }, "Rubric"), rubric]), remove);
    return card;
  }));
}

function setupInstructions() {
  $("#judge-prompt").value = judge.instructions;
  $("#judge-prompt").disabled = false;
  $("#judge-prompt").addEventListener("input", persistSafely);
  for (const criterion of judge.criteria) $("#rubric-reference").append(h("h3", {}, criterion.name), h("p", {}, criterion.rubric), h("p", { class: "hint" }, `${TARGETS[criterion.target]} · Pass at ${criterion.threshold}/5`));
  if (!judge.criteria.length) $("#rubric-reference").append(h("p", {}, "Your rubric is empty. Return to the rubric page to add criteria."));
}

function setupRun() {
  $("#model").value = settings.model || "anthropic/claude-haiku-5.5";
  $("#temperature").value = settings.temperature ?? 0;
  $("#n").value = settings.n ?? 1;
  $("#run-id").value = workflow.runNames[round.id] || runName();
  $("#run-summary").textContent = `${scenario.title} · ${scenario.cases.length} recorded traces · ${judge.criteria.length} criteria`;
  $("#run-settings").disabled = false; $("#run").disabled = false;
  for (const selector of ["#model", "#temperature", "#n", "#run-id"]) $(selector).addEventListener("input", () => { updateCallCount(); persistSafely(); });
  $("#shuffle-id").addEventListener("click", () => { $("#run-id").value = runName(); persistSafely(); });
  $("#cancel").addEventListener("click", () => activeController?.abort());
  $("#run").addEventListener("click", () => {
    updateKeyStatus(); showError($("#panel-error"));
    try {
      readPage(); makeRun();
      if (!cleanKey(settings.apiKey)) {
        pendingRun = true; $("#key-input").value = ""; showError($("#key-error")); $("#key-dialog").showModal();
      } else startRun();
    } catch (error) { showError($("#panel-error"), error); }
  });
  const previous = loadRun(storage, workflow.latestRuns[round.id]);
  if (previous) { showRun(previous); setReportLink(previous); }
  updateCallCount(); updateKeyStatus();
}

function runName() { return `${round.id}-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}-${newId().slice(0, 4)}`; }

function updateCallCount() {
  const applicable = scenario.cases.filter(item => targetsFor(judge, item).length).length;
  const n = Number($("#n").value);
  $("#call-count").textContent = Number.isInteger(n) && n >= 1 && n <= 5
    ? `${applicable} traces × ${n} repeat${n === 1 ? "" : "s"} = ${applicable * n} judge requests.${applicable < scenario.cases.length ? ` ${scenario.cases.length - applicable} traces have no applicable criteria.` : ""}`
    : "Choose 1–5 repeats per trace.";
}

function makeRun() {
  const run = createRun({ id: newId(), name: $("#run-id").value, judge, scenarios: [scenario], model: $("#model").value,
    temperature: Number($("#temperature").value), n: Number($("#n").value) });
  if (!run.cells.some(cell => cell.targets.length)) throw new Error("No criteria apply to this round. Return to the rubric page and add an applicable criterion.");
  return run;
}

function showRun(run) {
  $("#results").hidden = false;
  $("#results-heading").textContent = run.name;
  $("#results-meta").textContent = `${run.judge.name} · ${run.model} · ${run.n} repeat${run.n === 1 ? "" : "s"}${!run.finishedAt && run !== activeRun ? " · Incomplete snapshot; no requests will resume automatically" : ""}`;
  const summary = runSummary(run.cells);
  $("#progress-live").textContent = `${summary.scored} scored · ${summary.error} errors · ${summary.cancelled} cancelled · ${summary.queued + summary.running} remaining`;
  $("#run-status").replaceChildren(...run.cells.map(cell => h("li", {}, [badge(cellStatus(cell)), h("span", {}, `${cell.label} · repeat ${cell.replicate}${cell.error ? ` — ${cell.error}` : ""}`)])));
}

function lockRun(locked) {
  $("#run-settings").disabled = locked; $("#run").disabled = locked;
  $("#cancel").hidden = !locked;
  $("#round-select").disabled = locked; $("#open-settings").disabled = locked; $("#key-status").disabled = locked;
  for (const link of document.querySelectorAll("#step-navigation a, .page-actions a, .header-actions a, #saved-reports a")) {
    if (locked) { link.setAttribute("aria-disabled", "true"); link.tabIndex = -1; }
    else { link.removeAttribute("aria-disabled"); link.removeAttribute("tabindex"); }
  }
}

function setReportLink(run) {
  $("#view-report").href = stepHref("review", round.id, run.id);
  $("#view-report").hidden = false;
  $("#view-report").textContent = "Review results";
  $("#view-report").removeAttribute("download");
}

async function startRun() {
  if (activeController) return;
  let run, baseUrl;
  try {
    persistPage(); run = makeRun(); baseUrl = normaliseBaseUrl(settings.baseUrl || DEFAULT_BASE);
    saveRun(storage, run);
    workflow = saveWorkflow(storage, { latestRuns: { [round.id]: run.id } });
  } catch (error) { showError($("#panel-error"), error); return; }
  const apiKey = cleanKey(settings.apiKey);
  const controller = new AbortController(); activeController = controller; activeRun = run;
  renderNavigation(); lockRun(true); showError($("#report-error"));
  $("#view-report").hidden = true;
  const onUpdate = () => {
    showRun(run);
    try { saveRun(storage, run); } catch (error) { showError($("#report-error"), error); }
  };
  try {
    await evaluateRun(run, { signal: controller.signal, onUpdate, worker: cell => {
      const item = run.scenarios[0].cases.find(item => item.id === cell.caseId);
      return callJudge({ baseUrl, apiKey, model: run.model, temperature: run.temperature, judge: run.judge, scenario: run.scenarios[0], item, signal: controller.signal });
    } });
  } finally {
    activeController = null; activeRun = null; lockRun(false);
    showRun(run);
    try {
      saveRun(storage, run); showError($("#report-error")); setReportLink(run); renderSavedReports();
    } catch (error) {
      showError($("#report-error"), `${error.message} Download these results to keep a copy.`);
      const link = $("#view-report");
      if (link.dataset.blob) URL.revokeObjectURL(link.dataset.blob);
      link.dataset.blob = URL.createObjectURL(new Blob([JSON.stringify(run, null, 2)], { type: "application/json" }));
      link.href = link.dataset.blob; link.download = "evaluation-results.json"; link.textContent = "Download results"; link.hidden = false;
    }
  }
}

function renderSavedReports() {
  if (!$("#saved-reports")) return;
  const runs = listRuns(storage);
  $("#saved-reports").hidden = !runs.length;
  $("#saved-report-list").replaceChildren(...runs.map(run => h("li", {}, [h("a", { href: `report.html?run=${encodeURIComponent(run.id)}` }, run.name), ` · ${run.judge.name} · ${new Date(run.createdAt).toLocaleString()}`])));
}

function updateKeyStatus() {
  Object.assign(settings, readConnection(storage));
  if ($("#key-status")) $("#key-status").textContent = cleanKey(settings.apiKey) ? "API key saved in this browser" : "No API key yet — add it when you run";
}

function setupSettings() {
  function openSettings() {
    updateKeyStatus();
    $("#settings-key").value = settings.apiKey || ""; $("#settings-key").type = "password"; $("#settings-show-key").checked = false;
    $("#settings-base").value = settings.baseUrl || DEFAULT_BASE; showError($("#settings-error")); $("#settings-dialog").showModal();
  }
  $("#open-settings").addEventListener("click", openSettings);
  $("#key-status")?.addEventListener("click", openSettings);
  $("#settings-show-key").addEventListener("change", () => { $("#settings-key").type = $("#settings-show-key").checked ? "text" : "password"; });
  $("#settings-close").addEventListener("click", () => $("#settings-dialog").close());
  $("#settings-form").addEventListener("submit", event => {
    event.preventDefault();
    try {
      const connection = { apiKey: cleanKey($("#settings-key").value), baseUrl: normaliseBaseUrl($("#settings-base").value) };
      writeConnection(storage, connection); Object.assign(settings, connection); updateKeyStatus(); $("#settings-dialog").close();
    } catch (error) { showError($("#settings-error"), error); }
  });
  $("#forget-key").addEventListener("click", () => {
    try { writeConnection(storage, { ...settings, apiKey: "" }); updateKeyStatus(); $("#settings-key").value = ""; }
    catch (error) { showError($("#settings-error"), error); }
  });
  $("#key-form").addEventListener("submit", event => {
    event.preventDefault();
    try {
      const apiKey = cleanKey($("#key-input").value);
      if (!apiKey) throw new Error("Paste an API key to continue.");
      writeConnection(storage, { ...settings, apiKey }); updateKeyStatus();
      const shouldRun = pendingRun; pendingRun = false; $("#key-dialog").close();
      if (shouldRun) startRun();
    } catch (error) { showError($("#key-error"), error); }
  });
  $("#key-cancel").addEventListener("click", () => $("#key-dialog").close());
  $("#key-dialog").addEventListener("close", () => { pendingRun = false; });
  window.addEventListener("storage", event => { if (event.key === CONNECTION_KEY || event.key === null) updateKeyStatus(); });
}
