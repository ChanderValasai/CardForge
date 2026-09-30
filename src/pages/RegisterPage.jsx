import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await register(formData);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-2xs">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Create an Account</h1>
          <p className="text-sm text-slate-600 mt-1">
            Build your personal flashcards and track technical review progress.
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
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              disabled={isSubmitting}
              value={formData.name}
              onChange={handleChange}
              placeholder="Alex Chen"
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors disabled:bg-slate-50 disabled:opacity-70"
            />
          </div>

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
              placeholder="alex@example.com"
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors disabled:bg-slate-50 disabled:opacity-70"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="password">
              Password (min. 6 characters)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              disabled={isSubmitting}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors disabled:bg-slate-50 disabled:opacity-70"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              disabled={isSubmitting}
              value={formData.confirmPassword}
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
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-slate-900 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
