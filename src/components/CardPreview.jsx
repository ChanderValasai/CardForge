import React, { useState } from 'react';
import { RotateCcw, Check, Sparkles } from 'lucide-react';

export default function CardPreview() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [evaluated, setEvaluated] = useState(null);

  const handleEvaluation = (e, status) => {
    e.stopPropagation();
    setEvaluated(status);
  };

  const resetCard = (e) => {
    e.stopPropagation();
    setIsFlipped(false);
    setEvaluated(null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Friendly prompt */}
      <div className="flex items-center justify-between text-xs text-stone-500 mb-2 px-1">
        <span className="font-medium">Interactive Preview</span>
        <span>Click to flip</span>
      </div>

      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative h-72 sm:h-80 w-full cursor-pointer perspective-1000 select-none group"
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
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform rounded-2xl border border-stone-200 bg-white shadow-sm hover:shadow-md ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front (Question) */}
          <div className="absolute inset-0 w-full h-full backface-hidden p-6 sm:p-7 flex flex-col justify-between rounded-2xl bg-white">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                JavaScript
              </span>
              <span>Card 1 of 8</span>
            </div>

            <div className="my-auto space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Question
              </span>
              <h3 className="text-lg sm:text-xl font-semibold text-stone-900 leading-snug">
                What is a closure in JavaScript?
              </h3>
              <div className="bg-stone-900 text-stone-200 rounded-lg p-2.5 font-mono text-xs text-left">
                <span className="text-amber-300">function</span> makeAdder(x) &#123;
                <br />
                &nbsp;&nbsp;<span className="text-amber-300">return</span> (y) =&gt; x + y;
                <br />
                &#125;
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs text-stone-500 font-medium group-hover:text-stone-800 transition-colors pt-2 border-t border-stone-100">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Click card to reveal answer</span>
            </div>
          </div>

          {/* Card Back (Answer) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 p-6 sm:p-7 flex flex-col justify-between rounded-2xl bg-stone-900 text-white">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-emerald-400">
                Answer
              </span>
              <button
                onClick={resetCard}
                className="text-stone-400 hover:text-white text-xs underline underline-offset-2"
                title="Flip back to question"
              >
                Flip back
              </button>
            </div>

            <div className="my-auto space-y-2 text-left">
              <p className="text-sm sm:text-base leading-relaxed text-stone-100">
                A <strong>closure</strong> is a function that remembers and retains access to variables from its outer (lexical) scope, even after that outer function has returned.
              </p>
            </div>

            {/* Simulated evaluation loop */}
            <div className="pt-3 border-t border-stone-800">
              {evaluated ? (
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-400 py-1">
                  <Check className="w-4 h-4" />
                  <span>
                    {evaluated === 'known' ? 'Great recall! Spaced for later.' : 'Added to your review queue.'}
                  </span>
                </div>
              ) : (
                <div className="space-y-1.5 text-center">
                  <span className="text-[11px] text-stone-400 font-medium">How did you do?</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => handleEvaluation(e, 'learning')}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 font-medium text-xs transition-colors"
                    >
                      Still Learning
                    </button>
                    <button
                      onClick={(e) => handleEvaluation(e, 'known')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors"
                    >
                      I Know This
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
