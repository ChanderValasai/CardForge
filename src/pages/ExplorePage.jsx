import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Layers, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { fetchDecks, triggerSeedDecks } from '../services/api.js';

export default function ExplorePage() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSeeding, setIsSeeding] = useState(false);

  const categories = [
    'All',
    'JavaScript',
    'React',
    'Databases',
    'Web Development',
    'Backend',
    'General',
  ];

  const loadExploreDecks = async () => {
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
      setError(err.message || 'Failed to load explore decks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadExploreDecks();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategory]);

  const handleSeedDecks = async () => {
    setIsSeeding(true);
    try {
      await triggerSeedDecks();
      await loadExploreDecks();
    } catch (err) {
      setError(err.message || 'Failed to populate seed decks.');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Curated Technical Material</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Explore Decks</h1>
        <p className="text-sm text-slate-600 mt-1">
          Explore curated technical decks to prepare for software engineering interviews.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between mb-8 pb-6 border-b border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search decks by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
          />
        </div>

        {/* Category Tabs (Segmented control) */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mb-3 text-slate-900" />
          <span className="text-xs font-medium">Loading explore decks...</span>
        </div>
      ) : decks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center shadow-2xs my-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            No decks found matching your filters
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Try adjusting your search criteria or load the standard technical interview seed decks.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSeedDecks}
              disabled={isSeeding}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              {isSeeding && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Restore Seed Decks</span>
            </button>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="px-3.5 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <div
              key={deck._id}
              className="p-6 bg-white border border-slate-200 rounded-lg flex flex-col justify-between hover:border-slate-300 transition-all shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {deck.category}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      deck.difficulty === 'Beginner'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : deck.difficulty === 'Intermediate'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {deck.difficulty}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">
                  {deck.title}
                </h2>

                <p className="text-sm text-slate-600 leading-relaxed mb-6 line-clamp-2 min-h-[40px]">
                  {deck.description || 'Curated flashcard collection for interview review.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <Layers className="w-3.5 h-3.5 text-slate-400" />
                  <span>{deck.cardCount || 0} cards</span>
                </div>
                <Link
                  to={`/study/${deck._id}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Study Deck</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
