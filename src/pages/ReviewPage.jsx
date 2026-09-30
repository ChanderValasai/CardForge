import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Play, ArrowRight, RotateCcw, BookOpen } from 'lucide-react';
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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Checking your review list...</p>
      </div>
    );
  }

  // Group queue items by deck
  const deckGroups = queue.reduce((acc, item) => {
    const deckId = item.deck?._id || 'unknown';
    if (!acc[deckId]) {
      acc[deckId] = {
        deck: item.deck,
        items: [],
      };
    }
    acc[deckId].items.push(item);
    return acc;
  }, {});

  const distinctGroups = Object.values(deckGroups);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          Cards to Review
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Let's revisit the concepts you're still learning.
        </p>
      </div>

      {/* Empty State */}
      {queue.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-2xl bg-white border border-stone-200/90 shadow-2xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h2 className="text-xl font-bold text-stone-900">
              You're all caught up!
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              There are no cards waiting for review right now. Keep your momentum going by discovering new topics.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/explore"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition-colors shadow-2xs"
            >
              <span>Explore Decks</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Cards Due for Review */
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-stone-500 px-1">
            <span>{queue.length} card{queue.length === 1 ? '' : 's'} scheduled for reinforcement</span>
            <span>Spaced Repetition</span>
          </div>

          <div className="space-y-5">
            {distinctGroups.map((group) => {
              const deckTitle = group.deck?.title || 'Study Deck';
              const deckId = group.deck?._id;

              return (
                <div
                  key={deckId || Math.random()}
                  className="rounded-2xl bg-white border border-stone-200/90 shadow-2xs overflow-hidden"
                >
                  {/* Deck Group Header */}
                  <div className="p-4 sm:p-5 bg-stone-50/70 border-b border-stone-200/80 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-stone-900">{deckTitle}</h2>
                      <p className="text-xs text-stone-500">
                        {group.items.length} card{group.items.length === 1 ? '' : 's'} to practice
                      </p>
                    </div>

                    {deckId && (
                      <Link
                        to={`/study/${deckId}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors shadow-2xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current text-amber-300" />
                        <span>Study Deck</span>
                      </Link>
                    )}
                  </div>

                  {/* Individual Card Items */}
                  <div className="divide-y divide-stone-100">
                    {group.items.map((item) => {
                      const card = item.card;
                      const progress = item.progress;

                      return (
                        <div key={card?._id || Math.random()} className="p-4 sm:p-5 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm font-semibold text-stone-900 leading-snug">
                              {card?.question || 'Question prompt'}
                            </h3>
                            <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                              Review
                            </span>
                          </div>

                          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                            {card?.answer || ''}
                          </p>

                          <div className="text-[11px] text-stone-400 flex items-center gap-2 pt-1">
                            <span>Repetition #{progress?.repetitions || 0}</span>
                            <span>·</span>
                            <span>Interval: {progress?.intervalDays || 1} day{(progress?.intervalDays || 1) === 1 ? '' : 's'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
