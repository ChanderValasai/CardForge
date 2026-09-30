import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to original route or /dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await login(formData.email, formData.password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-2xs">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Sign in to CardForge</h1>
          <p className="text-sm text-slate-600 mt-1">
            Access your decks and active learning progress.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isSubmitting}
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors disabled:bg-slate-50 disabled:opacity-70"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700" htmlFor="password">
                Password
              </label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors disabled:bg-slate-50 disabled:opacity-70"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-slate-900 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
