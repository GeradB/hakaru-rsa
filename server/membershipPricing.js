/**
 * Server copy of shared/membershipPricing.js — Azure deploys server/ only.
 * Keep in sync with ../shared/membershipPricing.js
 */

export const BASE_MEMBERSHIP_FEES = Object.freeze({
  'Returned & Service': 40,
  'Associate (Non-Military)': 40,
  'Youth (Under 18)': 10,
  'Over 80s': 10,
  'Over 90s': 0,
  'Life Member': 0,
});

export const HALF_PRICE_PROMO = Object.freeze({
  id: 'half-price-oct-dec',
  label: 'Half-price membership',
  windowLabel: '1 October – 1 December',
  multiplier: 0.5,
  timeZone: 'Pacific/Auckland',
});

function roundMoney(n) {
  return Math.round(Number(n) * 100) / 100;
}

export function getNzDateParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: HALF_PRICE_PROMO.timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(now);

  const num = (type) => Number(parts.find((p) => p.type === type)?.value);
  return {
    year: num('year'),
    month: num('month'),
    day: num('day'),
  };
}

export function isHalfPricePromoActive(now = new Date()) {
  const { month, day } = getNzDateParts(now);
  if (month === 10) return day >= 1;
  if (month === 11) return true;
  if (month === 12) return day <= 1;
  return false;
}

export function getBaseMembershipFee(membershipType) {
  const base = BASE_MEMBERSHIP_FEES[membershipType];
  return Number.isFinite(base) ? base : 0;
}

export function getMembershipFee(membershipType, now = new Date()) {
  const base = getBaseMembershipFee(membershipType);
  if (base <= 0) return 0;
  if (isHalfPricePromoActive(now)) return roundMoney(base * HALF_PRICE_PROMO.multiplier);
  return base;
}

export function getMembershipFees(now = new Date()) {
  const out = {};
  for (const type of Object.keys(BASE_MEMBERSHIP_FEES)) {
    out[type] = getMembershipFee(type, now);
  }
  return out;
}

export function getExpectedMembershipFee(formData = {}, now = new Date()) {
  const type = formData.membershipType || '';
  const unit = getMembershipFee(type, now);
  const joint = Boolean(formData.fullName2 && String(formData.fullName2).trim());
  return roundMoney(joint ? unit * 2 : unit);
}

export function getPricingSnapshot(now = new Date()) {
  const promoActive = isHalfPricePromoActive(now);
  return {
    promoActive,
    promo: promoActive
      ? {
          id: HALF_PRICE_PROMO.id,
          label: HALF_PRICE_PROMO.label,
          windowLabel: HALF_PRICE_PROMO.windowLabel,
          multiplier: HALF_PRICE_PROMO.multiplier,
        }
      : null,
    baseFees: { ...BASE_MEMBERSHIP_FEES },
    fees: getMembershipFees(now),
  };
}

/** Returns an Error with statusCode if submitted fee does not match schedule. */
export function assertSubmittedFeeMatchesSchedule(formData, submittedFee, now = new Date()) {
  const expected = getExpectedMembershipFee(formData, now);
  const got = Number(submittedFee);
  if (!Number.isFinite(got) || Math.abs(got - expected) > 0.02) {
    const err = new Error(
      `Membership fee mismatch: expected $${expected.toFixed(2)} for ${formData?.membershipType || 'unknown type'}`,
    );
    err.statusCode = 400;
    err.expectedFee = expected;
    return err;
  }
  return null;
}
