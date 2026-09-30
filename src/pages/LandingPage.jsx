import React from 'react';
import { Link } from 'react-router-dom';
import CardPreview from '../components/CardPreview.jsx';
import { ArrowRight, BookOpen, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  const sampleDecks = [
    {
      title: 'JavaScript Basics',
      category: 'JavaScript',
      accent: 'amber',
      accentBorder: 'border-l-amber-500',
      tagColor: 'text-amber-700 bg-amber-50',
      cardsCount: 5,
      description: 'Scope, closures, event loop, and core concepts.',
    },
    {
      title: 'React Fundamentals',
      category: 'React',
      accent: 'blue',
      accentBorder: 'border-l-blue-500',
      tagColor: 'text-blue-700 bg-blue-50',
      cardsCount: 5,
      description: 'Components, hooks lifecycle, state, and props.',
    },
    {
      title: 'SQL Queries & Joins',
      category: 'SQL',
      accent: 'emerald',
      accentBorder: 'border-l-emerald-500',
      tagColor: 'text-emerald-700 bg-emerald-50',
      cardsCount: 4,
      description: 'INNER JOIN, LEFT JOIN, indexes, and aggregation.',
    },
    {
      title: 'TypeScript & Types',
      category: 'Computer Science',
      accent: 'purple',
      accentBorder: 'border-l-purple-500',
      tagColor: 'text-purple-700 bg-purple-50',
      cardsCount: 4,
      description: 'Interfaces, union types, generics, and narrowing.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16 sm:mb-20">
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 bg-white border border-stone-200/80 rounded-full px-3.5 py-1 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>CardForge Flashcards</span>
            <span className="text-stone-300">·</span>
            <span>Distraction-free learning</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 leading-[1.15]">
            Learn a little.
            <br />
            Remember a lot.
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-lg">
            Turn difficult topics into simple, bite-sized learning sessions. Practice active recall, flip at your own pace, and reinforce concepts when you need to.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition-colors shadow-2xs"
            >
              Start Learning
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-medium text-sm hover:bg-stone-50 transition-colors"
            >
              Explore Decks
            </Link>
          </div>
        </div>

        {/* Interactive Flashcard Preview */}
        <div className="lg:col-span-5 flex justify-center">
          <CardPreview />
        </div>
      </section>

      {/* How it works: 3 Simple Steps */}
      <section className="mb-16 sm:mb-20 pt-8 border-t border-stone-200/80">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
            How simple learning works
          </h2>
          <p className="text-sm text-stone-600 mt-1.5">
            No complicated routines. Just active recall that fits into your day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-semibold text-stone-900 text-base">Choose a topic</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Start with a curated deck or create your own custom flashcards for whatever you are currently studying.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-semibold text-stone-900 text-base">Test your recall</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Read the question, mentally state your answer, and flip to check. A clean focus mode keeps you in the zone.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-semibold text-stone-900 text-base">Review what needs work</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              Cards you are still learning automatically queue up so you never waste time re-studying what you already know.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Decks Catalog Preview */}
      <section className="mb-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Popular decks to start with</h2>
            <p className="text-sm text-stone-600 mt-0.5">Explore fundamental concepts ready to study right now.</p>
          </div>
          <Link
            to="/explore"
            className="text-sm font-semibold text-stone-800 hover:text-stone-950 inline-flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {sampleDecks.map((deck) => (
            <div
              key={deck.title}
              className={`p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow border-l-4 ${deck.accentBorder} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                  <span className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${deck.tagColor}`}>
                    {deck.category}
                  </span>
                  <span>{deck.cardsCount} cards</span>
                </div>
                <h3 className="font-semibold text-stone-900 text-base">{deck.title}</h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                  {deck.description}
                </p>
              </div>

              <div className="pt-4 mt-2 flex items-center justify-end">
                <Link
                  to="/register"
                  className="text-xs font-semibold text-stone-800 hover:text-stone-950 inline-flex items-center gap-1"
                >
                  <span>Start session</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Welcoming bottom banner */}
      <section className="rounded-3xl bg-stone-900 text-white p-8 sm:p-10 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Ready to learn something today?
        </h2>
        <p className="text-sm sm:text-base text-stone-300 max-w-md mx-auto">
          No complicated setup or timers. Pick a topic and review a few cards whenever you have five minutes.
        </p>
        <div className="pt-2">
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-stone-950 font-semibold text-sm hover:bg-amber-300 transition-colors shadow-sm"
          >
            Start Learning Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
