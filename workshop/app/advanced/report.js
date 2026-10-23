import { TARGETS, cellStatus, runSummary, metricSummary } from "./core.mjs";
import { loadRun, listRuns } from "./storage.mjs";
import { h, fmt, badge, statusLabel, transcript, metricRow, toolDefinitions } from "./ui.mjs";

const $ = selector => document.querySelector(selector);
const params = new URLSearchParams(location.search);
let storage;
try { storage = localStorage; } catch { /* The empty state explains missing browser storage. */ }
const runs = listRuns(storage);
const requestedId = params.get("run");
const run = requestedId ? loadRun(storage, requestedId) : runs[0];
let scope = params.get("scenario") || "all";
let view = params.get("view") === "cases" ? "cases" : "overview";

if (!run) {
  $("#report-empty").hidden = false;
  $("#report-empty").append(h("h1", {}, "Report unavailable"), h("p", {}, requestedId
    ? "This run is not available in this browser. Reports are saved on the device and site address where you ran the exercise. Browser storage may have been cleared or disabled."
    : "No evaluations have been saved in this browser yet."), h("a", { href: "index.html" }, "Return to the judge builder"));
} else {
  if (scope !== "all" && !run.scenarios.some(scenario => scenario.id === scope)) scope = "all";
  document.title = `${run.name} — Evaluation report — ALTA 2026`;
  $("#report-layout").hidden = false;
  $("#report-title").textContent = run.name;
  $("#report-meta").textContent = `${run.judge.name} · ${run.model} · temperature ${run.temperature} · ${run.n} repeat${run.n === 1 ? "" : "s"} · ${new Date(run.createdAt).toLocaleString()}${run.finishedAt ? "" : " · Incomplete snapshot"}`;
  $("#report-run").replaceChildren(...runs.map(item => h("option", { value: item.id }, `${item.name} · ${item.judge.name}`)));
  $("#report-run").value = run.id;
  $("#report-run").addEventListener("change", () => { location.href = `report.html?run=${encodeURIComponent($("#report-run").value)}`; });
  $("#snapshot-content").append(h("h2", {}, run.judge.name), h("pre", {}, run.judge.instructions));
  for (const criterion of run.judge.criteria) $("#snapshot-content").append(h("h3", {}, criterion.name), h("p", {}, criterion.rubric), h("p", { class: "hint" }, `${TARGETS[criterion.target]} · Pass at ${criterion.threshold}/5`));
  render();
}

function cellsInScope() { return run.cells.filter(cell => scope === "all" || cell.scenarioId === scope); }

function updateLocation() {
  const query = new URLSearchParams({ run: run.id, view });
  if (scope !== "all") query.set("scenario", scope);
  history.replaceState(null, "", `?${query}${location.hash}`);
}

function switchView(next, focus = false) {
  view = next;
  for (const name of ["overview", "cases"]) {
    const selected = view === name;
    $("#tab-" + name).setAttribute("aria-selected", String(selected));
    $("#tab-" + name).tabIndex = selected ? 0 : -1;
    $("#" + name + "-panel").hidden = !selected;
  }
  if (focus) $("#tab-" + view).focus();
  updateLocation();
}

for (const name of ["overview", "cases"]) {
  $("#tab-" + name).addEventListener("click", () => switchView(name));
  $("#tab-" + name).addEventListener("keydown", event => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      switchView(event.key === "Home" ? "overview" : event.key === "End" ? "cases" : name === "overview" ? "cases" : "overview", true);
    }
  });
}
$("#case-search").addEventListener("input", renderCases);
$("#failed-only").addEventListener("change", renderCases);

function render() {
  renderNavigation(); renderOverview(); renderCases(); switchView(view);
}

function renderNavigation() {
  const options = [{ id: "all", title: "All scenarios" }, ...run.scenarios];
  $("#scenario-nav").replaceChildren(...options.map(scenario => {
    const cells = run.cells.filter(cell => scenario.id === "all" || cell.scenarioId === scenario.id);
    const summary = runSummary(cells);
    const button = h("button", { type: "button", class: "scenario-nav-item", "aria-current": scope === scenario.id ? "true" : null }, [
      h("span", {}, scenario.title), h("span", { class: "nav-count" }, `${summary.passed}/${summary.scored}`),
    ]);
    button.title = `${summary.passed} passing of ${summary.scored} scored trace evaluations; ${summary.error} evaluation errors`;
    button.addEventListener("click", () => { scope = scenario.id; render(); $("#scenario-nav [aria-current=true]").focus(); });
    return button;
  }));
}

