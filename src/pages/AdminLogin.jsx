import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiUrl } from '../apiBase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(apiUrl('/api/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      navigate('/admin/gallery', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 border-t-4 border-rsa-gold">
        <h1 className="text-2xl font-bold font-heading text-rsa-navy mb-2 text-center">
          Site admin
        </h1>
        <p className="text-gray-600 text-sm text-center mb-6">
          Sign in to manage the photo gallery.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="admin-user" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="admin-user"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-rsa-gold focus:border-rsa-gold"
              required
            />
          </div>
          <div>
            <label htmlFor="admin-pass" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="admin-pass"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-rsa-gold focus:border-rsa-gold"
              required
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-rsa-navy text-white py-3 rounded-md font-bold hover:bg-slate-800 disabled:opacity-50 focus:ring-4 focus:ring-rsa-gold/50"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center">
          <Link to="/" className="text-rsa-navy underline hover:text-rsa-gold text-sm">
            Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
