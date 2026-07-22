/**
 * Sync new website membership applications into Dataverse
 * table cre8c_membershiprecord10 (org: org0edbfb3b.crm6.dynamics.com).
 *
 * Auth: Entra app registration + Dataverse application user (client credentials).
 * @see https://learn.microsoft.com/power-apps/developer/data-platform/authenticate-oauth#connect-as-an-app
 */

const DEFAULT_URL = 'https://org0edbfb3b.api.crm6.dynamics.com';
const DEFAULT_ENTITY = 'cre8c_membershiprecord10';
const DEFAULT_TENANT = '0f9e3c4e-92b5-4caf-ae9a-56a7e71882a8';

let cachedToken = { value: null, expiresAt: 0 };
let cachedMeta = null;

export function isDataverseConfigured() {
  return !!(
    (process.env.DATAVERSE_URL || DEFAULT_URL) &&
    process.env.DATAVERSE_CLIENT_ID &&
    process.env.DATAVERSE_CLIENT_SECRET &&
    (process.env.DATAVERSE_TENANT_ID || DEFAULT_TENANT)
  );
}

function getConfig() {
  const url = (process.env.DATAVERSE_URL || DEFAULT_URL).replace(/\/$/, '');
  return {
    url,
    api: `${url}/api/data/v9.2`,
    clientId: process.env.DATAVERSE_CLIENT_ID?.trim(),
    clientSecret: process.env.DATAVERSE_CLIENT_SECRET?.trim(),
    tenantId: process.env.DATAVERSE_TENANT_ID?.trim() || DEFAULT_TENANT,
    entityLogicalName: process.env.DATAVERSE_MEMBERSHIP_ENTITY || DEFAULT_ENTITY,
  };
}

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken.value && cachedToken.expiresAt > now + 60_000) {
    return cachedToken.value;
  }

  const { url, clientId, clientSecret, tenantId } = getConfig();
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    scope: `${url}/.default`,
    grant_type: 'client_credentials',
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dataverse token failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  cachedToken = {
    value: json.access_token,
    expiresAt: now + (json.expires_in || 3600) * 1000,
  };
  return cachedToken.value;
}

async function dataverseFetch(path, options = {}) {
  const { api } = getConfig();
  const token = await getAccessToken();
  const res = await fetch(`${api}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Content-Type': 'application/json; charset=utf-8',
      Prefer: 'return=representation',
      ...(options.headers || {}),
    },
  });
  return res;
}

/**
 * Load EntitySetName + writable string/date/number attributes for field mapping.
 */
async function getMembershipEntityMeta() {
  if (cachedMeta) return cachedMeta;
  const { entityLogicalName } = getConfig();
  const path =
    `/EntityDefinitions(LogicalName='${entityLogicalName}')` +
    `?$select=LogicalName,EntitySetName,PrimaryNameAttribute` +
    `&$expand=Attributes($select=LogicalName,AttributeType,IsValidForCreate;$filter=IsValidForCreate eq true)`;

  const res = await dataverseFetch(path);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dataverse metadata failed (${res.status}): ${text.slice(0, 400)}`);
  }
  const json = await res.json();
  const attrs = new Map();
  for (const a of json.Attributes || []) {
    attrs.set(String(a.LogicalName).toLowerCase(), a);
  }
  cachedMeta = {
    entitySetName: json.EntitySetName,
    primaryNameAttribute: json.PrimaryNameAttribute,
    attributes: attrs,
  };
  return cachedMeta;
}

function pickAttr(attrs, candidates) {
  for (const name of candidates) {
    if (attrs.has(name.toLowerCase())) return name;
  }
  return null;
}

function setIf(payload, attrs, candidates, value) {
  if (value === undefined || value === null || value === '') return;
  const key = pickAttr(attrs, candidates);
  if (!key) return;
  const meta = attrs.get(key.toLowerCase());
  const type = meta?.AttributeType;
  if (type === 'DateTime' || type === 'DateTimeBehavior') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) payload[key] = d.toISOString();
    return;
  }
  if (type === 'Integer' || type === 'BigInt') {
    const n = parseInt(value, 10);
    if (Number.isFinite(n)) payload[key] = n;
    return;
  }
  if (type === 'Decimal' || type === 'Double' || type === 'Money') {
    const n = Number(value);
    if (Number.isFinite(n)) payload[key] = n;
    return;
  }
  if (type === 'Boolean') {
    payload[key] = value === true || value === 'yes' || value === 'true' || value === '1';
    return;
  }
  // String / Memo / Picklist as string label when possible
  payload[key] = Array.isArray(value) ? value.join(', ') : String(value);
}

/**
 * Map website membership form → Dataverse row (only attributes that exist).
 */
