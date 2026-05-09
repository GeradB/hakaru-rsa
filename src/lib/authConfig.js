// MSAL Authentication Configuration for Entra ID
//
// AADSTS9002326 ("Cross-origin token redemption… Single-Page Application"):
// In Azure Portal → App registrations → this app → Authentication, redirect URIs
// MUST be under platform "Single-page application", NOT "Web". Remove duplicate URIs
// from Web. Add each deployed origin, e.g. https://….azurestaticapps.net/admin/login
// and http(s)://localhost:5173/admin/login for dev (HTTPS if Vite uses HTTPS).

const msalConfig = {
  auth: {
    clientId: "4fafdc19-8a0c-4021-8d27-32a2a1594772",
    authority: "https://login.microsoftonline.com/0f9e3c4e-92b5-4caf-ae9a-56a7e71882a8",
    redirectUri: `${window.location.origin}/admin/login`,
    postLogoutRedirectUri: `${window.location.origin}/admin/login`,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
  redirectStartPage: `${window.location.origin}/admin/login`,
};

export default msalConfig;
