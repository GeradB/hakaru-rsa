/**
 * Verify a Stripe PaymentIntent before marking membership/renewal/donation paid.
 */

export function nzdToMinorUnits(amountNzd) {
  return Math.round(Number(amountNzd) * 100);
}

/**
 * @param {import('stripe').default | null} stripe
 * @param {{
 *   paymentIntentId: string,
 *   expectedAmountNzd?: number | string | null,
 *   expectedCurrency?: string,
 *   metadata?: Record<string, string>,
 * }} opts
 */
export async function verifyPaidPaymentIntent(stripe, opts) {
  const {
    paymentIntentId,
    expectedAmountNzd,
    expectedCurrency = 'nzd',
    metadata = {},
  } = opts || {};

  if (!paymentIntentId || typeof paymentIntentId !== 'string') {
    const err = new Error('Missing paymentIntentId');
    err.statusCode = 400;
    throw err;
  }

  const expectedMinor = nzdToMinorUnits(expectedAmountNzd);
  const currency = (expectedCurrency || 'nzd').toLowerCase();

  // Zero-fee renewals (client sends this sentinel). Only when no charge expected.
  if (paymentIntentId === 'no-payment-required') {
    if (Number.isFinite(expectedMinor) && expectedMinor > 0) {
      const err = new Error('Payment required for this amount');
      err.statusCode = 402;
      throw err;
    }
    return {
      id: paymentIntentId,
      status: 'succeeded',
      amount: 0,
      currency,
      amountNzd: 0,
    };
  }

  if (!stripe) {
    const err = new Error('Stripe is not configured');
    err.statusCode = 501;
    throw err;
  }

  if (!/^pi_[A-Za-z0-9]+$/.test(paymentIntentId)) {
    const err = new Error('Invalid paymentIntentId');
    err.statusCode = 400;
    throw err;
  }

  let pi;
  try {
    pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch {
    const err = new Error('PaymentIntent not found');
    err.statusCode = 400;
    throw err;
  }

  if (pi.currency !== currency) {
    const err = new Error('Payment currency mismatch');
    err.statusCode = 400;
    throw err;
  }

  if (Number.isFinite(expectedMinor) && expectedMinor > 0) {
    if (Math.abs(pi.amount - expectedMinor) > 1) {
      const err = new Error('Payment amount mismatch');
      err.statusCode = 400;
      throw err;
    }
  }

  for (const [key, value] of Object.entries(metadata || {})) {
    if (value == null || value === '') continue;
    if (String(pi.metadata?.[key] || '') !== String(value)) {
      const err = new Error('Payment metadata mismatch');
      err.statusCode = 400;
      throw err;
    }
  }

  const okStatuses = new Set(['succeeded', 'processing']);
  if (!okStatuses.has(pi.status)) {
    const err = new Error(`Payment not completed (status: ${pi.status})`);
    err.statusCode = 402;
    throw err;
  }

  return {
    id: pi.id,
    status: pi.status,
    amount: pi.amount,
    currency: pi.currency,
    amountNzd: pi.amount / 100,
    metadata: pi.metadata || {},
  };
}
