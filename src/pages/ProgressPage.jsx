import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchStudyStats } from '../services/api.js';
import { ArrowLeft, BookOpen, CheckCircle2, RotateCcw, Flame } from 'lucide-react';

export default function ProgressPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudyStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Error fetching stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-6">
        <div className="h-6 bg-stone-200 rounded w-1/4" />
        <div className="h-40 bg-stone-200 rounded-2xl w-full" />
        <div className="h-48 bg-stone-200 rounded-2xl w-full" />
      </div>
    );
  }

  const totalReviewed = stats?.totalPracticed || 0;
  const known = stats?.masteredCount || 0;
  const stillLearning = Math.max(0, totalReviewed - known);
  const accuracy = stats?.overallAccuracy || (totalReviewed > 0 ? Math.round((known / totalReviewed) * 100) : 0);
  const streak = stats?.streak || 0;
  const recentSessions = stats?.recentSessions || [];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Header with back link */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
          Your Progress
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          A calm summary of what you have practiced and what you know.
        </p>
      </div>

      {/* Main Retention Card */}
      <div className="p-6 sm:p-7 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Retention rate
            </span>
            <div className="text-4xl sm:text-5xl font-bold text-stone-900 font-sans mt-1">
              {totalReviewed > 0 ? `${accuracy}%` : '—'}
            </div>
          </div>

          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{streak} day streak</span>
            </div>
          )}
        </div>

        {/* Simple single retention progress bar */}
        {totalReviewed > 0 && (
          <div className="space-y-2">
            <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, accuracy))}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-stone-500">
              <span>{known} known</span>
              <span>{stillLearning} still learning</span>
            </div>
          </div>
        )}

        {/* Clean numbers breakdown */}
        <div className="divide-y divide-stone-100 border-t border-stone-100 pt-3">
          <div className="py-2.5 flex items-center justify-between text-sm">
            <span className="text-stone-600">Cards reviewed</span>
            <span className="font-semibold text-stone-900">{totalReviewed}</span>
          </div>
          <div className="py-2.5 flex items-center justify-between text-sm">
            <span className="text-stone-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Cards known</span>
            </span>
            <span className="font-semibold text-emerald-800">{known}</span>
          </div>
          <div className="py-2.5 flex items-center justify-between text-sm">
            <span className="text-stone-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Still learning</span>
            </span>
            <span className="font-semibold text-amber-800">{stillLearning}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-stone-900">Recent activity</h2>

        {recentSessions.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-stone-200/80 text-center text-sm text-stone-500">
            No study sessions recorded yet. Start a deck to see your learning history!
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-stone-200/90 shadow-2xs divide-y divide-stone-100 overflow-hidden">
            {recentSessions.map((session, index) => {
              const dateStr = session.createdAt
                ? new Date(session.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Recent';

              return (
                <div key={session._id || index} className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-stone-900">
                      {session.deck?.title || 'Study Session'}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {session.totalCards} cards reviewed · {session.knownCount || 0} known
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold text-emerald-800 bg-emerald-50">
                      {session.accuracy || 0}% score
                    </span>
                    <div className="text-[11px] text-stone-400 mt-0.5">{dateStr}</div>
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
