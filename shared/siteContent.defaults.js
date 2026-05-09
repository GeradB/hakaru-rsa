/**
 * Re-exports the canonical defaults from `server/siteContent.defaults.js`.
 * The API is deployed with `server/` only; cmsMerge imports `./siteContent.defaults.js`.
 */
export { default } from '../server/siteContent.defaults.js';
export { default as defaultSiteContent } from '../server/siteContent.defaults.js';
