import { TARGETS, createRun, targetsFor, callJudge, evaluateRun, cleanKey, normaliseBaseUrl, cellStatus, runSummary } from "./core.mjs";
import { DRAFT_KEY, writeJSON, loadSettings, saveSettings, restoreJudge, saveRun, listRuns } from "./storage.mjs";
import { CONNECTION_KEY, readConnection, writeConnection } from "../connection.mjs";
import { h, newId, badge, showError, transcript, toolDefinitions } from "./ui.mjs";

const $ = selector => document.querySelector(selector);
const DEFAULT_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "anthropic/claude-haiku-5.5";
let storage;
try { storage = localStorage; } catch { /* Storage errors are explained before a run. */ }
let settings = loadSettings(storage);
let scenarios = [];
let templates = [];
let judge;
let activeController = null;
let pendingRun = false;
let draftTimer;

$("#model").value = settings.model || DEFAULT_MODEL;
$("#temperature").value = settings.temperature ?? 0;
$("#n").value = settings.n ?? 1;
$("#run-id").value = runName();
updateKeyStatus();
renderSavedReports();

try {
  const responses = await Promise.all([fetch("data/scenarios.json"), fetch("prompts/judges.json")]);
  if (responses.some(response => !response.ok)) throw new Error("Workshop assets could not be loaded. Rebuild and serve the site with scripts/render-slides.sh and scripts/preview-site.sh.");
  const [data, prompts] = await Promise.all(responses.map(response => response.json()));
  scenarios = data.scenarios;
  templates = prompts.judges;
  const draft = restoreJudge(storage, templates[0], newId);
  judge = draft.judge;
  $("#judge-template").replaceChildren(...templates.map(template => h("option", { value: template.id }, template.name)), h("option", { value: "blank" }, "Blank judge — start from scratch"));
  renderJudge();
  renderScenarios(draft.selectedScenarios);
  $("#judge-builder").disabled = false;
  $("#run").disabled = false;
  updateCallCount();
} catch (error) { showError($("#startup-error"), error); }

function runName() {
  const left = ["quiet", "brisk", "cedar", "lunar", "copper", "bold", "silver", "clear"];
  const right = ["harbor", "ledger", "orchid", "falcon", "meadow", "willow", "comet", "lantern"];
  return `${left[Math.floor(Math.random() * left.length)]}-${right[Math.floor(Math.random() * right.length)]}`;
}

function readJudge() {
  return {
    id: judge.id, name: $("#judge-name").value.trim(), instructions: $("#judge-prompt").value,
    criteria: [...$("#criteria").children].map(card => ({
      id: card.dataset.id,
      name: card.querySelector('[data-field="name"]').value.trim(),
      target: card.querySelector('[data-field="target"]').value,
      threshold: Number(card.querySelector('[data-field="threshold"]').value),
      rubric: card.querySelector('[data-field="rubric"]').value,
    })),
  };
}

function renderJudge() {
  $("#judge-name").value = judge.name;
  $("#judge-prompt").value = judge.instructions;
  $("#criteria").replaceChildren(...judge.criteria.map(criterion => {
    const card = h("fieldset", { class: "criterion-editor", "data-id": criterion.id });
    card.append(h("legend", {}, criterion.name || "New criterion"));
    const fields = h("div", { class: "criterion-fields" });
    const input = (field, label, type = "text") => {
      const el = h("input", { type, "data-field": field, ...(type === "number" ? { min: 1, max: 5, step: 1 } : {}) });
      el.value = criterion[field];
      fields.append(h("label", {}, [h("span", { class: "field-label" }, label), el]));
    };
    input("name", "Criterion name");
    const select = h("select", { "data-field": "target" }, Object.entries(TARGETS).map(([value, label]) => h("option", { value }, label)));
    select.value = criterion.target;
    fields.append(h("label", {}, [h("span", { class: "field-label" }, "Evaluate"), select]));
    input("threshold", "Pass at", "number");
    const rubric = h("textarea", { "data-field": "rubric", rows: 3 });
    rubric.value = criterion.rubric;
    const remove = h("button", { type: "button", class: "ghost tiny danger", "aria-label": `Remove ${criterion.name || "criterion"}` }, "Remove");
    remove.addEventListener("click", () => {
      judge = readJudge();
      judge.criteria = judge.criteria.filter(item => item.id !== criterion.id);
      renderJudge(); persistDraft(); updateCallCount();
    });
    card.append(fields, h("label", {}, [h("span", { class: "field-label" }, "Rubric"), rubric]), remove);
    return card;
  }));
}

function selectedScenarios() {
  return scenarios.filter(scenario => $("#scenario-selection").querySelector(`input[value="${scenario.id}"]`)?.checked);
}

