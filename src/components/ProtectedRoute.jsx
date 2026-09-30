import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mb-3 text-slate-900" />
        <span className="text-xs font-medium">Verifying authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