function renderOverview() {
  const cells = cellsInScope();
  const summary = runSummary(cells);
  const cards = h("div", { class: "stat-grid" });
  for (const [label, value, note] of [
    ["Trace pass rate", summary.passRate == null ? "—" : `${Math.round(summary.passRate * 100)}%`, `${summary.passed} passing of ${summary.scored} scored`],
    ["Below threshold", summary.failed, "One or more criteria below threshold"],
    ["Evaluation errors", summary.error, "No valid judge scores returned"],
    ["Completed", `${summary.scored + summary.error + summary.cancelled + summary.not_applicable}/${summary.total}`, `${summary.cancelled} cancelled · ${summary.not_applicable} not applicable`],
  ]) cards.append(h("div", { class: "stat" }, [h("h2", {}, label), h("strong", {}, value), h("p", {}, note)]));
  const panel = $("#overview-panel");
  panel.replaceChildren(cards);
  panel.append(h("p", { class: "hint" }, "A trace evaluation passes when all applicable criteria meet their saved thresholds. Errors, cancelled and not-applicable evaluations are excluded from pass rates. Each repeat counts separately."));

  const table = h("table");
  table.append(h("caption", {}, "Scores by criterion"), h("thead", {}, h("tr", {}, ["Criterion", "Target", "Mean", "Range", "Passing scores"].map(label => h("th", { scope: "col" }, label)))));
  const body = h("tbody");
  for (const row of metricSummary(cells, run.judge)) body.append(h("tr", {}, [
    h("th", { scope: "row" }, row.name), h("td", {}, TARGETS[row.target]), h("td", {}, fmt(row.mean)),
    h("td", {}, row.count ? `${row.min}–${row.max}` : "—"), h("td", {}, row.count ? `${row.passed}/${row.count} · pass ≥ ${row.threshold}` : "No scores"),
  ]));
  table.append(body);
  panel.append(h("div", { class: "report-card table-scroll" }, table), h("p", { class: "hint" }, "Means and ranges use successful judge responses only. Tool criteria include one score per call. Open a case to see each call separately and compare its repeats."));

  const attention = cells.filter(cell => ["failed", "error"].includes(cellStatus(cell)));
  if (attention.length) {
    const section = h("section", { class: "report-card attention" }, h("h2", {}, "Needs attention"));
    for (const cell of attention) {
      const button = h("button", { type: "button", class: "attention-row" }, [badge(cellStatus(cell)), `${scenarioFor(cell).title} / ${cell.label} · repeat ${cell.replicate}`, h("span", { class: "attention-link" }, "View")]);
      button.addEventListener("click", () => {
        $("#case-search").value = ""; $("#failed-only").checked = false;
        switchView("cases"); renderCases();
        const row = document.getElementById(`case-${run.cells.indexOf(cell)}`);
        row.open = true; row.querySelector("summary").focus(); row.scrollIntoView({ block: "start" });
      });
      section.append(button);
    }
    panel.append(section);
  }
}

function scenarioFor(cell) { return run.scenarios.find(scenario => scenario.id === cell.scenarioId); }

function renderCases() {
  if (!run) return;
  const cells = cellsInScope();
  const search = $("#case-search").value.trim().toLowerCase();
  const failedOnly = $("#failed-only").checked;
  const visible = cells.filter(cell => {
    const scenario = scenarioFor(cell);
    const item = scenario.cases.find(item => item.id === cell.caseId);
    return (!failedOnly || cellStatus(cell) === "failed") && (!search || `${scenario.title} ${cell.label} ${JSON.stringify(item.messages)}`.toLowerCase().includes(search));
  });
  $("#case-count").textContent = cells.length;
  $("#case-filter-count").textContent = `${visible.length} of ${cells.length} trace evaluations${failedOnly ? " · below threshold only" : ""}`;
  $("#report-cases").replaceChildren(...visible.map(renderCase));
  if (!visible.length) $("#report-cases").append(h("p", { class: "empty-cases" }, "No cases match these filters. Clear the search or turn off the threshold filter."));
}

