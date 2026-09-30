import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  Layers,
  Clock,
  RotateCcw,
  Play,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { fetchReviewQueue } from '../services/api.js';

export default function ReviewPage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviewQueue()
      .then((data) => {
        setQueue(data.queue || []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load review queue.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mb-3 text-slate-900" />
        <span className="text-xs font-medium">Checking spaced repetition queue...</span>
      </div>
    );
  }

  // Group queue items by deck
  const deckGroups = queue.reduce((acc, item) => {
    const deckId = item.deck._id;
    if (!acc[deckId]) {
      acc[deckId] = {
        deck: item.deck,
        items: [],
      };
    }
    acc[deckId].items.push(item);
    return acc;
  }, {});

  const distinctDeckGroups = Object.values(deckGroups);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Spaced Repetition
            </span>
            <span className="text-xs font-mono text-slate-500">
              {queue.length} {queue.length === 1 ? 'card' : 'cards'} due
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Review Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cards scheduled for reinforcement based on your study history and recall confidence.
          </p>
        </div>

        {queue.length > 0 && distinctDeckGroups.length > 0 && (
          <Link
            to={`/study/${distinctDeckGroups[0].deck._id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors shadow-2xs self-start sm:self-auto"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Study Next Deck</span>
          </Link>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {queue.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center max-w-md mx-auto my-8 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mb-2">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>All Caught Up</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">
            No Cards Due for Review
          </h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Your spaced repetition schedule is up to date! As you study more decks and mark cards, they will automatically appear here when it's time to review.
          </p>
          <div className="flex items-center justify-center gap-2.5">
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <span>Explore Decks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/my-decks"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50 transition-colors"
            >
              <span>My Decks</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {distinctDeckGroups.map((group) => (
            <div
              key={group.deck._id}
              className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden"
            >
              {/* Deck Group Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                      {group.deck.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {group.items.length} {group.items.length === 1 ? 'card due' : 'cards due'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{group.deck.title}</h3>
                </div>

                <Link
                  to={`/study/${group.deck._id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded hover:bg-slate-800 transition-colors shadow-2xs"
                >
                  <Play className="w-3 h-3" />
                  <span>Review Deck</span>
                </Link>
              </div>

              {/* Due Cards List */}
              <div className="divide-y divide-slate-100">
                {group.items.map((item, idx) => (
                  <div
                    key={item.progressId}
                    className="p-4 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="shrink-0 w-5 h-5 rounded bg-slate-100 text-slate-600 font-mono text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                              item.status === 'learning'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {item.status === 'learning' ? 'Still Learning' : 'Known'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Interval: {item.intervalDays} {item.intervalDays === 1 ? 'day' : 'days'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Reps: {item.repetitions}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 leading-snug">
                          {item.card.question}
                        </p>
                      </div>
                    </div>

                    <Link
                      to={`/study/${group.deck._id}`}
                      className="shrink-0 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 self-center"
                    >
                      <span>Practice</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
