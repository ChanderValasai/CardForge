import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Layers, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const navLinks = isAuthenticated
    ? [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'My Decks', path: '/my-decks' },
        { name: 'Explore', path: '/explore' },
        { name: 'Review', path: '/review' },
      ]
    : [
        { name: 'Home', path: '/' },
        { name: 'Explore Decks', path: '/explore' },
      ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 group">
          <span className="w-8 h-8 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-base transition-colors group-hover:bg-slate-800">
            <Layers className="w-4 h-4 text-emerald-400" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            CardForge
          </span>
        </Link>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-colors pb-0.5 border-b-2 ${
                isActive(link.path)
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="View Profile"
              >
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[11px]">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
                <span className="max-w-[120px] truncate">{user?.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 border border-slate-200 rounded-md hover:border-red-200 hover:bg-red-50/50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 focus:outline-hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-sm rounded-md font-medium ${
                isActive(link.path)
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
                >
                  <UserIcon className="w-4 h-4 text-slate-500" />
                  <span>Profile ({user?.name})</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 text-sm font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
