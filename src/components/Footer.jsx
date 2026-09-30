import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-stone-200/80 bg-[#FAF9F5] py-8 pb-20 md:pb-8 mt-auto text-xs text-stone-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-stone-900 text-amber-300 flex items-center justify-center">
            <BookOpen className="w-3 h-3" />
          </div>
          <span className="font-semibold text-stone-800">CardForge</span>
          <span className="text-stone-300">·</span>
          <span>Learning doesn't have to feel complicated.</span>
        </div>

        <div className="flex items-center gap-5 font-medium">
          <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
          <Link to="/explore" className="hover:text-stone-900 transition-colors">Explore</Link>
          <Link to="/review" className="hover:text-stone-900 transition-colors">Review</Link>
          <Link to="/login" className="hover:text-stone-900 transition-colors">Log in</Link>
          <Link to="/register" className="hover:text-stone-900 transition-colors">Start Learning</Link>
        </div>

        <div className="text-stone-400">
          © {new Date().getFullYear()} CardForge
        </div>
      </div>
    </footer>
  );
}
