import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Check,
  Code,
  Copy,
  CheckCircle2,
  Lightbulb,
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

  // Active study state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
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
        setShowHint(false);
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
      setShowHint(false);
    }
  };

  const handleNextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowHint(false);
    }
  };

  const handleRestartFull = () => {
    setCards(allDeckCards);
    setIsReviewingWeakOnly(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
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
      setShowHint(false);
      setSessionAnswers({});
      setIsSessionComplete(false);
      setSessionStartTime(Date.now());
      setSessionSynced(false);
    }
  };

  // Sync session to backend on completion
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
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
      } else if (e.key === '1') {
        e.preventDefault();
        handleMark('learning');
      } else if (e.key === '2') {
        e.preventDefault();
        handleMark('known');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setShowHint((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleMark, isSessionComplete, currentIndex, cards.length]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-stone-300 border-t-stone-800 animate-spin mx-auto" />
        <p className="text-sm text-stone-500">Preparing your study session...</p>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-stone-700 font-medium">{error || 'Deck not found'}</p>
        <Link
          to="/my-decks"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Decks</span>
        </Link>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-stone-900">No cards in this deck yet</h2>
        <p className="text-sm text-stone-600">Add cards to this deck before beginning a study session.</p>
        <Link
          to={`/my-decks/${deck._id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium"
        >
          <span>Manage Deck Cards</span>
        </Link>
      </div>
    );
  }

  // Calculate completion numbers
  const knownCount = Object.values(sessionAnswers).filter((v) => v === 'known').length;
  const learningCount = Object.values(sessionAnswers).filter((v) => v === 'learning').length;

  /* -------------------------------------------------------------
     COMPLETION SCREEN
     "Deck complete!
      You reviewed 12 cards.
      8 Known
      4 Still Learning
      [ Review Again ]
      [ Back to Dashboard ]"
  ------------------------------------------------------------- */
  if (isSessionComplete) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center space-y-8">
        {/* Subtle success check icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            Deck complete!
          </h1>
          <p className="text-base text-stone-600">
            You reviewed {cards.length} card{cards.length === 1 ? '' : 's'} in {deck.title}.
          </p>
        </div>

        {/* Clean summary breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-2xs grid grid-cols-2 gap-4 text-center">
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100/80">
            <span className="text-xs font-semibold text-emerald-800">Known</span>
            <div className="text-2xl font-bold text-emerald-900 mt-0.5">{knownCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100/80">
            <span className="text-xs font-semibold text-amber-800">Still Learning</span>
            <div className="text-2xl font-bold text-amber-900 mt-0.5">{learningCount}</div>
          </div>
        </div>

        {/* Primary actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleRestartFull}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition-colors shadow-2xs"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
            <span>Review Again</span>
          </button>

          {learningCount > 0 && !isReviewingWeakOnly && (
            <button
              onClick={handleReviewWeakOnly}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium text-sm hover:bg-amber-100 transition-colors"
            >
              <span>Practice {learningCount} Weak Cards</span>
            </button>
          )}

          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-medium text-sm hover:bg-stone-50 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------
     ACTIVE STUDY VIEW
  ------------------------------------------------------------- */
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* 1. Header: Exit / Title / Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit</span>
          </Link>

          <h2 className="text-sm font-semibold text-stone-800 truncate max-w-[200px] sm:max-w-xs">
            {deck.title}
          </h2>

          <span className="text-xs font-semibold text-stone-600 font-mono">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>

        {/* Minimal progress bar */}
        <div className="w-full bg-stone-200/80 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-stone-900 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Large Dominant Flashcard with Smooth 3D Flip */}
      <div
        onClick={handleFlip}
        className="relative w-full h-[380px] sm:h-[420px] cursor-pointer perspective-1000 select-none group"
        role="button"
        tabIndex={0}
        aria-label="Flashcard. Click or press space to flip."
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform rounded-2xl border border-stone-200 bg-white shadow-sm hover:shadow-md ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front: Question */}
          <div className="absolute inset-0 w-full h-full backface-hidden p-6 sm:p-8 flex flex-col justify-between rounded-2xl bg-white overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-bold uppercase tracking-wider text-[11px] text-stone-400">
                Question
              </span>
              <span className="text-stone-500 font-medium">Click to reveal</span>
            </div>

            <div className="my-auto space-y-4 py-2">
              <h3 className="text-xl sm:text-2xl font-semibold text-stone-900 leading-snug">
                {currentCard.question}
              </h3>

              {/* Code Snippet if present */}
              {currentCard.codeSnippet && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="relative rounded-xl bg-stone-900 text-stone-100 p-3 sm:p-4 text-xs font-mono overflow-x-auto text-left"
                >
                  <button
                    onClick={() => handleCopyCode(currentCard.codeSnippet)}
                    className="absolute top-2 right-2 p-1 text-stone-400 hover:text-white transition-colors"
                    title="Copy code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <pre>{currentCard.codeSnippet}</pre>
                </div>
              )}

              {/* Optional Hint */}
              {currentCard.hint && (
                <div onClick={(e) => e.stopPropagation()} className="pt-1">
                  {showHint ? (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed text-left">
                      <strong>Hint:</strong> {currentCard.hint}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowHint(true)}
                      className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-800 transition-colors"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>Show hint</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="text-center pt-2 border-t border-stone-100">
              <span className="text-xs text-stone-500 font-medium">
                Click card or press <kbd className="font-mono font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">Space</kbd> to reveal answer
              </span>
            </div>
          </div>

          {/* Card Back: Answer */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 p-6 sm:p-8 flex flex-col justify-between rounded-2xl bg-white border-2 border-stone-900 overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Answer
              </span>
              <span className="text-stone-500 font-medium">Click to flip back</span>
            </div>

            <div className="my-auto space-y-4 py-2 text-left">
              <div className="text-base sm:text-lg leading-relaxed text-stone-900 font-normal">
                {currentCard.answer}
              </div>

              {currentCard.explanation && (
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed">
                  {currentCard.explanation}
                </div>
              )}
            </div>

            <div className="text-center pt-2 border-t border-stone-100">
              <span className="text-xs text-stone-500">
                Click card or press <kbd className="font-mono font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded text-[11px]">Space</kbd> to flip back
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Evaluation Bar: How did you do? */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-3">
        <div className="text-center">
          <span className="text-xs font-semibold text-stone-600">
            How did you do?
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleMark('learning')}
            className={`py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              sessionAnswers[currentCard._id] === 'learning'
                ? 'bg-amber-100 text-amber-900 border-2 border-amber-400'
                : 'bg-stone-50 hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200'
            }`}
          >
            <span>Still Learning</span>
            <kbd className="hidden sm:inline font-mono text-[11px] px-1.5 py-0.5 rounded bg-white/80 text-stone-500 border border-stone-200">
              1
            </kbd>
          </button>

          <button
            onClick={() => handleMark('known')}
            className={`py-3 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              sessionAnswers[currentCard._id] === 'known'
                ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-500'
                : 'bg-stone-900 hover:bg-stone-800 text-white shadow-2xs'
            }`}
          >
            <span>I Know This</span>
            <kbd className="hidden sm:inline font-mono text-[11px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
              2
            </kbd>
          </button>
        </div>
      </div>

      {/* 4. Navigation & Shortcuts */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <button
          onClick={handlePrevCard}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-1.5 py-1 px-2 rounded-lg hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span className="hidden sm:inline text-stone-400 text-[11px]">
          Shortcuts: Space to flip · 1 & 2 to rate · ← / → to move
        </span>

        <button
          onClick={handleNextCard}
          disabled={currentIndex === cards.length - 1}
          className="inline-flex items-center gap-1.5 py-1 px-2 rounded-lg hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span>Next</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
