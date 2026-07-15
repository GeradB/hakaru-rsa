const ENTRA_TENANT_ID = '0f9e3c4e-92b5-4caf-ae9a-56a7e71882a8';

function parseCsvEnv(name) {
  return (process.env[name] || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getAgentTenantId() {
  return process.env.AGENT_ENTRA_TENANT_ID?.trim() || ENTRA_TENANT_ID;
}

export function isAgentConfigured() {
  return !!(
    process.env.MICROSOFT_APP_ID &&
    process.env.MICROSOFT_APP_PASSWORD &&
    (parseCsvEnv('AGENT_ALLOWED_AAD_OBJECT_IDS').length > 0 ||
      process.env.AGENT_ALLOWED_GROUP_ID?.trim())
  );
}

export function isOpenAiConfigured() {
  return !!(
    process.env.AZURE_OPENAI_ENDPOINT &&
    process.env.AZURE_OPENAI_API_KEY &&
    process.env.AZURE_OPENAI_DEPLOYMENT
  );
}

/**
 * @param {{ aadObjectId?: string, tenantId?: string }} identity
 */
export async function isAgentUserAllowed(identity) {
  const allowedIds = parseCsvEnv('AGENT_ALLOWED_AAD_OBJECT_IDS');
  const groupId = process.env.AGENT_ALLOWED_GROUP_ID?.trim();

  if (!allowedIds.length && !groupId) {
    return false;
  }

  const aadObjectId = identity?.aadObjectId?.trim();
  if (!aadObjectId) return false;

  const tenantId = identity?.tenantId?.trim();
  if (tenantId && tenantId !== getAgentTenantId()) {
    return false;
  }

  if (allowedIds.includes(aadObjectId)) {
    return true;
  }

  if (groupId) {
    return checkGroupMembership(aadObjectId, groupId);
  }

  return false;
}

async function checkGroupMembership(userId, groupId) {
  const clientId = process.env.AGENT_GRAPH_CLIENT_ID?.trim();
  const clientSecret = process.env.AGENT_GRAPH_CLIENT_SECRET?.trim();
  const tenant = getAgentTenantId();

  if (!clientId || !clientSecret) {
    console.warn(
      'AGENT_ALLOWED_GROUP_ID is set but AGENT_GRAPH_CLIENT_ID/SECRET are missing; group check skipped.',
    );
    return false;
  }

  try {
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          scope: 'https://graph.microsoft.com/.default',
          grant_type: 'client_credentials',
        }),
      },
    );
    if (!tokenRes.ok) return false;
    const { access_token: token } = await tokenRes.json();
    if (!token) return false;

    const checkRes = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userId}/checkMemberGroups`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ groupIds: [groupId] }),
      },
    );
    if (!checkRes.ok) return false;
    const data = await checkRes.json();
    return Array.isArray(data.value) && data.value.includes(groupId);
  } catch (err) {
    console.warn('Group membership check failed:', err.message || err);
    return false;
  }
}
