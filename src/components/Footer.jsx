import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 mt-auto text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-slate-800">CardForge</span> — Developer Flashcard & Interview Prep Platform
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-slate-900 transition-colors">Home</Link>
          <Link to="/explore" className="hover:text-slate-900 transition-colors">Explore</Link>
          <Link to="/login" className="hover:text-slate-900 transition-colors">Login</Link>
          <Link to="/register" className="hover:text-slate-900 transition-colors">Register</Link>
        </div>
        <div className="text-slate-400">
          © {new Date().getFullYear()} CardForge. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
