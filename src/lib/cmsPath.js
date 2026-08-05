/** Get a nested value by dotted path (e.g. `hero.title`). */
export function getAtPath(obj, path) {
  if (!path) return obj;
  const parts = String(path).split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return cur;
}

/** Immutable set by dotted path. Creates intermediate objects as needed. */
export function setAtPath(obj, path, value) {
  const parts = String(path).split('.');
  const root = Array.isArray(obj)
    ? [...obj]
    : { ...(obj && typeof obj === 'object' ? obj : {}) };
  let cur = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = cur[p];
    const clone =
      next != null && typeof next === 'object'
        ? Array.isArray(next)
          ? [...next]
          : { ...next }
        : {};
    cur[p] = clone;
    cur = clone;
  }
  cur[parts[parts.length - 1]] = value;
  return root;
}

export function cloneJson(value) {
  return typeof structuredClone === 'function'
    ? structuredClone(value)
    : JSON.parse(JSON.stringify(value ?? null));
}
