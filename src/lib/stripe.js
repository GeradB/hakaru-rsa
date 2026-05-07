import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;
  }
  return stripePromise;
};
