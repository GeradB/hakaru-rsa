import * as jose from 'jose';

const DEFAULT_TENANT_ID = '0f9e3c4e-92b5-4caf-ae9a-56a7e71882a8';
const DEFAULT_CLIENT_ID = '4fafdc19-8a0c-4021-8d27-32a2a1594772';

function parseCsvEnv(name) {
  return (process.env[name] || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getEntraTenantId() {
  return (
    process.env.ENTRA_TENANT_ID?.trim() ||
    process.env.AGENT_ENTRA_TENANT_ID?.trim() ||
    DEFAULT_TENANT_ID
  );
}

export function getEntraClientId() {
  return process.env.ENTRA_CLIENT_ID?.trim() || DEFAULT_CLIENT_ID;
}

/** Prefer ADMIN_ALLOWED_AAD_OBJECT_IDS; fall back to Teams agent allowlist. */
export function getAdminAllowedObjectIds() {
  const admin = parseCsvEnv('ADMIN_ALLOWED_AAD_OBJECT_IDS');
  if (admin.length) return admin;
  return parseCsvEnv('AGENT_ALLOWED_AAD_OBJECT_IDS');
}

let jwks;

function getJwks() {
  if (!jwks) {
    const tenant = getEntraTenantId();
    jwks = jose.createRemoteJWKSet(
      new URL(`https://login.microsoftonline.com/${tenant}/discovery/v2.0/keys`),
    );
  }
  return jwks;
}

/**
 * Verify Entra ID token (signature + iss/aud/exp) and enforce admin allowlist.
 * @returns {{ email?: string, name?: string, oid: string, tid: string }}
 */
export async function verifyEntraIdToken(token) {
  if (!token || typeof token !== 'string') {
    const err = new Error('Missing token');
    err.statusCode = 401;
    throw err;
  }

  const allowed = getAdminAllowedObjectIds();
  const allowlistRequired =
    process.env.NODE_ENV === 'production' ||
    process.env.ADMIN_REQUIRE_ALLOWLIST === 'true';

  if (!allowed.length && allowlistRequired) {
    const err = new Error(
      'Admin Entra allowlist is not configured (ADMIN_ALLOWED_AAD_OBJECT_IDS)',
    );
    err.statusCode = 503;
    throw err;
  }

  const tenant = getEntraTenantId();
  const clientId = getEntraClientId();
  const issuers = [
    `https://login.microsoftonline.com/${tenant}/v2.0`,
    `https://sts.windows.net/${tenant}/`,
  ];

  let payload;
  try {
    ({ payload } = await jose.jwtVerify(token, getJwks(), {
      issuer: issuers,
      audience: clientId,
      clockTolerance: 60,
    }));
  } catch (e) {
    const err = new Error('Invalid or expired token');
    err.statusCode = 401;
    err.cause = e;
    throw err;
  }

  const tid = String(payload.tid || '');
  if (tid && tid !== tenant) {
    const err = new Error('Invalid token tenant');
    err.statusCode = 401;
    throw err;
  }

  const oid = String(payload.oid || '').trim();
  if (!oid) {
    const err = new Error('Invalid token (missing oid)');
    err.statusCode = 401;
    throw err;
  }

  if (allowed.length && !allowed.includes(oid)) {
    const err = new Error('Forbidden');
    err.statusCode = 403;
    throw err;
  }

  if (!allowed.length) {
    console.warn(
      'ADMIN_ALLOWED_AAD_OBJECT_IDS is empty — allowing verified Entra admin in non-production. Set the allowlist before production use.',
    );
  }

  return {
    oid,
    tid: tid || tenant,
    email: payload.email || payload.preferred_username,
    name: payload.name,
  };
}
