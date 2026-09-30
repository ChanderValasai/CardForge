import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Play, ArrowRight, BookOpen } from 'lucide-react';
import { fetchDecks } from '../services/api.js';

export default function ExplorePage() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'JavaScript',
    'React',
    'SQL',
    'Computer Science',
    'Web Development',
  ];

  const loadDecks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDecks({
        filter: 'explore',
        category: selectedCategory,
        search: searchTerm,
      });
      setDecks(data.decks || []);
    } catch (err) {
      setError(err.message || 'Failed to load decks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDecks();
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const getCategoryStyles = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('javascript') || cat.includes('js')) {
      return { border: 'border-l-amber-500', badge: 'text-amber-800 bg-amber-50/80' };
    }
    if (cat.includes('react')) {
      return { border: 'border-l-blue-500', badge: 'text-blue-800 bg-blue-50/80' };
    }
    if (cat.includes('sql') || cat.includes('database')) {
      return { border: 'border-l-emerald-500', badge: 'text-emerald-800 bg-emerald-50/80' };
    }
    if (cat.includes('computer science') || cat.includes('typescript')) {
      return { border: 'border-l-purple-500', badge: 'text-purple-800 bg-purple-50/80' };
    }
    return { border: 'border-l-stone-400', badge: 'text-stone-700 bg-stone-100' };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          Explore
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Find something interesting to learn.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-3">
        {/* Simple Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search topics, questions, or concepts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-stone-200/90 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 shadow-2xs"
          />
        </div>

        {/* Category Filter Pills (Functional Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white border border-stone-200/80 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Decks Catalog */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-44 bg-stone-200/80 rounded-2xl animate-pulse" />
          <div className="h-44 bg-stone-200/80 rounded-2xl animate-pulse" />
        </div>
      ) : decks.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white border border-stone-200/90 text-center space-y-2">
          <p className="text-sm font-semibold text-stone-900">No decks found</p>
          <p className="text-xs text-stone-500">Try adjusting your search terms or filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {decks.map((deck) => {
            const styles = getCategoryStyles(deck.category);

            return (
              <div
                key={deck._id}
                className={`p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow border-l-4 ${styles.border} flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${styles.badge}`}>
                      {deck.category || 'General'}
                    </span>
                    <span className="font-mono text-stone-500">
                      {deck.cardCount || 0} card{deck.cardCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 leading-snug">
                    {deck.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                    {deck.description || 'Curated study deck for active recall practice.'}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-stone-400 capitalize">
                    {deck.difficulty || 'beginner'}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/my-decks/${deck._id}`}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium transition-colors"
                    >
                      Preview
                    </Link>
                    <Link
                      to={`/study/${deck._id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors shadow-2xs"
                    >
                      <Play className="w-3 h-3 fill-current text-amber-300" />
                      <span>Study</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
