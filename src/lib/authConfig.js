// MSAL Authentication Configuration for Entra ID
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
