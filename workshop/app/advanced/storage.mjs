import { LEGACY_KEY, readConnection } from "../connection.mjs";

export const SETTINGS_KEY = "alta2026-hands-on-advanced-settings-v2";
export const DRAFT_KEY = "alta2026-hands-on-judge-v2";
export const RUN_PREFIX = "alta2026-hands-on-run-v2:";

export function readJSON(storage, key, fallback = null) {
  try { return JSON.parse(storage.getItem(key)) ?? fallback; } catch { return fallback; }
}

export function writeJSON(storage, key, value) {
  try { storage.setItem(key, JSON.stringify(value)); }
  catch { throw new Error("This browser could not save the data. Allow site storage or free some browser storage, then try again."); }
}

export function loadSettings(storage) {
  const saved = readJSON(storage, SETTINGS_KEY);
  const preferences = saved || readJSON(storage, LEGACY_KEY, {});
  if (!saved) {
    try { saveSettings(storage, preferences); } catch { /* Runs explain blocked storage before making API calls. */ }
  }
  return { model: preferences.model, temperature: preferences.temperature, n: preferences.n, ...readConnection(storage) };
}

export function saveSettings(storage, settings) {
  writeJSON(storage, SETTINGS_KEY, { model: settings.model, temperature: settings.temperature, n: settings.n });
}

export function saveRun(storage, run) {
  // Credentials are deliberately outside the run model, never copied from settings.
  writeJSON(storage, RUN_PREFIX + run.id, run);
}

export function loadRun(storage, id) {
  const run = readJSON(storage, RUN_PREFIX + id);
  return run?.version === 2 && Array.isArray(run.cells) && Array.isArray(run.scenarios) && Array.isArray(run.judge?.criteria) ? run : null;
}

export function listRuns(storage) {
  try {
    return Array.from({ length: storage.length }, (_, index) => storage.key(index))
      .filter(key => key?.startsWith(RUN_PREFIX))
      .map(key => loadRun(storage, key.slice(RUN_PREFIX.length)))
      .filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch { return []; }
}

export function restoreJudge(storage, defaults, makeId) {
  const draft = readJSON(storage, DRAFT_KEY);
  if (draft?.judge) return draft;
  const legacy = readJSON(storage, LEGACY_KEY, {});
  const judge = structuredClone(defaults);
  if (typeof legacy.prompt === "string" && legacy.prompt.trim()) {
    judge.id = makeId();
    judge.name = "My saved career-advice judge";
    judge.instructions = legacy.prompt;
    judge.criteria = judge.criteria.filter(criterion => criterion.target === "answer");
  }
  return { judge };
}
