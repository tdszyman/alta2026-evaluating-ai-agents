import { validateJudge } from "./advanced/core.mjs";
import { readJSON, writeJSON } from "./advanced/storage.mjs";

export const WORKFLOW_KEY = "alta2026-hands-on-workflow-v1";
export const ROUNDS = [
  { id: "advice", title: "Career advice", tools: 0 },
  { id: "job-search", title: "Find suitable jobs", tools: 1 },
  { id: "jobs-training", title: "Connect jobs and training", tools: 2 },
];
export const STEPS = [
  { id: "cases", title: "Inspect cases", file: "index.html" },
  { id: "rubric", title: "Design rubric", file: "rubric.html" },
  { id: "judge", title: "Write judge", file: "judge.html" },
  { id: "run", title: "Run evaluation", file: "run.html" },
  { id: "review", title: "Review results", file: "report.html" },
];

export function loadWorkflow(storage) {
  const saved = readJSON(storage, WORKFLOW_KEY, {});
  return {
    round: ROUNDS.some(round => round.id === saved?.round) ? saved.round : ROUNDS[0].id,
    step: STEPS.some(step => step.id === saved?.step) ? saved.step : "cases",
    latestRuns: Object.fromEntries(ROUNDS.flatMap(round =>
      typeof saved?.latestRuns?.[round.id] === "string" ? [[round.id, saved.latestRuns[round.id]]] : [])),
    runNames: Object.fromEntries(ROUNDS.flatMap(round =>
      typeof saved?.runNames?.[round.id] === "string" ? [[round.id, saved.runNames[round.id]]] : [])),
  };
}

export function resolveRound(search, workflow) {
  const requested = new URLSearchParams(search).get("round");
  return ROUNDS.find(round => round.id === (requested ?? workflow.round)) || ROUNDS[0];
}

export function saveWorkflow(storage, patch) {
  const current = loadWorkflow(storage);
  const next = { ...current, ...patch, latestRuns: { ...current.latestRuns, ...patch.latestRuns }, runNames: { ...current.runNames, ...patch.runNames } };
  writeJSON(storage, WORKFLOW_KEY, next);
  return next;
}

export function stepHref(step, round, runId) {
  const page = STEPS.find(item => item.id === step);
  const query = new URLSearchParams({ round });
  if (step === "review" && runId) query.set("run", runId);
  return `${page.file}?${query}`;
}

export function validateRubric(judge) {
  // Rubric design precedes instruction writing, so validate those separately.
  validateJudge({ ...judge, instructions: "Instructions are edited on the next page." });
}

export function addToolCriteria(judge, template) {
  const next = structuredClone(judge);
  const existing = new Set(next.criteria.map(criterion => criterion.id));
  next.criteria.push(...structuredClone(template.criteria.filter(criterion =>
    ["tool_call", "tool_results"].includes(criterion.target) && !existing.has(criterion.id))));
  return next;
}
