// Defaults must live in this folder (./siteContent.defaults.js) — Azure deploys `server/` only; do not use ../shared/
import defaultSiteContent from './siteContent.defaults.js';

export const CMS_SLUGS = Object.freeze([
  'global',
  'home',
  'about',
  'membership',
  'contact',
  'projects',
  'events',
  'committee',
  'donate',
]);

/** Top-level keys from siteContent belonging to each admin “page” slug */
export const FRAGMENT_KEYS = Object.freeze({
  global: ['site', 'navigation', 'footer'],
  home: ['hero', 'welcome', 'announcements', 'upcomingEvents', 'homeCta'],
  about: ['about'],
  membership: ['membership'],
  contact: ['contact'],
  projects: ['projectsPage'],
  events: ['eventsPage'],
  committee: ['committeePage'],
  donate: ['donatePage'],
});

export function deepMerge(target, source) {
  if (source === null || typeof source !== 'object' || Array.isArray(source)) {
    return source;
  }
  const base = target && typeof target === 'object' && !Array.isArray(target)
    ? { ...target }
    : {};
  for (const k of Object.keys(source)) {
    const sv = source[k];
    const tv = base[k];
    if (
      sv !== null &&
      typeof sv === 'object' &&
      !Array.isArray(sv) &&
      tv !== null &&
      typeof tv === 'object' &&
      !Array.isArray(tv)
    ) {
      base[k] = deepMerge(tv, sv);
    } else {
      base[k] = sv;
    }
  }
  return base;
}

function cloneDefaults() {
  return typeof structuredClone === 'function'
    ? structuredClone(defaultSiteContent)
    : JSON.parse(JSON.stringify(defaultSiteContent));
}

export function mergeSiteContentPatches(patches) {
  let merged = cloneDefaults();
  for (const patch of patches) {
    if (patch && typeof patch.payload === 'object') {
      merged = deepMerge(merged, patch.payload);
    }
  }
  return merged;
}

/** Pick editable fragment keys for slug from merged full content */
export function pickFragment(slug, fullMerged) {
  const keys = FRAGMENT_KEYS[slug];
  if (!keys || !fullMerged) return {};
  const out = {};
  for (const k of keys) {
    if (fullMerged[k] !== undefined) {
      out[k] =
        typeof structuredClone === 'function'
          ? structuredClone(fullMerged[k])
          : JSON.parse(JSON.stringify(fullMerged[k]));
    }
  }
  return out;
}

export function fragmentKeysValid(slug, payload) {
  const allowed = new Set(FRAGMENT_KEYS[slug] || []);
  if (!allowed.size) return false;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload))
    return false;
  return Object.keys(payload).every((k) => allowed.has(k));
}

export function getDefaultSiteContent() {
  return cloneDefaults();
}