function renderScenarios(selectedIds) {
  $("#scenario-selection").replaceChildren(...scenarios.map(scenario => {
    const input = h("input", { type: "checkbox", value: scenario.id, checked: !Array.isArray(selectedIds) || selectedIds.includes(scenario.id) });
    input.addEventListener("change", () => { updateCallCount(); persistDraft(); });
    return h("label", { class: "scenario-option" }, [input, h("span", {}, [h("strong", {}, scenario.title), h("small", {}, `${scenario.cases.length} traces · ${scenario.description}`)])]);
  }));
  $("#cases").replaceChildren(...scenarios.map(scenario => {
    const section = h("section", { class: "scenario-preview" });
    section.append(h("h3", {}, scenario.title));
    if (scenario.tools.length) section.append(toolDefinitions(scenario.tools));
    for (const item of scenario.cases) {
      const details = h("details", { class: "trace-preview" });
      const count = item.messages.filter(message => message.toolCall).length;
      details.append(h("summary", {}, `${item.label} · ${count} tool call${count === 1 ? "" : "s"}`), transcript(item, `preview-${scenario.id}-${item.id}`));
      section.append(details);
    }
    return section;
  }));
}

function updateCallCount() {
  if (!judge) return;
  const current = readJudge();
  const selected = selectedScenarios();
  const items = selected.flatMap(scenario => scenario.cases);
  const applicable = items.filter(item => targetsFor(current, item).length);
  const repeats = Number($("#n").value);
  const valid = Number.isInteger(repeats) && repeats >= 1 && repeats <= 5;
  $("#call-count").textContent = valid
    ? `${selected.length} scenarios · ${items.length} traces · ${applicable.length} × ${repeats} = ${applicable.length * repeats} judge requests.${items.length > applicable.length ? ` ${items.length - applicable.length} traces have no applicable criteria.` : ""}`
    : "Choose 1–5 repeats per trace.";
}

function persistDraft() {
  if (!judge) return;
  judge = readJudge();
  try {
    writeJSON(storage, DRAFT_KEY, { judge, selectedScenarios: selectedScenarios().map(scenario => scenario.id) });
    const nextSettings = { ...settings, model: $("#model").value.trim(), temperature: Number($("#temperature").value), n: Number($("#n").value) };
    saveSettings(storage, nextSettings);
    settings = nextSettings;
    $("#draft-status").textContent = "Judge saved in this browser. Loading a starting point replaces this draft.";
  } catch (error) { $("#draft-status").textContent = error.message; }
}

$("#judge-builder").addEventListener("input", event => {
  if (event.target.dataset.field === "name") {
    const card = event.target.closest(".criterion-editor");
    card.querySelector("legend").textContent = event.target.value.trim() || "New criterion";
    card.querySelector("button").setAttribute("aria-label", `Remove ${event.target.value.trim() || "criterion"}`);
  }
  updateCallCount();
  clearTimeout(draftTimer); draftTimer = setTimeout(persistDraft, 250);
});
for (const selector of ["#model", "#temperature", "#n"]) $(selector).addEventListener("input", () => { updateCallCount(); persistDraft(); });
$("#load-template").addEventListener("click", () => {
  judge = $("#judge-template").value === "blank"
    ? { id: newId(), name: "My judge", instructions: "", criteria: [] }
    : { ...structuredClone(templates.find(template => template.id === $("#judge-template").value)), id: newId() };
  renderJudge(); persistDraft(); updateCallCount(); $("#judge-name").focus();
});
$("#add-criterion").addEventListener("click", () => {
  judge = readJudge();
  judge.criteria.push({ id: newId(), name: "", rubric: "", target: "answer", threshold: 4 });
  renderJudge(); persistDraft(); updateCallCount();
  $("#criteria").lastElementChild.querySelector("input").focus();
});
$("#shuffle-id").addEventListener("click", () => { if (!activeController) $("#run-id").value = runName(); });
$("#cancel").addEventListener("click", () => activeController?.abort());

$("#run").addEventListener("click", () => {
  updateKeyStatus();
  showError($("#panel-error"));
  try {
    makeRun();
    if (!cleanKey(settings.apiKey)) {
      pendingRun = true; $("#key-input").value = ""; showError($("#key-error")); $("#key-dialog").showModal();
    } else startRun();
  } catch (error) { showError($("#panel-error"), error); }
});

function makeRun() {
  const run = createRun({ id: newId(), name: $("#run-id").value, judge: readJudge(), scenarios: selectedScenarios(),
    model: $("#model").value, temperature: Number($("#temperature").value), n: Number($("#n").value) });
  if (!run.cells.some(cell => cell.targets.length)) throw new Error("No criteria apply to the selected traces. Add an answer/whole-trace criterion or select a tool scenario.");
  return run;
}

