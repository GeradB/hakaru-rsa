import crypto from 'crypto';
import {
  listCmsPatches,
  upsertCmsPatch,
} from './db.js';
import { uploadGalleryImage, isAzureGalleryConfigured } from './galleryBlob.js';
import {
  mergeSiteContentPatches,
  pickFragment,
  fragmentKeysValid,
  CMS_SLUGS,
  getDefaultSiteContent,
} from './cmsMerge.js';

export function isDbConfigured() {
  return !!(process.env.SQL_SERVER_HOST || process.env.SQL_SERVER_DATABASE);
}

export async function getMergedSiteContentSafe() {
  if (!isDbConfigured()) {
    return getDefaultSiteContent();
  }
  try {
    const patches = await listCmsPatches();
    return mergeSiteContentPatches(patches);
  } catch (err) {
    console.error('Site content CMS load failed:', err.message || err);
    return getDefaultSiteContent();
  }
}

export async function getMergedFragment(slug) {
  if (!CMS_SLUGS.includes(slug)) {
    throw new Error('Unknown slug');
  }
  const merged = await getMergedSiteContentSafe();
  return pickFragment(slug, merged);
}

export async function saveFragment(slug, payload) {
  if (!isDbConfigured()) {
    throw new Error('Database is not configured');
  }
  if (!CMS_SLUGS.includes(slug)) {
    throw new Error('Unknown slug');
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Payload must be a JSON object');
  }
  if (!fragmentKeysValid(slug, payload)) {
    throw new Error('Payload contains invalid keys for this slug');
  }
  await upsertCmsPatch(slug, payload);
  const merged = await getMergedSiteContentSafe();
  return pickFragment(slug, merged);
}

export function detectImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { ext: 'png', mime: 'image/png' };
  }
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { ext: 'webp', mime: 'image/webp' };
  }
  return null;
}

/** PDF magic header `%PDF` */
export function detectPdfType(buffer) {
  if (!buffer || buffer.length < 5) return null;
  if (buffer.toString('ascii', 0, 4) === '%PDF') {
    return { ext: 'pdf', mime: 'application/pdf' };
  }
  return null;
}

export async function uploadCmsImage(buffer) {
  if (!isAzureGalleryConfigured()) {
    throw new Error('Azure Blob Storage is not configured');
  }
  const kind = detectImageType(buffer);
  if (!kind) {
    throw new Error('Invalid format (JPEG, PNG, WebP only)');
  }
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const blobName = `cms/${y}/${m}/${crypto.randomUUID()}.${kind.ext}`;
  const publicUrl = await uploadGalleryImage(buffer, blobName, kind.mime);
  return { publicUrl, blobName };
}
