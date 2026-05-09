import msalConfig from './authConfig';
import { apiUrl } from '../apiBase';
import { initializeMsal } from './msalInstance';

/**
 * Ends Entra session (Azure logout redirect), clears app-local markers, and clears cookie admin session.
 */
export async function signOutAdmin() {
  localStorage.removeItem('adminAuth');
  localStorage.removeItem('entraIdToken');

  try {
    await fetch(apiUrl('/api/admin/logout'), {
      method: 'POST',
      credentials: 'include',
    });
  } catch {
    // Non-fatal (e.g. API unreachable)
  }

  const instance = await initializeMsal();
  const account =
    instance.getActiveAccount() ?? instance.getAllAccounts()[0] ?? null;

  const postLogout = msalConfig.auth.postLogoutRedirectUri;

  if (account) {
    await instance.logoutRedirect({
      account,
      postLogoutRedirectUri: postLogout,
    });
    return;
  }

  window.location.assign(postLogout || '/admin/login');
}
