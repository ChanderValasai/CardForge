import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, LogOut, User as UserIcon, Layers, Compass, RotateCcw, TrendingUp } from 'lucide-react';
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
        { name: 'Dashboard', path: '/dashboard', icon: Layers },
        { name: 'My Decks', path: '/my-decks', icon: BookOpen },
        { name: 'Explore', path: '/explore', icon: Compass },
        { name: 'Review', path: '/review', icon: RotateCcw },
        { name: 'Progress', path: '/progress', icon: TrendingUp },
      ]
    : [
        { name: 'Home', path: '/', icon: Layers },
        { name: 'Explore', path: '/explore', icon: Compass },
      ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Zone 1: Single-element Brand Wordmark */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-2.5 text-stone-900 group"
          >
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center transition-transform group-hover:scale-105">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-stone-900 font-sans">
              CardForge
            </span>
          </Link>

          {/* Zone 2: Navigation Links (Clean text links with active indicator) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`transition-colors py-1 relative ${
                    active
                      ? 'text-stone-900 font-semibold'
                      : 'hover:text-stone-900'
                  }`}
                >
                  <span>{link.name}</span>
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-200/60 transition-colors"
                  title="Your Profile"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-bold text-[11px]">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="max-w-[120px] truncate">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-2xs whitespace-nowrap"
                >
                  Start Learning
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-700 hover:text-stone-900 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-stone-200 bg-[#FAF9F5] px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium ${
                  isActive(link.path)
                    ? 'bg-stone-200/70 text-stone-900 font-semibold'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                <link.icon className="w-4 h-4 text-stone-500" />
                <span>{link.name}</span>
              </Link>
            ))}

            <div className="pt-3 mt-2 border-t border-stone-200 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
                  >
                    <UserIcon className="w-4 h-4 text-stone-500" />
                    <span>Profile ({user?.name})</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 rounded-lg text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center px-4 py-2 text-sm font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800"
                  >
                    Start Learning
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation for quick thumb access when authenticated */}
      {isAuthenticated && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#FAF9F5]/95 backdrop-blur-md border-t border-stone-200/80 px-2 py-1.5 flex items-center justify-around"
        >
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[11px] font-medium transition-colors ${
                  active
                    ? 'text-stone-900 font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${active ? 'text-stone-900' : 'text-stone-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
