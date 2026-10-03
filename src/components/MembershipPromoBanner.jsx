import { HALF_PRICE_PROMO, isHalfPricePromoActive } from '../../shared/membershipPricing.js';

/** Seasonal half-price notice for membership apply / renew flows. */
export default function MembershipPromoBanner() {
  if (!isHalfPricePromoActive()) return null;

  return (
    <div
      className="mb-6 rounded-xl border-2 border-rsa-gold bg-rsa-gold/15 px-4 py-3 text-rsa-navy shadow-sm"
      role="status"
    >
      <p className="font-heading text-lg font-bold">
        {HALF_PRICE_PROMO.label}
      </p>
      <p className="text-sm text-rsa-navy/80">
        Membership applications and renewals are half price from{' '}
        <strong>{HALF_PRICE_PROMO.windowLabel}</strong> (NZ time). Standard
        Returned &amp; Service / Associate fees are <strong>$20</strong> instead of $40.
      </p>
    </div>
  );
}

export function FeeDisplay({ amount, baseAmount }) {
  const showStrike =
    Number.isFinite(baseAmount) &&
    Number.isFinite(amount) &&
    baseAmount > 0 &&
    amount < baseAmount;

  if (amount === 0) {
    return <span className="font-bold text-rsa-navy text-lg">Free</span>;
  }

  return (
    <span className="font-bold text-rsa-navy text-lg inline-flex items-baseline gap-2">
      {showStrike ? (
        <span className="text-sm font-semibold text-gray-400 line-through">
          ${Number(baseAmount).toFixed(2)}
        </span>
      ) : null}
      <span>${Number(amount).toFixed(2)}</span>
    </span>
  );
}