export function mapMembershipToDataverse(formData, membershipId, meta) {
  const attrs = meta.attributes;
  const payload = {};
  const primary = meta.primaryNameAttribute || pickAttr(attrs, ['cre8c_name', 'cre8c_fullname', 'name']);
  if (primary && formData.fullName) {
    payload[primary] = String(formData.fullName);
  }

  setIf(payload, attrs, ['cre8c_fullname', 'cre8c_membername', 'cre8c_fullname1'], formData.fullName);
  setIf(payload, attrs, ['cre8c_fullname2', 'cre8c_partnername', 'cre8c_secondname'], formData.fullName2);
  setIf(payload, attrs, ['cre8c_email', 'cre8c_emailaddress', 'emailaddress1', 'email'], formData.email);
  setIf(payload, attrs, ['cre8c_mobile', 'cre8c_mobilenumber', 'mobilephone', 'telephone2'], formData.mobile);
  setIf(payload, attrs, ['cre8c_homephone', 'cre8c_phone', 'telephone1', 'homephone'], formData.homePhone);
  setIf(payload, attrs, ['cre8c_dob', 'cre8c_dateofbirth', 'birthdate'], formData.dob);
  setIf(payload, attrs, ['cre8c_dob2', 'cre8c_partnerdob'], formData.dob2);
  setIf(payload, attrs, ['cre8c_mailingaddress', 'cre8c_address', 'address1_line1'], formData.mailingAddress);
  setIf(payload, attrs, ['cre8c_mailingtown', 'cre8c_town', 'address1_city'], formData.mailingTown);
  setIf(payload, attrs, ['cre8c_mailingpostcode', 'cre8c_postcode', 'address1_postalcode'], formData.mailingPostCode);
  setIf(payload, attrs, ['cre8c_physicaladdress', 'address2_line1'], formData.physicalAddress);
  setIf(payload, attrs, ['cre8c_physicaltown', 'address2_city'], formData.physicalTown);
  setIf(payload, attrs, ['cre8c_physicalpostcode', 'address2_postalcode'], formData.physicalPostCode);
  setIf(payload, attrs, ['cre8c_membershiptype', 'cre8c_type'], formData.membershipType);
  setIf(payload, attrs, ['cre8c_transferfrom'], formData.transferFrom);
  setIf(payload, attrs, ['cre8c_servicename'], formData.serviceName);
  setIf(payload, attrs, ['cre8c_servicenumber'], formData.serviceNumber);
  setIf(payload, attrs, ['cre8c_rank'], formData.rank);
  setIf(payload, attrs, ['cre8c_tradecorp'], formData.tradeCorp);
  setIf(payload, attrs, ['cre8c_yearenlisted'], formData.yearEnlisted);
  setIf(payload, attrs, ['cre8c_yeardischarged'], formData.yearDischarged);
  setIf(payload, attrs, ['cre8c_whereserved'], formData.wherServed);
  setIf(payload, attrs, ['cre8c_nominatedby'], formData.nominatedBy);
  setIf(payload, attrs, ['cre8c_secondedby'], formData.secondedBy);
  setIf(payload, attrs, ['cre8c_donation', 'cre8c_donationamount'], formData.donation);
  setIf(payload, attrs, ['cre8c_skills'], formData.skills);
  setIf(
    payload,
    attrs,
    ['cre8c_websiteid', 'cre8c_websitemembershipid', 'cre8c_externalid'],
    membershipId ? String(membershipId) : null,
  );
  setIf(
    payload,
    attrs,
    ['cre8c_servicesbranch'],
    formData.servicesBranch ? JSON.stringify(formData.servicesBranch) : null,
  );
  setIf(
    payload,
    attrs,
    ['cre8c_servicetype'],
    formData.serviceType ? JSON.stringify(formData.serviceType) : null,
  );

  return payload;
}

/**
 * Create a Dataverse membership row. Returns record id or null if not configured.
 * Errors are thrown to the caller (caller should catch and log).
 */
export async function createDataverseMembershipRecord(formData, membershipId) {
  if (!isDataverseConfigured()) {
    return null;
  }

  const meta = await getMembershipEntityMeta();
  const payload = mapMembershipToDataverse(formData || {}, membershipId, meta);
  if (!Object.keys(payload).length) {
    throw new Error('Dataverse payload empty — no matching columns for membership fields');
  }

  const res = await dataverseFetch(`/${meta.entitySetName}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dataverse create failed (${res.status}): ${text.slice(0, 500)}`);
  }

  const created = await res.json().catch(() => ({}));
  const idKey = Object.keys(created).find((k) => k.endsWith('id') && k !== '@odata.context');
  const recordId = idKey ? created[idKey] : null;
  console.log(
    `[dataverse] created ${meta.entitySetName} id=${recordId || 'unknown'} for membership ${membershipId}`,
  );
  return recordId;
}
