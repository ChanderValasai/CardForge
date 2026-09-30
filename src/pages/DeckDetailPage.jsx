import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Play,
  Edit2,
  Trash2,
  Copy,
  Check,
  Code,
  HelpCircle,
  Lightbulb,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  fetchCardsByDeck,
  createCard,
  updateCard,
  deleteCard,
} from '../services/api.js';

export default function DeckDetailPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Expand states for answer, hint, explanation
  const [expandedCards, setExpandedCards] = useState({});
  const [copiedCardId, setCopiedCardId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [activeCardId, setActiveCardId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete Confirmation State
  const [deleteCardId, setDeleteCardId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    hint: '',
    explanation: '',
    codeSnippet: '',
    difficulty: 'Medium',
  });

  const loadDeckAndCards = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCardsByDeck(deckId);
      setDeck(data.deck);
      setCards(data.cards || []);
      // Expand all answers by default for easy review
      const initialExpanded = {};
      (data.cards || []).forEach((c) => {
        initialExpanded[c._id] = true;
      });
      setExpandedCards(initialExpanded);
    } catch (err) {
      setError(err.message || 'Failed to load deck flashcards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeckAndCards();
  }, [deckId]);

  const toggleExpand = (cardId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const handleCopyCode = (cardId, code) => {
    navigator.clipboard.writeText(code);
    setCopiedCardId(cardId);
    setTimeout(() => setCopiedCardId(null), 2000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setActiveCardId(null);
    setFormData({
      question: '',
      answer: '',
      hint: '',
      explanation: '',
      codeSnippet: '',
      difficulty: 'Medium',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (card) => {
    setModalMode('edit');
    setActiveCardId(card._id);
    setFormData({
      question: card.question,
      answer: card.answer,
      hint: card.hint || '',
      explanation: card.explanation || '',
      codeSnippet: card.codeSnippet || '',
      difficulty: card.difficulty || 'Medium',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      setModalError('Both question and answer are required.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      if (modalMode === 'create') {
        const res = await createCard(deckId, formData);
        setCards([...cards, res.card]);
        setExpandedCards((prev) => ({ ...prev, [res.card._id]: true }));
        setSuccessMessage('Flashcard added successfully.');
      } else {
        const res = await updateCard(activeCardId, formData);
        setCards(cards.map((c) => (c._id === activeCardId ? res.card : c)));
        setSuccessMessage('Flashcard updated successfully.');
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      setModalError(err.message || 'Failed to save flashcard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!deleteCardId) return;
    setIsDeleting(true);
    try {
      await deleteCard(deleteCardId);
      setCards(cards.filter((c) => c._id !== deleteCardId));
      setDeleteCardId(null);
      setSuccessMessage('Flashcard deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to delete flashcard.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin mb-3 text-slate-900" />
        <span className="text-xs font-medium">Loading deck & flashcards...</span>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-1">Unable to Load Deck</h2>
        <p className="text-sm text-slate-600 mb-6">{error || 'Deck not found.'}</p>
        <Link
          to="/my-decks"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to My Decks</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Navigation Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
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
              <span className="text-xs text-slate-400 font-mono">
                {cards.length} {cards.length === 1 ? 'card' : 'cards'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{deck.title}</h1>
            {deck.description && (
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">{deck.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {cards.length > 0 && (
            <Link
              to={`/study/${deck._id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700 transition-colors shadow-2xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Study Deck</span>
            </Link>
          )}

          {deck.isOwner && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Flashcards List */}
      <div className="my-8">
        {cards.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-10 text-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">
              No flashcards in this deck yet
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              Add your first technical interview question, answer, code snippet, and explanation to begin learning.
            </p>
            {deck.isOwner && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Flashcard</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card, idx) => {
              const isExpanded = expandedCards[card._id];
              return (
                <div
                  key={card._id}
                  className="bg-white border border-slate-200 rounded-lg shadow-2xs transition-all overflow-hidden"
                >
                  {/* Card Header / Question Row */}
                  <div className="p-5 flex items-start justify-between gap-4 bg-white">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="shrink-0 w-6 h-6 rounded bg-slate-100 text-slate-600 font-mono text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              card.difficulty === 'Easy'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : card.difficulty === 'Medium'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {card.difficulty}
                          </span>
                          {card.codeSnippet && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              <Code className="w-3 h-3" />
                              <span>Code</span>
                            </span>
                          )}
                          {card.hint && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              <Lightbulb className="w-3 h-3" />
                              <span>Hint</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 leading-snug">
                          {card.question}
                        </h3>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {deck.isOwner && (
                        <>
                          <button
                            onClick={() => openEditModal(card)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                            title="Edit card"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCardId(card._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                            title="Delete card"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => toggleExpand(card._id)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors"
                        title={isExpanded ? 'Collapse card' : 'Expand card'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Details Area */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-4">
                      {/* Answer Section */}
                      <div>
                        <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Answer</span>
                        </div>
                        <div className="text-sm text-slate-800 bg-white p-3.5 rounded-md border border-slate-200 leading-relaxed whitespace-pre-wrap">
                          {card.answer}
                        </div>
                      </div>

                      {/* Code Snippet */}
                      {card.codeSnippet && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5 text-[11px] uppercase font-bold tracking-wider text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Code className="w-3.5 h-3.5 text-slate-600" />
                              <span>Code Example</span>
                            </span>
                            <button
                              onClick={() => handleCopyCode(card._id, card.codeSnippet)}
                              className="inline-flex items-center gap-1 text-[11px] font-mono normal-case text-slate-500 hover:text-slate-900 p-1 rounded"
                            >
                              {copiedCardId === card._id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-600">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-md font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                            <code>{card.codeSnippet}</code>
                          </pre>
                        </div>
                      )}

                      {/* Hint & Explanation Grid */}
                      {(card.hint || card.explanation) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {card.hint && (
                            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-md">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-1">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                                <span>Hint</span>
                              </div>
                              <p className="text-xs text-amber-900 leading-relaxed">
                                {card.hint}
                              </p>
                            </div>
                          )}

                          {card.explanation && (
                            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-md">
                              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-800 mb-1">
                                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                                <span>Why It Matters</span>
                              </div>
                              <p className="text-xs text-blue-900 leading-relaxed">
                                {card.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full p-6 relative animate-in fade-in zoom-in-95 duration-150 my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {modalMode === 'create' ? 'Add New Flashcard' : 'Edit Flashcard'}
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Include questions, concise answers, code examples, and interview hints.
            </p>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                {modalError}
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="card-question">
                  Question *
                </label>
                <textarea
                  id="card-question"
                  rows={2}
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="e.g. What is the difference between Array.prototype.map and forEach?"
                  className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="card-answer">
                  Answer *
                </label>
                <textarea
                  id="card-answer"
                  rows={3}
                  required
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Concise and precise technical explanation..."
                  className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="card-code">
                  Code Snippet (Optional)
                </label>
                <textarea
                  id="card-code"
                  rows={4}
                  value={formData.codeSnippet}
                  onChange={(e) => setFormData({ ...formData, codeSnippet: e.target.value })}
                  placeholder="// Provide code example or syntax demonstration"
                  className="w-full px-3 py-2 font-mono text-xs rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 bg-slate-950 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="card-hint">
                    Hint (Optional)
                  </label>
                  <input
                    id="card-hint"
                    type="text"
                    value={formData.hint}
                    onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                    placeholder="e.g. Think about return values"
                    className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="card-difficulty">
                    Difficulty
                  </label>
                  <select
                    id="card-difficulty"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 bg-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="card-explanation">
                  Explanation / Deep Dive (Optional)
                </label>
                <textarea
                  id="card-explanation"
                  rows={2}
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  placeholder="Additional architectural context or interviewer follow-up tips..."
                  className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalMode === 'create' ? 'Save Card' : 'Update Card'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Card Confirmation Modal */}
      {deleteCardId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">Delete this flashcard?</h3>
            <p className="text-xs text-slate-600 mb-6">
              This card will be permanently removed from this deck.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteCardId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteCard}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-md hover:bg-rose-700 transition-colors disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
