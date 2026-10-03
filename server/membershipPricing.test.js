import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getMembershipFee,
  getExpectedMembershipFee,
  isHalfPricePromoActive,
  assertSubmittedFeeMatchesSchedule,
} from './membershipPricing.js';

function nzDate(year, month, day, hour = 12) {
  // Build a UTC instant that is the given civil date at midday in NZ (approx; DST-safe enough for month/day tests)
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00+13:00`;
  return new Date(iso);
}

describe('half-price promo window (NZ)', () => {
  it('is inactive before 1 October', () => {
    assert.equal(isHalfPricePromoActive(nzDate(2026, 9, 30)), false);
  });

  it('is active on 1 October', () => {
    assert.equal(isHalfPricePromoActive(nzDate(2026, 10, 1)), true);
  });

  it('is active through November', () => {
    assert.equal(isHalfPricePromoActive(nzDate(2026, 11, 15)), true);
  });

  it('is active on 1 December', () => {
    assert.equal(isHalfPricePromoActive(nzDate(2026, 12, 1)), true);
  });

  it('is inactive on 2 December', () => {
    assert.equal(isHalfPricePromoActive(nzDate(2026, 12, 2)), false);
  });
});

describe('getMembershipFee', () => {
  it('halves standard fees during promo', () => {
    const d = nzDate(2026, 10, 15);
    assert.equal(getMembershipFee('Returned & Service', d), 20);
    assert.equal(getMembershipFee('Associate (Non-Military)', d), 20);
    assert.equal(getMembershipFee('Youth (Under 18)', d), 5);
    assert.equal(getMembershipFee('Over 80s', d), 5);
  });

  it('keeps free types at zero', () => {
    const d = nzDate(2026, 10, 15);
    assert.equal(getMembershipFee('Over 90s', d), 0);
    assert.equal(getMembershipFee('Life Member', d), 0);
  });

  it('uses full price outside promo', () => {
    const d = nzDate(2026, 3, 1);
    assert.equal(getMembershipFee('Returned & Service', d), 40);
    assert.equal(getMembershipFee('Youth (Under 18)', d), 10);
  });
});

describe('getExpectedMembershipFee', () => {
  it('doubles for joint application during promo', () => {
    const fee = getExpectedMembershipFee(
      { membershipType: 'Associate (Non-Military)', fullName2: 'Jane Doe' },
      nzDate(2026, 10, 15),
    );
    assert.equal(fee, 40);
  });
});

describe('assertSubmittedFeeMatchesSchedule', () => {
  it('accepts matching promo fee', () => {
    const err = assertSubmittedFeeMatchesSchedule(
      { membershipType: 'Returned & Service' },
      20,
      nzDate(2026, 10, 15),
    );
    assert.equal(err, null);
  });

  it('rejects full price during promo', () => {
    const err = assertSubmittedFeeMatchesSchedule(
      { membershipType: 'Returned & Service' },
      40,
      nzDate(2026, 10, 15),
    );
    assert.ok(err);
    assert.equal(err.statusCode, 400);
  });
});
