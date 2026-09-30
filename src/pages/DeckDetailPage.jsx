import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Play,
  Edit2,
  Trash2,
  X,
  Code,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Lightbulb,
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

  const [expandedCards, setExpandedCards] = useState({});
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [activeCardId, setActiveCardId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    hint: '',
    explanation: '',
    codeSnippet: '',
  });

  // Delete State
  const [deleteCardId, setDeleteCardId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDeckAndCards = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchCardsByDeck(deckId);
      setDeck(data.deck);
      setCards(data.cards || []);
    } catch (err) {
      setError(err.message || 'Failed to load deck details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeckAndCards();
  }, [deckId]);

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyCode = (id, snippet) => {
    navigator.clipboard.writeText(snippet);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const openAddCardModal = () => {
    setModalMode('create');
    setActiveCardId(null);
    setFormData({
      question: '',
      answer: '',
      hint: '',
      explanation: '',
      codeSnippet: '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditCardModal = (card) => {
    setModalMode('edit');
    setActiveCardId(card._id);
    setFormData({
      question: card.question || '',
      answer: card.answer || '',
      hint: card.hint || '',
      explanation: card.explanation || '',
      codeSnippet: card.codeSnippet || '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) {
      setModalError('Both a Question and an Answer are required.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');
    try {
      if (modalMode === 'create') {
        await createCard(deckId, formData);
        setSuccessMessage('Card added to deck.');
      } else {
        await updateCard(activeCardId, formData);
        setSuccessMessage('Card updated.');
      }
      setIsModalOpen(false);
      loadDeckAndCards();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setModalError(err.message || 'Failed to save card.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteCard = async () => {
    if (!deleteCardId) return;
    setIsDeleting(true);
    try {
      await deleteCard(deleteCardId);
      setDeleteCardId(null);
      setSuccessMessage('Card deleted.');
      loadDeckAndCards();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete card.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-pulse space-y-4">
        <div className="h-6 bg-stone-200 rounded w-1/4" />
        <div className="h-28 bg-stone-200 rounded-2xl w-full" />
        <div className="h-20 bg-stone-200 rounded-xl w-full" />
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-stone-700 font-medium">{error || 'Deck not found.'}</p>
        <Link
          to="/my-decks"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Decks</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/my-decks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Decks</span>
        </Link>
      </div>

      {/* Deck Header Card */}
      <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="px-2 py-0.5 rounded-md font-medium text-[11px] bg-stone-100 text-stone-700">
                {deck.category || 'General'}
              </span>
              <span>·</span>
              <span className="capitalize">{deck.difficulty || 'beginner'}</span>
              <span>·</span>
              <span>{cards.length} card{cards.length === 1 ? '' : 's'}</span>
            </div>

            <h1 className="text-2xl font-bold text-stone-900 leading-tight">
              {deck.title}
            </h1>

            {deck.description && (
              <p className="text-sm text-stone-600 leading-relaxed max-w-xl">
                {deck.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={openAddCardModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-800 text-xs font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Card</span>
            </button>

            {cards.length > 0 && (
              <Link
                to={`/study/${deck._id}`}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                <Play className="w-3.5 h-3.5 fill-current text-amber-300" />
                <span>Study Deck</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cards List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <h2 className="font-bold text-stone-800 text-sm">Flashcards ({cards.length})</h2>
          <span>Click card to reveal full answer</span>
        </div>

        {cards.length === 0 ? (
          <div className="p-10 rounded-2xl bg-white border border-dashed border-stone-200 text-center space-y-3">
            <p className="text-sm text-stone-600">This deck has no flashcards yet.</p>
            <button
              onClick={openAddCardModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold shadow-2xs"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Add the First Card</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {cards.map((card, idx) => {
              const isExpanded = !!expandedCards[card._id];

              return (
                <div
                  key={card._id}
                  className="rounded-2xl bg-white border border-stone-200/90 shadow-2xs overflow-hidden transition-all"
                >
                  <div
                    onClick={() => toggleExpand(card._id)}
                    className="p-4 sm:p-5 cursor-pointer hover:bg-stone-50/50 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <span className="font-semibold text-stone-500 font-mono">
                          Card {idx + 1}
                        </span>
                        {card.hint && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                            <Lightbulb className="w-3 h-3" />
                            <span>Has hint</span>
                          </span>
                        )}
                        {card.codeSnippet && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                            <Code className="w-3 h-3" />
                            <span>Code snippet</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-semibold text-stone-900 leading-snug">
                        {card.question}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditCardModal(card)}
                        className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
                        title="Edit card"
                        aria-label="Edit card"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteCardId(card._id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete card"
                        aria-label="Delete card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleExpand(card._id)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg transition-colors ml-1"
                        aria-label={isExpanded ? 'Collapse card' : 'Expand card'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-stone-100 space-y-3 bg-stone-50/40 text-left">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                          Answer
                        </span>
                        <p className="text-sm text-stone-800 leading-relaxed mt-1">
                          {card.answer}
                        </p>
                      </div>

                      {card.codeSnippet && (
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                            <span>Code Example</span>
                            <button
                              onClick={() => handleCopyCode(card._id, card.codeSnippet)}
                              className="inline-flex items-center gap-1 text-stone-500 hover:text-stone-800"
                            >
                              {copiedCodeId === card._id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <pre className="p-3 rounded-xl bg-stone-900 text-stone-200 text-xs font-mono overflow-x-auto">
                            {card.codeSnippet}
                          </pre>
                        </div>
                      )}

                      {card.hint && (
                        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                          <strong>Hint:</strong> {card.hint}
                        </div>
                      )}

                      {card.explanation && (
                        <div className="p-2.5 rounded-lg bg-stone-100 text-xs text-stone-700 leading-relaxed">
                          <strong>Explanation:</strong> {card.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add / Edit Card Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-stone-200 shadow-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">
                {modalMode === 'create' ? 'Add Flashcard' : 'Edit Flashcard'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Question *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. What is the difference between synchronous and asynchronous code?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Answer *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Clear, concise explanation for your active recall check..."
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Code Snippet (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste syntax or example code here..."
                  value={formData.codeSnippet}
                  onChange={(e) => setFormData({ ...formData, codeSnippet: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-stone-300 bg-stone-50 focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Hint (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Small clue if you get stuck..."
                    value={formData.hint}
                    onChange={(e) => setFormData({ ...formData, hint: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Extended Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Why this concept matters..."
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-2xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Add Card' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Card Confirmation */}
      {deleteCardId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-stone-200 shadow-lg p-6 space-y-4">
            <h2 className="text-base font-bold text-stone-900">Delete this card?</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              This card will be removed from the deck and will no longer appear in your study sessions.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteCardId(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCard}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-2xs disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
