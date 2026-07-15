import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { nzdToMinorUnits, verifyPaidPaymentIntent } from './stripePayments.js';

describe('nzdToMinorUnits', () => {
  it('converts dollars to cents', () => {
    assert.equal(nzdToMinorUnits(20), 2000);
    assert.equal(nzdToMinorUnits('12.50'), 1250);
  });
});

describe('verifyPaidPaymentIntent', () => {
  it('allows no-payment-required only for zero amount', async () => {
    const zero = await verifyPaidPaymentIntent(null, {
      paymentIntentId: 'no-payment-required',
      expectedAmountNzd: 0,
    });
    assert.equal(zero.status, 'succeeded');

    await assert.rejects(
      () =>
        verifyPaidPaymentIntent(null, {
          paymentIntentId: 'no-payment-required',
          expectedAmountNzd: 45,
        }),
      (err) => err.statusCode === 402,
    );
  });

  it('rejects forged pi ids without Stripe retrieve', async () => {
    const stripe = {
      paymentIntents: {
        retrieve: async () => {
          throw new Error('not found');
        },
      },
    };
    await assert.rejects(
      () =>
        verifyPaidPaymentIntent(stripe, {
          paymentIntentId: 'pi_fake',
          expectedAmountNzd: 50,
        }),
      (err) => err.statusCode === 400,
    );
  });

  it('accepts succeeded intent with matching amount', async () => {
    const stripe = {
      paymentIntents: {
        retrieve: async () => ({
          id: 'pi_abc123',
          status: 'succeeded',
          amount: 5000,
          currency: 'nzd',
          metadata: {},
        }),
      },
    };
    const verified = await verifyPaidPaymentIntent(stripe, {
      paymentIntentId: 'pi_abc123',
      expectedAmountNzd: 50,
    });
    assert.equal(verified.amountNzd, 50);
  });
});
