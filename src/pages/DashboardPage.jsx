import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchStudyStats, fetchDecks, fetchReviewQueue } from '../services/api.js';
import { BookOpen, ArrowRight, Play, RotateCcw, Plus, Sparkles, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [decks, setDecks] = useState([]);
  const [reviewDueCount, setReviewDueCount] = useState(0);

  // Time-appropriate friendly greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, decksData, reviewData] = await Promise.all([
          fetchStudyStats().catch(() => ({})),
          fetchDecks().catch(() => ({ decks: [] })),
          fetchReviewQueue().catch(() => ({ queue: [] })),
        ]);

        if (isMounted) {
          setStats(statsData);
          setDecks(decksData.decks || []);
          setReviewDueCount(reviewData.queue ? reviewData.queue.length : 0);
        }
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Determine the next recommended learning action
  const hasActivity = stats?.totalPracticed > 0 || (stats?.recentSessions && stats.recentSessions.length > 0);
  const lastSession = stats?.recentSessions && stats.recentSessions.length > 0 ? stats.recentSessions[0] : null;
  const recommendedDeck = lastSession?.deck || decks[0] || null;

  // Deck category styling helper
  const getCategoryTheme = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('javascript') || cat.includes('js')) {
      return { border: 'border-l-amber-500', tag: 'text-amber-800 bg-amber-50/80', dot: 'bg-amber-500' };
    }
    if (cat.includes('react')) {
      return { border: 'border-l-blue-500', tag: 'text-blue-800 bg-blue-50/80', dot: 'bg-blue-500' };
    }
    if (cat.includes('sql') || cat.includes('database')) {
      return { border: 'border-l-emerald-500', tag: 'text-emerald-800 bg-emerald-50/80', dot: 'bg-emerald-500' };
    }
    return { border: 'border-l-purple-500', tag: 'text-purple-800 bg-purple-50/80', dot: 'bg-purple-500' };
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
        <div className="h-8 bg-stone-200 rounded-lg w-1/3" />
        <div className="h-44 bg-stone-200 rounded-2xl w-full" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-stone-200 rounded-xl" />
          <div className="h-20 bg-stone-200 rounded-xl" />
          <div className="h-20 bg-stone-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-10">
      {/* 1. Welcoming Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          {hasActivity
            ? 'Ready for a quick study session?'
            : 'Pick a deck and begin your first session.'}
        </p>
      </div>

      {/* 2. Primary Focal Point: What to do next */}
      {hasActivity ? (
        <section aria-labelledby="continue-learning-heading">
          <h2 id="continue-learning-heading" className="sr-only">Continue Learning</h2>
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/90 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="space-y-2 max-w-lg">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ready to continue</span>
                </div>

                <h3 className="text-xl font-bold text-stone-900">
                  {reviewDueCount > 0 ? (
                    <>You have {reviewDueCount} card{reviewDueCount === 1 ? '' : 's'} to review</>
                  ) : recommendedDeck ? (
                    <>Continue with {recommendedDeck.title}</>
                  ) : (
                    <>Ready for your next review</>
                  )}
                </h3>

                <p className="text-sm text-stone-600 leading-relaxed">
                  {reviewDueCount > 0
                    ? 'Revisit the concepts you marked for practice to lock them into long-term memory.'
                    : recommendedDeck?.description || 'A quick 5-minute study session keeps your recall sharp.'}
                </p>
              </div>

              <div className="shrink-0">
                {reviewDueCount > 0 ? (
                  <Link
                    to="/review"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition-colors shadow-2xs w-full sm:w-auto"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-300" />
                    <span>Review Cards</span>
                  </Link>
                ) : recommendedDeck ? (
                  <Link
                    to={`/study/${recommendedDeck._id}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition-colors shadow-2xs w-full sm:w-auto"
                  >
                    <Play className="w-4 h-4 fill-current text-amber-300" />
                    <span>Continue Learning</span>
                  </Link>
                ) : (
                  <Link
                    to="/explore"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition-colors shadow-2xs w-full sm:w-auto"
                  >
                    <span>Browse Decks</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Empty State when new user hasn't studied yet */
        <section aria-labelledby="start-learning-heading">
          <h2 id="start-learning-heading" className="sr-only">Start Learning</h2>
          <div className="p-8 rounded-2xl bg-white border border-stone-200/90 shadow-2xs text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-stone-900">
                Ready to start learning?
              </h3>
              <p className="text-sm text-stone-600">
                Choose a deck from the catalog or explore foundational topics to begin your first active recall session.
              </p>
            </div>
            <div className="pt-1">
              <Link
                to="/explore"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition-colors shadow-2xs"
              >
                <span>Explore Decks</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3. Your Learning (Honest, clean progress numbers — NOT a complex dashboard) */}
      <section aria-labelledby="your-learning-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="your-learning-heading" className="text-base font-bold text-stone-900">
            Your Learning
          </h2>
          {hasActivity && (
            <Link
              to="/progress"
              className="text-xs font-semibold text-stone-600 hover:text-stone-950 inline-flex items-center gap-1"
            >
              <span>View full progress</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs text-center sm:text-left">
            <span className="text-xs text-stone-500 font-medium">Reviewed</span>
            <div className="text-2xl font-bold text-stone-900 mt-1 font-sans">
              {stats?.totalPracticed || 0}
            </div>
            <span className="text-[11px] text-stone-400">cards total</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs text-center sm:text-left">
            <span className="text-xs text-emerald-700 font-medium">Known</span>
            <div className="text-2xl font-bold text-emerald-800 mt-1 font-sans">
              {stats?.masteredCount || 0}
            </div>
            <span className="text-[11px] text-stone-400">cards remembered</span>
          </div>

          <div className="p-4 rounded-xl bg-white border border-stone-200/80 shadow-2xs text-center sm:text-left">
            <span className="text-xs text-amber-700 font-medium">To Review</span>
            <div className="text-2xl font-bold text-amber-800 mt-1 font-sans">
              {reviewDueCount}
            </div>
            <span className="text-[11px] text-stone-400">waiting for review</span>
          </div>
        </div>
      </section>

      {/* 4. Your Decks */}
      <section aria-labelledby="your-decks-heading">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 id="your-decks-heading" className="text-base font-bold text-stone-900">
              Your Decks
            </h2>
            <p className="text-xs text-stone-500">Jump right into any topic you're studying.</p>
          </div>
          <Link
            to="/my-decks"
            className="inline-flex items-center gap-1 text-xs font-semibold text-stone-800 hover:text-stone-950"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Decks</span>
          </Link>
        </div>

        {decks.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-dashed border-stone-200 text-center space-y-3">
            <p className="text-sm text-stone-600">No personal decks created yet.</p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-800 hover:text-stone-950"
            >
              <span>Explore curated decks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {decks.slice(0, 4).map((deck) => {
              const theme = getCategoryTheme(deck.category);
              return (
                <div
                  key={deck._id}
                  className={`p-5 rounded-xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow border-l-4 ${theme.border} flex flex-col justify-between`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${theme.tag}`}>
                        {deck.category || 'General'}
                      </span>
                      <span>{deck.cardCount || 0} cards</span>
                    </div>

                    <h3 className="font-semibold text-stone-900 text-base leading-snug">
                      {deck.title}
                    </h3>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {deck.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 flex items-center justify-between border-t border-stone-100">
                    <span className="text-[11px] font-medium text-stone-400 capitalize">
                      {deck.difficulty || 'beginner'}
                    </span>
                    <Link
                      to={`/study/${deck._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current text-amber-300" />
                      <span>Study</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