async function startRun() {
  if (activeController) return;
  let run, baseUrl;
  try {
    run = makeRun(); baseUrl = normaliseBaseUrl(settings.baseUrl || DEFAULT_BASE);
    saveRun(storage, run);
  } catch (error) { showError($("#panel-error"), error); return; }
  clearTimeout(draftTimer); persistDraft();
  const apiKey = cleanKey(settings.apiKey);
  const controller = new AbortController();
  activeController = controller;
  $("#run").disabled = true; $("#cancel").hidden = false;
  $("#judge-builder").disabled = true;
  $("#results").hidden = false; $("#view-report").hidden = true;
  $("#view-report").removeAttribute("download"); $("#view-report").textContent = "View report";
  showError($("#report-error"));
  $("#results-heading").textContent = run.name;
  $("#results-meta").textContent = `${run.judge.name} · ${run.model} · temperature ${run.temperature} · ${run.n} repeat${run.n === 1 ? "" : "s"}`;
  const renderProgress = () => {
    const summary = runSummary(run.cells);
    $("#progress-live").textContent = `${summary.scored} scored · ${summary.error} errors · ${summary.cancelled} cancelled · ${summary.queued + summary.running} remaining`;
    $("#run-status").replaceChildren(...run.cells.map(cell => h("li", {}, [badge(cellStatus(cell)), h("span", {}, `${run.scenarios.find(scenario => scenario.id === cell.scenarioId).title} / ${cell.label} · repeat ${cell.replicate}${cell.error ? ` — ${cell.error}` : ""}`)])));
  };
  try {
    await evaluateRun(run, { signal: controller.signal, onUpdate: renderProgress, worker: cell => {
      const scenario = run.scenarios.find(item => item.id === cell.scenarioId);
      const item = scenario.cases.find(item => item.id === cell.caseId);
      return callJudge({ baseUrl, apiKey, model: run.model, temperature: run.temperature, judge: run.judge, scenario, item, signal: controller.signal });
    } });
  } finally {
    activeController = null; $("#run").disabled = false; $("#cancel").hidden = true; $("#judge-builder").disabled = false;
    try {
      saveRun(storage, run);
      $("#view-report").href = `report.html?run=${encodeURIComponent(run.id)}`;
      $("#view-report").hidden = false;
      renderSavedReports();
    } catch (error) {
      showError($("#report-error"), `${error.message} Download the results to keep a copy.`);
      const download = $("#view-report");
      if (download.dataset.blob) URL.revokeObjectURL(download.dataset.blob);
      const url = URL.createObjectURL(new Blob([JSON.stringify(run, null, 2)], { type: "application/json" }));
      download.dataset.blob = url; download.href = url; download.download = "evaluation-results.json"; download.textContent = "Download results"; download.hidden = false;
    }
  }
}

function renderSavedReports() {
  const runs = listRuns(storage);
  $("#saved-reports").hidden = !runs.length;
  $("#saved-report-list").replaceChildren(...runs.map(run => h("li", {}, [h("a", { href: `report.html?run=${encodeURIComponent(run.id)}` }, run.name), ` · ${run.judge.name} · ${new Date(run.createdAt).toLocaleString()}`])));
}

function updateKeyStatus() {
  Object.assign(settings, readConnection(storage));
  $("#key-status").textContent = cleanKey(settings.apiKey) ? "API key saved in this browser" : "No API key yet — add it when you run";
}
function openSettings() {
  updateKeyStatus();
  $("#settings-key").value = settings.apiKey || ""; $("#settings-key").type = "password"; $("#settings-show-key").checked = false;
  $("#settings-base").value = settings.baseUrl || DEFAULT_BASE; showError($("#settings-error")); $("#settings-dialog").showModal();
}
$("#open-settings").addEventListener("click", openSettings);
$("#key-status").addEventListener("click", openSettings);
$("#settings-show-key").addEventListener("change", () => { $("#settings-key").type = $("#settings-show-key").checked ? "text" : "password"; });
$("#settings-close").addEventListener("click", () => $("#settings-dialog").close());
$("#settings-form").addEventListener("submit", event => {
  event.preventDefault();
  try {
    const next = { ...settings, apiKey: cleanKey($("#settings-key").value), baseUrl: normaliseBaseUrl($("#settings-base").value) };
    writeConnection(storage, next); settings = next; updateKeyStatus(); $("#settings-dialog").close();
  } catch (error) { showError($("#settings-error"), error); }
});
$("#forget-key").addEventListener("click", () => {
  try {
    const next = { ...settings, apiKey: "" };
    writeConnection(storage, next);
    settings = next; $("#settings-key").value = ""; updateKeyStatus();
  } catch (error) { showError($("#settings-error"), error); }
});
$("#key-form").addEventListener("submit", event => {
  event.preventDefault();
  try {
    const key = cleanKey($("#key-input").value);
    if (!key) throw new Error("Paste an API key to continue.");
    const next = { ...settings, apiKey: key };
    writeConnection(storage, next); settings = next; updateKeyStatus();
    const shouldRun = pendingRun; pendingRun = false; $("#key-dialog").close();
    if (shouldRun) startRun();
  } catch (error) { showError($("#key-error"), error); }
});
$("#key-cancel").addEventListener("click", () => $("#key-dialog").close());
$("#key-dialog").addEventListener("close", () => { pendingRun = false; });
window.addEventListener("beforeunload", event => { if (activeController) { event.preventDefault(); event.returnValue = ""; } });
window.addEventListener("pagehide", () => { clearTimeout(draftTimer); persistDraft(); });
window.addEventListener("storage", event => { if (event.key === CONNECTION_KEY || event.key === null) updateKeyStatus(); });
