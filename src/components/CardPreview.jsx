import React, { useState } from 'react';
import { RotateCw, CheckCircle2, BookOpen } from 'lucide-react';

export default function CardPreview() {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-2">
        <span className="text-xs font-medium text-slate-500">
          Try it: Click anywhere on the card to flip
        </span>
      </div>

      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative h-64 w-full cursor-pointer perspective-1000 select-none group"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsFlipped(!isFlipped);
          }
        }}
        aria-label="Interactive sample flashcard"
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform shadow-xs hover:shadow-md rounded-xl border border-slate-200 bg-white ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front */}
          <div className="absolute inset-0 w-full h-full backface-hidden p-6 flex flex-col justify-between rounded-xl bg-white">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">JavaScript Basics</span>
              <span>Card 1 of 5</span>
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2">Question</p>
              <h3 className="text-lg font-semibold text-slate-900 leading-snug">
                What is the difference between <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-sm text-slate-800">let</code> and <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-sm text-slate-800">const</code>?
              </h3>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium group-hover:text-slate-800 transition-colors">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Click to reveal answer</span>
            </div>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 p-6 flex flex-col justify-between rounded-xl bg-slate-900 text-white">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-medium text-emerald-400">Answer</span>
              <span className="text-slate-400">JavaScript Basics</span>
            </div>

            <div className="my-auto text-center px-4">
              <p className="text-sm leading-relaxed text-slate-200">
                <strong className="text-white">let</strong> allows reassigning values and is block-scoped, while <strong className="text-white">const</strong> creates a block-scoped reference that cannot be reassigned after declaration.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400">Click to flip back</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
