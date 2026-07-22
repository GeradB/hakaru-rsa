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

/** Website fee labels → Dataverse cre8c_membershiptype option labels */
const MEMBERSHIP_TYPE_LABEL_MAP = {
  'returned & service': 'Returned Member',
  'associate (non-military)': 'Member',
  'youth (under 18)': 'Youth Member',
  'over 80s': 'Member',
  'over 90s': 'Member',
  'life member': 'Life Member',
};

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

function optionLabel(opt) {
  return (
    opt?.Label?.UserLocalizedLabel?.Label ||
    opt?.Label?.LocalizedLabels?.[0]?.Label ||
    ''
  );
}

/**
 * Load EntitySetName + writable attributes (with picklist options when present).
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
    attrs.set(String(a.LogicalName).toLowerCase(), {
      LogicalName: a.LogicalName,
      AttributeType: a.AttributeType,
      options: null,
    });
  }

  // Load picklist option values for choice columns
  const picklistPath =
    `/EntityDefinitions(LogicalName='${entityLogicalName}')` +
    `/Attributes/Microsoft.Dynamics.CRM.PicklistAttributeMetadata` +
    `?$select=LogicalName&$expand=OptionSet($select=Options)`;
  const pickRes = await dataverseFetch(picklistPath);
  if (pickRes.ok) {
    const pickJson = await pickRes.json();
    for (const a of pickJson.value || []) {
      const key = String(a.LogicalName).toLowerCase();
      const existing = attrs.get(key);
      if (!existing) continue;
      const options = new Map();
      for (const opt of a.OptionSet?.Options || []) {
        const label = optionLabel(opt).trim();
        if (label) options.set(label.toLowerCase(), opt.Value);
      }
      existing.options = options;
    }
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

function resolvePicklistValue(meta, value) {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const raw = String(value).trim();
  const asInt = parseInt(raw, 10);
  if (String(asInt) === raw && Number.isFinite(asInt)) return asInt;
  if (!meta?.options) return null;

  const direct = meta.options.get(raw.toLowerCase());
  if (direct !== undefined) return direct;

  const mappedLabel = MEMBERSHIP_TYPE_LABEL_MAP[raw.toLowerCase()];
  if (mappedLabel) {
    const mapped = meta.options.get(mappedLabel.toLowerCase());
    if (mapped !== undefined) return mapped;
  }
  return null;
}

function setIf(payload, attrs, candidates, value) {
  if (value === undefined || value === null || value === '') return;
  const key = pickAttr(attrs, candidates);
  if (!key) return;
  const meta = attrs.get(key.toLowerCase());
  const type = meta?.AttributeType;

  if (type === 'Picklist' || type === 'State' || type === 'Status') {
    const opt = resolvePicklistValue(meta, value);
    if (opt !== null) payload[key] = opt;
    return;
  }
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
  payload[key] = Array.isArray(value) ? value.join(', ') : String(value);
}

function splitFullName(fullName) {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

/**
 * Map website membership form → Dataverse row (only attributes that exist).
 */
