import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  RotateCcw,
  Plus,
  ArrowRight,
  Play,
  Loader2,
  Flame,
  Award,
  Calendar,
  Clock,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchDecks, fetchStudyStats } from '../services/api.js';

export default function DashboardPage() {
  const { user } = useAuth();
  const [userDecks, setUserDecks] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchDecks({ filter: 'my-decks' }),
      fetchStudyStats().catch((err) => {
        console.warn('Could not load stats:', err);
        return null;
      }),
    ])
      .then(([decksRes, statsRes]) => {
        setUserDecks(decksRes.decks || []);
        if (statsRes) setStatsData(statsRes);
      })
      .catch((err) => {
        console.warn('Dashboard failed to load initial data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const stats = statsData?.stats || {
    totalSessions: 0,
    totalCardsStudied: 0,
    averageAccuracy: 0,
    masteredCount: 0,
    knownCount: 0,
    learningCount: 0,
    dueCount: 0,
    streakDays: 0,
  };

  const weeklyActivity = statsData?.weeklyActivity || [];
  const recentSessions = statsData?.recentSessions || [];

  // Find max cards studied in 7 days for relative chart scaling
  const maxWeekly = Math.max(...weeklyActivity.map((d) => d.cardsStudied), 10);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
              Learning Dashboard
            </span>
            {stats.streakDays > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>{stats.streakDays} Day Streak</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name || 'Developer'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Signed in as <span className="font-mono text-slate-700">{user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Link
            to="/my-decks"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Deck</span>
          </Link>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50 transition-colors"
          >
            <span>Explore Catalog</span>
          </Link>
        </div>
      </div>

      {/* Due Review Notice Banner if cards are waiting */}
      {stats.dueCount > 0 && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Spaced Repetition: {stats.dueCount} {stats.dueCount === 1 ? 'card' : 'cards'} due for review today
              </h4>
              <p className="text-[11px] text-amber-700">
                Reinforce these concepts now before your memory retention begins to fade.
              </p>
            </div>
          </div>
          <Link
            to="/review"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-md hover:bg-amber-700 transition-colors self-start sm:self-auto shrink-0 shadow-2xs"
          >
            <span>Review Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {/* Total Cards Studied */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-600">Cards Practiced</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {stats.totalCardsStudied}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {stats.totalSessions} {stats.totalSessions === 1 ? 'session' : 'sessions'}
          </p>
        </div>

        {/* Mastered Cards */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-emerald-800">Mastered</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {stats.masteredCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Repeatedly recalled accurately</p>
        </div>

        {/* Average Accuracy */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-600">Avg Accuracy</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {stats.averageAccuracy}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Recall success rate</p>
        </div>

        {/* Active Streak */}
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-amber-800">Study Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">
            {stats.streakDays} <span className="text-xs font-normal text-slate-500">days</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Daily consistency</p>
        </div>
      </div>

      {/* Analytics & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-6">
        {/* Weekly 7-Day Activity Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">7-Day Study Volume</h3>
              <p className="text-xs text-slate-500 mt-0.5">Cards practiced each day this week</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              Last 7 Days
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-4 pb-2">
            <div className="h-36 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-100">
              {weeklyActivity.map((day, idx) => {
                const heightPercent =
                  maxWeekly > 0 ? Math.min(100, Math.max(8, (day.cardsStudied / maxWeekly) * 100)) : 8;
                const hasActivity = day.cardsStudied > 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-900 transition-colors">
                      {hasActivity ? day.cardsStudied : ''}
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[36px] rounded-t transition-all duration-300 ${
                        hasActivity
                          ? 'bg-slate-900 hover:bg-slate-700'
                          : 'bg-slate-100 hover:bg-slate-200'
                      }`}
                      title={`${day.date}: ${day.cardsStudied} cards studied`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between px-2 pt-2">
              {weeklyActivity.map((day, idx) => (
                <span
                  key={idx}
                  className="flex-1 text-center text-[10px] font-medium text-slate-500 font-mono"
                >
                  {day.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Spaced Repetition Mastery Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Knowledge Retention</h3>
            <p className="text-xs text-slate-500 mb-4">Cards categorized by spaced repetition</p>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Mastered (Interval &gt; 3d)</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">{stats.masteredCount}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${
                        stats.masteredCount + stats.knownCount + stats.learningCount > 0
                          ? (stats.masteredCount /
                              (stats.masteredCount + stats.knownCount + stats.learningCount)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-blue-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Known (Interval 1-3d)</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">{stats.knownCount}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${
                        stats.masteredCount + stats.knownCount + stats.learningCount > 0
                          ? (stats.knownCount /
                              (stats.masteredCount + stats.knownCount + stats.learningCount)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Learning / Review Queue</span>
                  </span>
                  <span className="font-mono font-bold text-slate-900">{stats.learningCount}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${
                        stats.masteredCount + stats.knownCount + stats.learningCount > 0
                          ? (stats.learningCount /
                              (stats.masteredCount + stats.knownCount + stats.learningCount)) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              to="/review"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
            >
              <span>Open Spaced Review Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Study Sessions Table */}
      {recentSessions.length > 0 && (
        <div className="my-6 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Recent Study Sessions</h3>
            <span className="text-xs text-slate-400 font-mono">Last {recentSessions.length} sessions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Deck</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-center">Cards</th>
                  <th className="pb-2 text-center">Accuracy</th>
                  <th className="pb-2 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSessions.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 font-semibold text-slate-900">{s.deckTitle}</td>
                    <td className="py-2.5 text-slate-600">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-slate-500">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-700">{s.totalCards}</td>
                    <td className="py-2.5 text-center">
                      <span
                        className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          s.accuracy >= 80
                            ? 'bg-emerald-50 text-emerald-700'
                            : s.accuracy >= 50
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {s.accuracy}%
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-slate-500 font-mono text-[11px]">
                      {new Date(s.completedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Your Decks Section */}
      <div className="my-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900">Your Decks ({userDecks.length})</h2>
          <Link
            to="/my-decks"
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : userDecks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              You haven't created any custom decks yet
            </h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mb-6">
              Create your own deck to organize technical interview questions, or study curated seed decks in Explore.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/my-decks"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Your First Deck</span>
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Explore Seed Decks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userDecks.slice(0, 3).map((deck) => (
              <div
                key={deck._id}
                className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {deck.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {deck.cardCount || 0} cards
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">
                    {deck.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {deck.description || 'No description provided.'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <Link
                    to={`/my-decks/${deck._id}`}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <span>Cards</span>
                  </Link>
                  <Link
                    to={`/study/${deck._id}`}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>Study</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
