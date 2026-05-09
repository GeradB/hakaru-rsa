import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginRequest } from '../lib/authConfig';
import { initializeMsal } from '../lib/msalInstance';
import { signOutAdmin } from '../lib/adminSignOut';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [msalInstance, setMsalInstance] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let cancelled = false;

    initializeMsal()
      .then((instance) => {
        if (cancelled) return;

        setMsalInstance(instance);
        setIsInitialized(true);

        const isAdminAuthenticated = localStorage.getItem('adminAuth') === 'true';

        if (isAdminAuthenticated) {
          const accounts = instance.getAllAccounts();
          if (accounts.length > 0) {
            const account = accounts[0];
            instance.setActiveAccount(account);
            instance
              .acquireTokenSilent({
                scopes: loginRequest.scopes,
                account,
              })
              .then((tokenResponse) => {
                if (cancelled) return;
                if (tokenResponse.idToken) {
                  localStorage.setItem('entraIdToken', tokenResponse.idToken);
                  navigate('/admin/gallery', { replace: true });
                }
              })
              .catch(() => {
                localStorage.removeItem('adminAuth');
                localStorage.removeItem('entraIdToken');
                instance.setActiveAccount(null);
              });
          }
        }
      })
      .catch((err) => {
        console.error('MSAL initialization error:', err);
        if (!cancelled) setError('Failed to initialize authentication');
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    if (!msalInstance || !isInitialized) return;

    msalInstance.handleRedirectPromise().then((response) => {
      if (!response?.account) return;

      msalInstance.setActiveAccount(response.account);
      if (response.idToken) {
        localStorage.setItem('entraIdToken', response.idToken);
        localStorage.setItem('adminAuth', 'true');
      }
      navigate('/admin/gallery', { replace: true });
    }).catch((err) => {
      console.error('Redirect handler error:', err);
    });
  }, [msalInstance, isInitialized, navigate]);

  const handleLogin = () => {
    if (!msalInstance || !isInitialized) {
      setError('Authentication not initialized');
      return;
    }
    msalInstance.loginRedirect(loginRequest).catch((err) => {
      console.error('Login redirect error:', err);
      setError('Failed to initiate login');
    });
  };

  const handleLogout = () => {
    signOutAdmin().catch((err) => {
      console.error('Sign out error:', err);
      window.location.assign('/admin/login');
    });
  };

  const activeAccount =
    msalInstance?.getActiveAccount() ??
    msalInstance?.getAllAccounts()?.[0] ??
    null;

  const showSignedIn =
    localStorage.getItem('adminAuth') === 'true' && !!activeAccount;

  if (!msalInstance || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 border-t-4 border-rsa-gold text-center">
          <p className="text-rsa-navy">Loading authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 border-t-4 border-rsa-gold">
        <h1 className="text-2xl font-bold font-heading text-rsa-navy mb-2 text-center">
          Site admin
        </h1>
        <p className="text-gray-600 text-sm text-center mb-6">
          Sign in to manage the photo gallery.
        </p>

        {showSignedIn ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">Signed in as</p>
              <p className="text-green-900 font-bold">{activeAccount.name || activeAccount.username}</p>
              <p className="text-green-700 text-sm">{activeAccount.idTokenClaims?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-rsa-navy text-white py-3 rounded-md font-bold hover:bg-slate-800 focus:ring-4 focus:ring-rsa-gold/50"
            >
              Sign out
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full bg-rsa-navy text-white py-3 rounded-md font-bold hover:bg-slate-800 focus:ring-4 focus:ring-rsa-gold/50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Microsoft
            </button>
          </>
        )}

        <p className="mt-6 text-center">
          <Link to="/" className="text-rsa-navy underline hover:text-rsa-gold text-sm">
            Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
