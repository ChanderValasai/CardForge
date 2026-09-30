import React from 'react';
import { Link } from 'react-router-dom';
import CardPreview from '../components/CardPreview.jsx';
import { BookOpen, CheckSquare, Layers, ArrowRight, ShieldCheck, Zap, Brain } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md px-3 py-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Technical Interview Preparation</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">Active Recall & Spaced Repetition</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
            Master Technical Concepts with Flashcards
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
            CardForge is a lightweight, distraction-free flashcard platform for software engineers preparing for technical interviews. Create decks, study with hands-on-keyboard shortcuts, and build long-term retention.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-colors shadow-xs"
            >
              Start Learning Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-white border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
            >
              Browse Decks
            </Link>
          </div>

          {/* Value Props Strip */}
          <div className="pt-6 border-t border-slate-200/80 max-w-xl">
            <div className="grid grid-cols-3 gap-4 text-left">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 mb-0.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Keyboard-First</span>
                </div>
                <div className="text-xs text-slate-500">Fast active recall practice</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 mb-0.5">
                  <Brain className="w-3.5 h-3.5 text-indigo-500" />
                  <span>SM-2 Memory</span>
                </div>
                <div className="text-xs text-slate-500">Spaced repetition queue</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Curated Sets</span>
                </div>
                <div className="text-xs text-slate-500">JS, React, SQL & more</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Flashcard Preview */}
        <div className="lg:col-span-5 flex justify-center">
          <CardPreview />
        </div>
      </div>

      {/* Feature Section */}
      <div className="border-t border-slate-200 pt-12">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900">How CardForge Works</h2>
          <p className="text-sm text-slate-600 mt-1">
            Built for active recall and zero-distraction retention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-lg border border-slate-200 bg-white shadow-2xs">
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-800 mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base mb-1">Create & Organize Decks</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Organize flashcards by topic and difficulty, such as JavaScript Basics, React Fundamentals, or SQL.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-slate-200 bg-white shadow-2xs">
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-800 mb-3">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base mb-1">Focus Study Mode</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Study one card at a time with smooth 3D flip card interaction. Move back and forth and view progress.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-slate-200 bg-white shadow-2xs">
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-800 mb-3">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-base mb-1">Real Review Tracking</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Mark cards as "I Know This" or "Review Again". Return to the Review queue to reinforce difficult concepts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
