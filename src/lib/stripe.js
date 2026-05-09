import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Initialize Stripe immediately when module loads for optimal latency
export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export const getStripe = () => stripePromise;
