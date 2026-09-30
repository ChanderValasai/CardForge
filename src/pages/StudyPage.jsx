import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  RotateCcw,
  X,
  Loader2,
  AlertCircle,
  Lightbulb,
  Code,
  Copy,
  Check,
  Trophy,
  Sparkles,
  HelpCircle,
  BookOpen,
  Keyboard,
} from 'lucide-react';
import { fetchCardsByDeck, recordStudySession } from '../services/api.js';

export default function StudyPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [allDeckCards, setAllDeckCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active study session state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHintFront, setShowHintFront] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState({});
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isReviewingWeakOnly, setIsReviewingWeakOnly] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [sessionSynced, setSessionSynced] = useState(false);

  // Load Deck & Cards
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    fetchCardsByDeck(deckId)
      .then((data) => {
        if (!isMounted) return;
        setDeck(data.deck);
        const deckCards = data.cards || [];
        setCards(deckCards);
        setAllDeckCards(deckCards);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load study cards for this deck.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [deckId]);

  const currentCard = cards[currentIndex];

  // Action handlers
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleMark = useCallback(
    (status) => {
      if (!currentCard) return;

      const updatedAnswers = {
        ...sessionAnswers,
        [currentCard._id]: status,
      };
      setSessionAnswers(updatedAnswers);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
        setShowHintFront(false);
      } else {
        setIsSessionComplete(true);
      }
    },
    [currentCard, sessionAnswers, currentIndex, cards.length]
  );

  const handlePrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowHintFront(false);
    }
  };

  const handleNextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHintFront(false);
    }
  };

  const handleRestartFull = () => {
    setCards(allDeckCards);
    setIsReviewingWeakOnly(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHintFront(false);
    setSessionAnswers({});
    setIsSessionComplete(false);
    setSessionStartTime(Date.now());
    setSessionSynced(false);
  };

  const handleReviewWeakOnly = () => {
    const weakCards = allDeckCards.filter(
      (c) => sessionAnswers[c._id] === 'learning'
    );
    if (weakCards.length > 0) {
      setCards(weakCards);
      setIsReviewingWeakOnly(true);
      setCurrentIndex(0);
      setIsFlipped(false);
      setShowHintFront(false);
      setSessionAnswers({});
      setIsSessionComplete(false);
      setSessionStartTime(Date.now());
      setSessionSynced(false);
    }
  };

  // Sync completed study session to backend
  useEffect(() => {
    if (isSessionComplete && deck && cards.length > 0 && !sessionSynced) {
      const known = Object.values(sessionAnswers).filter((v) => v === 'known').length;
      const review = Object.values(sessionAnswers).filter((v) => v === 'learning').length;
      const duration = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
      const responses = cards.map((c) => ({
        cardId: c._id,
        status: sessionAnswers[c._id] || 'known',
      }));

      recordStudySession({
        deckId: deck._id,
        totalCards: cards.length,
        knownCount: known,
        reviewCount: review,
        accuracy: Math.round((known / cards.length) * 100),
        durationSeconds: duration,
        cardResponses: responses,
      })
        .then(() => setSessionSynced(true))
        .catch((err) => console.warn('[StudyPage] session sync notice:', err));
    }
  }, [isSessionComplete, deck, cards, sessionAnswers, sessionSynced, sessionStartTime]);

  const handleCopyCode = (snippet) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (isSessionComplete) {
        if (e.key === 'r' || e.key === 'R') {
          handleRestartFull();
        }
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1' || e.key === 'ArrowLeft') {
        e.preventDefault();
        handleMark('learning');
      } else if (e.key === '2' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleMark('known');
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setShowHintFront((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleMark, isSessionComplete]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-slate-900" />
        <span className="text-sm font-medium">Preparing your study session...</span>
      </div>
    );
  }

  // Error state
  if (error || !deck) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Session Unavailable</h2>
        <p className="text-sm text-slate-600 mb-6">{error || 'Deck could not be loaded.'}</p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Available Decks</span>
        </Link>
      </div>
    );
  }

  // Empty deck state
  if (cards.length === 0 && !isSessionComplete) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">No Cards to Study</h2>
        <p className="text-sm text-slate-600 mb-6">
          This deck does not contain any flashcards yet. Add technical interview questions to begin active recall practice.
        </p>
        <div className="flex items-center justify-center gap-3">
          {deck.isOwner ? (
            <Link
              to={`/my-decks/${deck._id}`}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
            >
              Add Flashcards
            </Link>
          ) : (
            <Link
              to="/explore"
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
            >
              Explore Other Decks
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Calculate live stats
  const totalCount = cards.length;
  const knownCount = Object.values(sessionAnswers).filter((v) => v === 'known').length;
  const learningCount = Object.values(sessionAnswers).filter((v) => v === 'learning').length;
  const progressPercent = totalCount > 0 ? Math.round(((currentIndex + 1) / totalCount) * 100) : 0;
  const accuracyPercent =
    totalCount > 0 ? Math.round((knownCount / (knownCount + learningCount || 1)) * 100) : 0;

  // Complete Screen
  if (isSessionComplete) {
    const finalAccuracy = Math.round((knownCount / totalCount) * 100);

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-in fade-in duration-200">
        {/* Completion Header Banner */}
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs mb-8">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Session Complete</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            {isReviewingWeakOnly ? 'Targeted Review Finished!' : 'Great Work!'}
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            You completed all <span className="font-semibold text-slate-900">{totalCount} cards</span> in{' '}
            <span className="font-semibold text-slate-900">{deck.title}</span>.
          </p>

          {/* Accuracy Score Card */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6">
            <div>
              <div className="text-2xl font-bold font-mono text-slate-900">{totalCount}</div>
              <div className="text-[11px] uppercase font-semibold text-slate-500 mt-0.5">
                Total Practiced
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-emerald-600">{knownCount}</div>
              <div className="text-[11px] uppercase font-semibold text-emerald-700 mt-0.5">
                Mastered
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-amber-600">{learningCount}</div>
              <div className="text-[11px] uppercase font-semibold text-amber-700 mt-0.5">
                Needs Review
              </div>
            </div>
          </div>

          <div className="text-xs font-medium text-slate-500 mb-4">
            Accuracy Score:{' '}
            <span className="font-bold text-slate-900 text-sm font-mono">{finalAccuracy}%</span>
          </div>

          {sessionSynced && (
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md mb-6 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Session progress recorded & Spaced Repetition queue updated</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {learningCount > 0 && !isReviewingWeakOnly && (
              <button
                onClick={handleReviewWeakOnly}
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-md hover:bg-amber-700 transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Review Weak Cards Only ({learningCount})</span>
              </button>
            )}
            <button
              onClick={handleRestartFull}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Restart Full Session</span>
            </button>
            <button
              onClick={() => navigate('/my-decks')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50 transition-colors"
            >
              <span>Back to Decks</span>
            </button>
          </div>
        </div>

        {/* Breakdown of Practiced Questions */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
            <span>Card Performance Summary</span>
            <span className="text-xs font-normal text-slate-500 font-mono">
              {knownCount} / {totalCount} known
            </span>
          </h2>
          <div className="space-y-2.5">
            {cards.map((card, idx) => {
              const status = sessionAnswers[card._id];
              const isKnown = status === 'known';
              return (
                <div
                  key={card._id}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/60"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="shrink-0 w-5 h-5 rounded bg-slate-200 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-medium text-slate-800 leading-snug line-clamp-2">
                      {card.question}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isKnown
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isKnown ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Mastered</span>
                      </>
                    ) : (
                      <>
                        <RotateCcw className="w-3 h-3 text-amber-600" />
                        <span>Review</span>
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Header & Exit button */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
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
            {isReviewingWeakOnly && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Weak Cards Focus
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-slate-900">{deck.title}</h1>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit Session</span>
        </button>
      </div>

      {/* Progress & Live Counters */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-slate-900">
              Card {currentIndex + 1} of {totalCount}
            </span>
            <div className="hidden sm:flex items-center gap-2 font-mono text-[11px]">
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Known: {knownCount}
              </span>
              <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Review: {learningCount}
              </span>
            </div>
          </div>
          <span className="font-mono font-medium text-slate-500">{progressPercent}% Complete</span>
        </div>
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3D Flashcard Display */}
      <div className="mb-6">
        <div
          onClick={handleFlip}
          className="relative min-h-[360px] sm:min-h-[380px] w-full cursor-pointer perspective-1000 select-none group"
          role="button"
          tabIndex={0}
          aria-label="Flashcard - Click or press Space to flip"
        >
          <div
            className={`relative w-full min-h-[360px] sm:min-h-[380px] duration-500 transform-style-3d transition-transform rounded-xl border border-slate-200 shadow-xs ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* ================= Front of Card ================= */}
            <div className="absolute inset-0 w-full h-full backface-hidden p-6 sm:p-8 flex flex-col justify-between rounded-xl bg-white">
              {/* Front Header */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono uppercase font-bold tracking-wider text-[11px] text-slate-400">
                  Question
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                    currentCard.difficulty === 'Easy'
                      ? 'bg-emerald-50 text-emerald-700'
                      : currentCard.difficulty === 'Medium'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {currentCard.difficulty}
                </span>
              </div>

              {/* Question Text */}
              <div className="my-auto py-6">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {currentCard.question}
                </p>

                {/* Front Hint Reveal Toggle */}
                {currentCard.hint && (
                  <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                    {!showHintFront ? (
                      <button
                        onClick={() => setShowHintFront(true)}
                        className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1 rounded transition-colors"
                      >
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>Need a hint? (H)</span>
                      </button>
                    ) : (
                      <div className="p-3 bg-amber-50/80 border border-amber-200 text-amber-900 text-xs rounded-md leading-relaxed animate-in fade-in duration-150">
                        <div className="font-bold flex items-center gap-1 mb-0.5 text-amber-800">
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Hint</span>
                        </div>
                        {currentCard.hint}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Front Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400">
                <span className="text-[11px] font-mono">Press Space to Flip</span>
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                  <span>Click to reveal answer</span>
                </div>
              </div>
            </div>

            {/* ================= Back of Card ================= */}
            <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 p-6 sm:p-8 flex flex-col justify-between rounded-xl bg-slate-900 text-white overflow-y-auto">
              {/* Back Header */}
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="font-mono uppercase font-bold tracking-wider text-[11px] text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Answer</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Card {currentIndex + 1}/{totalCount}
                </span>
              </div>

              {/* Answer Content */}
              <div className="my-auto py-4 space-y-4">
                <p className="text-sm sm:text-base text-slate-100 leading-relaxed whitespace-pre-wrap">
                  {currentCard.answer}
                </p>

                {/* Code Snippet on Back */}
                {currentCard.codeSnippet && (
                  <div
                    className="rounded-lg bg-black/60 border border-slate-800 p-3 overflow-hidden text-left"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Code className="w-3 h-3" />
                        <span>Code Reference</span>
                      </span>
                      <button
                        onClick={() => handleCopyCode(currentCard.codeSnippet)}
                        className="inline-flex items-center gap-1 p-1 hover:text-white transition-colors"
                      >
                        {copiedCode ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                      <code>{currentCard.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Explanation Box */}
                {currentCard.explanation && (
                  <div className="p-3 bg-slate-800/80 rounded-md border border-slate-700/80 text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-slate-200 block mb-0.5">Why it matters:</span>
                    {currentCard.explanation}
                  </div>
                )}
              </div>

              {/* Back Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
                <span className="text-[11px] font-mono">Press Space to flip back</span>
                <span className="hover:text-slate-200 transition-colors">Click to view question</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Evaluation Actions (Review Again vs I Know This) */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600 text-center sm:text-left">
            <span className="font-semibold text-slate-900 block">Evaluate your recall:</span>
            <span className="text-[11px] text-slate-500">
              Flip the card first or rate your confidence directly
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Mark Review Again */}
            <button
              onClick={() => handleMark('learning')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors shadow-2xs group"
              title="Shortcut: 1 or Left Arrow"
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform" />
              <span>Review Again</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 bg-amber-600/60 rounded text-[10px] font-mono">
                1
              </kbd>
            </button>

            {/* Mark I Know This */}
            <button
              onClick={() => handleMark('known')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-2xs"
              title="Shortcut: 2 or Right Arrow"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>I Know This</span>
              <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 bg-emerald-700/60 rounded text-[10px] font-mono">
                2
              </kbd>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Controls: Previous / Next & Keyboard Shortcuts */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevCard}
            disabled={currentIndex === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <button
            onClick={handleNextCard}
            disabled={currentIndex === cards.length - 1}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Keyboard Helper Footer */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-slate-600">
              Space
            </kbd>{' '}
            Flip
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-slate-600">
              1
            </kbd>{' '}
            Review
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-slate-600">
              2
            </kbd>{' '}
            Know
          </span>
        </div>
      </div>
    </div>
  );
}
