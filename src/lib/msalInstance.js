import { PublicClientApplication } from '@azure/msal-browser';
import msalConfig from './authConfig';

let msalInstance = null;
let initPromise = null;

export const getMsalInstance = () => {
  if (!msalInstance) {
    msalInstance = new PublicClientApplication(msalConfig);
  }
  return msalInstance;
};

/**
 * Single initialization path for the SPA MSAL instance (required before redirect handling / logout).
 */
export const initializeMsal = async () => {
  const instance = getMsalInstance();
  if (!initPromise) {
    initPromise = instance.initialize().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  await initPromise;
  if (typeof window !== 'undefined') {
    window.msalInstance = instance;
  }
  return instance;
};
