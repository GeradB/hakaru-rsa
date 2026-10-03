/**
 * Membership / renewal fee schedule (NZD).
 * Half-price promo: 1 October – 1 December (inclusive), Pacific/Auckland.
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
  /** Shown in UI */
  windowLabel: '1 October – 1 December',
  multiplier: 0.5,
  timeZone: 'Pacific/Auckland',
});

function roundMoney(n) {
  return Math.round(Number(n) * 100) / 100;
}

/** @returns {{ year: number, month: number, day: number }} month 1–12 */
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

/** True from 1 Oct through 1 Dec inclusive (NZ calendar date). */
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

/** Fee charged for a membership type on the given date (promo applied when active). */
export function getMembershipFee(membershipType, now = new Date()) {
  const base = getBaseMembershipFee(membershipType);
  if (base <= 0) return 0;
  if (isHalfPricePromoActive(now)) return roundMoney(base * HALF_PRICE_PROMO.multiplier);
  return base;
}

/** Map of type → current fee */
export function getMembershipFees(now = new Date()) {
  const out = {};
  for (const type of Object.keys(BASE_MEMBERSHIP_FEES)) {
    out[type] = getMembershipFee(type, now);
  }
  return out;
}

/**
 * Expected membership/renewal fee for a form payload.
 * Joint applications (fullName2) pay 2× the selected type fee.
 */
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