export function mapMembershipToDataverse(formData, membershipId, meta) {
  const attrs = meta.attributes;
  const payload = {};
  const { firstName, lastName } = splitFullName(formData.fullName);

  const primary = meta.primaryNameAttribute;
  if (primary && formData.fullName) {
    // Primary on this table is cre8c_firstname — prefer first name there.
    if (primary.toLowerCase() === 'cre8c_firstname' && firstName) {
      payload[primary] = firstName;
    } else {
      payload[primary] = String(formData.fullName);
    }
  }

  setIf(payload, attrs, ['cre8c_firstname'], firstName);
  setIf(payload, attrs, ['cre8c_lastname'], lastName);
  setIf(payload, attrs, ['cre8c_name', 'cre8c_fullname', 'cre8c_membername'], formData.fullName);
  setIf(payload, attrs, ['cre8c_fullname2', 'cre8c_partnername', 'cre8c_secondname'], formData.fullName2);
  setIf(
    payload,
    attrs,
    ['cre8c_emailaddress', 'cre8c_email', 'emailaddress1', 'email'],
    formData.email,
  );
  setIf(
    payload,
    attrs,
    ['cre8c_mobilephone', 'cre8c_mobile', 'cre8c_mobilenumber', 'mobilephone', 'telephone2'],
    formData.mobile,
  );
  setIf(payload, attrs, ['cre8c_homephone', 'cre8c_phone', 'telephone1', 'homephone'], formData.homePhone);
  setIf(payload, attrs, ['cre8c_workphone'], formData.homePhone);
  setIf(payload, attrs, ['cre8c_dob', 'cre8c_dateofbirth', 'birthdate'], formData.dob);
  setIf(payload, attrs, ['cre8c_dob2', 'cre8c_partnerdob'], formData.dob2);
  setIf(
    payload,
    attrs,
    ['cre8c_postaladdress', 'cre8c_mailingaddress', 'cre8c_address', 'address1_line1'],
    formData.mailingAddress,
  );
  setIf(payload, attrs, ['cre8c_streetname'], formData.mailingAddress);
  setIf(
    payload,
    attrs,
    ['cre8c_suburb', 'cre8c_mailingtown', 'cre8c_town', 'address1_city'],
    formData.mailingTown,
  );
  setIf(payload, attrs, ['cre8c_city'], formData.mailingTown);
  setIf(
    payload,
    attrs,
    ['cre8c_postcode', 'cre8c_mailingpostcode', 'address1_postalcode'],
    formData.mailingPostCode,
  );
  setIf(payload, attrs, ['cre8c_country'], 'New Zealand');
  setIf(payload, attrs, ['cre8c_physicaladdress', 'address2_line1'], formData.physicalAddress);
  setIf(payload, attrs, ['cre8c_physicaltown', 'address2_city'], formData.physicalTown);
  setIf(payload, attrs, ['cre8c_physicalpostcode', 'address2_postalcode'], formData.physicalPostCode);
  setIf(payload, attrs, ['cre8c_membershiptype', 'cre8c_type'], formData.membershipType);
  setIf(payload, attrs, ['cre8c_membershipstatus'], 'Active');
  setIf(payload, attrs, ['cre8c_datejoined'], new Date().toISOString());
  setIf(payload, attrs, ['cre8c_transferfrom'], formData.transferFrom);
  setIf(payload, attrs, ['cre8c_service', 'cre8c_servicename'], formData.serviceName);
  setIf(payload, attrs, ['cre8c_serviceno', 'cre8c_servicenumber'], formData.serviceNumber);
  setIf(payload, attrs, ['cre8c_rank'], formData.rank);
  setIf(payload, attrs, ['cre8c_tradecorp'], formData.tradeCorp);
  setIf(payload, attrs, ['cre8c_yearenlisted'], formData.yearEnlisted);
  setIf(payload, attrs, ['cre8c_yeardischarged'], formData.yearDischarged);
  setIf(payload, attrs, ['cre8c_whereserved'], formData.wherServed);
  setIf(payload, attrs, ['cre8c_nominatedby'], formData.nominatedBy);
  setIf(payload, attrs, ['cre8c_secondedby'], formData.secondedBy);
  setIf(payload, attrs, ['cre8c_donation', 'cre8c_donationamount'], formData.donation);
  setIf(payload, attrs, ['cre8c_skills'], formData.skills);
  // Do not write website UUIDs into cre8c_membershipnumber — that column is the RSA memno.
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

/**
 * Add one calendar year to a date (preserves time-of-day when possible).
 * Exported for unit tests.
 */
export function addOneYear(dateInput) {
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return null;
  d.setFullYear(d.getFullYear() + 1);
  return d;
}

/**
 * New expiry = current expiry + 1 year. If no current expiry, use now + 1 year.
 */
export function computeRenewalExpiry(currentExpiry, now = new Date()) {
  const base = currentExpiry ? new Date(currentExpiry) : null;
  const from = base && !Number.isNaN(base.getTime()) ? base : new Date(now);
  const next = addOneYear(from);
  return next ? next.toISOString() : null;
}

function escapeODataString(value) {
  return String(value).replace(/'/g, "''");
}

/**
 * Look up a Dataverse membership by cre8c_membershipnumber (memno), set status
 * Active, and extend cre8c_membershipexpirydate by one year from the current value.
 */
export async function renewDataverseMembershipByNumber(membershipNumber) {
  if (!isDataverseConfigured()) {
    return null;
  }

  const memno = String(membershipNumber || '').trim();
  if (!memno) {
    throw new Error('Membership number is required for Dataverse renewal');
  }

  const meta = await getMembershipEntityMeta();
  const idAttr = `${getConfig().entityLogicalName}id`;
  const select = [idAttr, 'cre8c_membershipnumber', 'cre8c_membershipexpirydate', 'cre8c_membershipstatus'].join(
    ',',
  );
  const filter = `cre8c_membershipnumber eq '${escapeODataString(memno)}'`;
  const listRes = await dataverseFetch(
    `/${meta.entitySetName}?$select=${select}&$filter=${encodeURIComponent(filter)}&$top=5`,
  );
  if (!listRes.ok) {
    const text = await listRes.text();
    throw new Error(`Dataverse lookup failed (${listRes.status}): ${text.slice(0, 400)}`);
  }

  const list = await listRes.json();
  const rows = list.value || [];
  if (!rows.length) {
    throw new Error(`No Dataverse membership found for memno=${memno}`);
  }
  if (rows.length > 1) {
    console.warn(`[dataverse] multiple rows for memno=${memno}; updating the first match`);
  }

  const row = rows[0];
  const recordId = row[idAttr];
  if (!recordId) {
    throw new Error(`Dataverse row missing id for memno=${memno}`);
  }

  const newExpiry = computeRenewalExpiry(row.cre8c_membershipexpirydate);
  const patch = {};
  setIf(patch, meta.attributes, ['cre8c_membershipstatus'], 'Active');
  setIf(patch, meta.attributes, ['cre8c_membershipexpirydate'], newExpiry);

  if (!Object.keys(patch).length) {
    throw new Error('Dataverse renewal patch empty — status/expiry columns missing');
  }

  const patchRes = await dataverseFetch(`/${meta.entitySetName}(${recordId})`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
    headers: { 'If-Match': '*' },
  });
  if (!patchRes.ok) {
    const text = await patchRes.text();
    throw new Error(`Dataverse renewal update failed (${patchRes.status}): ${text.slice(0, 500)}`);
  }

  console.log(
    `[dataverse] renewed memno=${memno} id=${recordId} expiry=${newExpiry} status=Active`,
  );
  return { recordId, membershipNumber: memno, expiry: newExpiry };
}

/** Test helper — clear cached metadata between tests if needed */
export function _resetDataverseCacheForTests() {
  cachedMeta = null;
  cachedToken = { value: null, expiresAt: 0 };
}
