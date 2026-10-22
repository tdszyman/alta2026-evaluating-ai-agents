// Only the API connection is shared. Neither exercise writes the other's preferences.
export const CONNECTION_KEY = "alta2026-hands-on-connection-v1";
export const LEGACY_KEY = "alta2026-hands-on-v1";
export const DEFAULT_BASE = "https://openrouter.ai/api/v1";

function read(storage, key) {
  try {
    const value = JSON.parse(storage.getItem(key));
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch { return null; }
}

function removeLegacyConnection(storage) {
  const legacy = read(storage, LEGACY_KEY);
  if (legacy && (Object.hasOwn(legacy, "apiKey") || Object.hasOwn(legacy, "baseUrl"))) {
    delete legacy.apiKey;
    delete legacy.baseUrl;
    storage.setItem(LEGACY_KEY, JSON.stringify(legacy));
  }
}

export function readConnection(storage) {
  const saved = read(storage, CONNECTION_KEY);
  if (saved) return {
    apiKey: typeof saved.apiKey === "string" ? saved.apiKey : "",
    baseUrl: typeof saved.baseUrl === "string" && saved.baseUrl ? saved.baseUrl : DEFAULT_BASE,
  };
  const legacy = read(storage, LEGACY_KEY) || {};
  const connection = { apiKey: typeof legacy.apiKey === "string" ? legacy.apiKey : "", baseUrl: legacy.baseUrl || DEFAULT_BASE };
  try { writeConnection(storage, connection); } catch { /* Keep the old connection usable when storage is blocked. */ }
  return connection;
}

export function writeConnection(storage, connection) {
  try {
    // An empty saved key is intentional: never re-import a previously removed key.
    storage.setItem(CONNECTION_KEY, JSON.stringify({ apiKey: connection.apiKey || "", baseUrl: connection.baseUrl || DEFAULT_BASE }));
    removeLegacyConnection(storage);
  } catch { throw new Error("This browser could not save the API connection. Allow site storage or free browser storage, then try again."); }
}