function renderCase(cell) {
  const scenario = scenarioFor(cell);
  const item = scenario.cases.find(item => item.id === cell.caseId);
  const index = run.cells.indexOf(cell);
  const prefix = `evidence-${index}`;
  const row = h("details", { id: `case-${index}`, class: "report-case" });
  row.append(h("summary", {}, [h("span", { class: "case-title" }, `${item.label}${run.n > 1 ? ` · repeat ${cell.replicate}` : ""}`), h("span", { class: "case-scenario" }, scenario.title), badge(cellStatus(cell))]));
  // Build only the expanded row, preserving the state of its nested metric panels.
  let built = false;
  row.addEventListener("toggle", () => {
    if (!row.open || built) return;
    built = true;
    const content = h("div", { class: "case-detail" });
    if (cell.state === "error") content.append(h("p", { class: "evaluation-error", role: "status" }, `Evaluation error: ${cell.error}. This is not a low agent score.`));
    if (["queued", "running"].includes(cell.state)) content.append(h("p", { class: "hint" }, "This snapshot was saved before the evaluation finished. It does not contain a score for this trace."));
    if (cell.state === "cancelled") content.append(h("p", { class: "hint" }, "This evaluation was cancelled. No scores are included in aggregates."));
    const columns = h("div", { class: "case-columns" });
    columns.append(transcript(item, prefix));
    const metrics = h("section", { class: "metrics-panel", "aria-label": `${item.label} metrics` }, h("h3", { class: "panel-title" }, "Metrics"));
    for (const criterion of run.judge.criteria) {
      const targets = cell.targets.filter(target => target.criterionId === criterion.id);
      if (!targets.length) metrics.append(metricRow(criterion, null, null, prefix));
      for (const target of targets) {
        const result = cell.results.find(result => result.criterionId === target.criterionId && result.targetId === target.targetId);
        if (result) metrics.append(metricRow(criterion, target, result, prefix));
        else metrics.append(h("p", { class: "unscored-metric" }, `${target.label} · ${statusLabel(cell.state)} · no score`));
      }
    }
    columns.append(metrics); content.append(columns);
    if (scenario.tools.length) content.append(toolDefinitions(scenario.tools));
    if (run.n > 1) content.append(repeatTable(cell));
    const metadata = h("details", { class: "call-metadata" }, h("summary", {}, "Judge request details"));
    metadata.append(h("p", {}, `${run.model} · ${cell.durationMs == null ? "No timing recorded" : `${cell.durationMs} ms`}`));
    if (cell.usage) metadata.append(h("pre", {}, JSON.stringify(cell.usage, null, 2)));
    if (cell.raw) metadata.append(h("h4", {}, "Raw judge response"), h("pre", {}, cell.raw));
    content.append(metadata); row.append(content);
  });
  return row;
}

function repeatTable(cell) {
  const peers = run.cells.filter(peer => peer.scenarioId === cell.scenarioId && peer.caseId === cell.caseId && peer.state === "done");
  const table = h("table");
  table.append(h("caption", {}, "Successful repeats for this trace"), h("thead", {}, h("tr", {}, ["Criterion / target", "Mean", "Range", "Passing scores"].map(text => h("th", { scope: "col" }, text)))));
  const body = h("tbody");
  for (const target of cell.targets) {
    const values = peers.flatMap(peer => peer.results.filter(result => result.criterionId === target.criterionId && result.targetId === target.targetId).map(result => result.score));
    body.append(h("tr", {}, [h("th", { scope: "row" }, target.label), h("td", {}, values.length ? fmt(values.reduce((a, b) => a + b, 0) / values.length) : "—"), h("td", {}, values.length ? `${Math.min(...values)}–${Math.max(...values)}` : "—"), h("td", {}, `${values.filter(value => value >= target.threshold).length}/${values.length}`)]));
  }
  table.append(body);
  return h("div", { class: "table-scroll repeat-table" }, table);
}
