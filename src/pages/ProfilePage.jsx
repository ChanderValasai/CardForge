import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Save, Loader2, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    const res = await updateProfile(name);
    setIsSaving(false);

    if (res.success) {
      setSuccessMessage('Profile name updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } else {
      setErrorMessage(res.error || 'Failed to update profile.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 pb-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your account information and preferences.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-md hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-2xs">
        {successMessage && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="name">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Email cannot be changed after registration.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Member Since
            </label>
            <div className="flex items-center gap-2 text-sm text-slate-700 py-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-mono text-xs">{formattedDate}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="submit"
              disabled={isSaving || name === user?.name}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
