import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Play,
  Edit2,
  Trash2,
  X,
  BookOpen,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { fetchDecks, createDeck, updateDeck, deleteDeck } from '../services/api.js';

export default function DecksPage() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [activeDeckId, setActiveDeckId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'JavaScript',
    difficulty: 'Beginner',
    isPublic: true,
  });

  // Delete State
  const [deleteDeckId, setDeleteDeckId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDecks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchDecks({ filter: 'my-decks' });
      setDecks(data.decks || []);
    } catch (err) {
      setError(err.message || 'Failed to load decks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecks();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setActiveDeckId(null);
    setFormData({
      title: '',
      description: '',
      category: 'JavaScript',
      difficulty: 'Beginner',
      isPublic: true,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (deck, e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalMode('edit');
    setActiveDeckId(deck._id);
    setFormData({
      title: deck.title,
      description: deck.description || '',
      category: deck.category || 'General',
      difficulty: deck.difficulty || 'Beginner',
      isPublic: deck.isPublic ?? true,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setModalError('Please give your deck a title.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');
    try {
      if (modalMode === 'create') {
        await createDeck(formData);
        setSuccessMessage('Deck created successfully.');
      } else {
        await updateDeck(activeDeckId, formData);
        setSuccessMessage('Deck updated successfully.');
      }
      setIsModalOpen(false);
      loadDecks();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setModalError(err.message || 'Failed to save deck.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async (e) => {
    e.preventDefault();
    if (!deleteDeckId) return;

    setIsDeleting(true);
    try {
      await deleteDeck(deleteDeckId);
      setDeleteDeckId(null);
      setSuccessMessage('Deck removed.');
      loadDecks();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete deck.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Subtle category styling
  const getCategoryStyles = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('javascript') || cat.includes('js')) {
      return {
        border: 'border-l-amber-500',
        badge: 'text-amber-800 bg-amber-50/80',
        dot: 'bg-amber-500',
      };
    }
    if (cat.includes('react')) {
      return {
        border: 'border-l-blue-500',
        badge: 'text-blue-800 bg-blue-50/80',
        dot: 'bg-blue-500',
      };
    }
    if (cat.includes('sql') || cat.includes('database')) {
      return {
        border: 'border-l-emerald-500',
        badge: 'text-emerald-800 bg-emerald-50/80',
        dot: 'bg-emerald-500',
      };
    }
    if (cat.includes('computer science') || cat.includes('typescript')) {
      return {
        border: 'border-l-purple-500',
        badge: 'text-purple-800 bg-purple-50/80',
        dot: 'bg-purple-500',
      };
    }
    return {
      border: 'border-l-stone-400',
      badge: 'text-stone-700 bg-stone-100',
      dot: 'bg-stone-400',
    };
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
            My Decks
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Your personal collection of things you're learning.
          </p>
        </div>

        <div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Create Deck</span>
          </button>
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

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-44 bg-stone-200/80 rounded-2xl animate-pulse" />
          <div className="h-44 bg-stone-200/80 rounded-2xl animate-pulse" />
        </div>
      ) : decks.length === 0 ? (
        /* Empty Library State */
        <div className="p-10 rounded-2xl bg-white border border-stone-200/90 shadow-2xs text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h2 className="text-lg font-bold text-stone-900">Your library is empty</h2>
            <p className="text-sm text-stone-600">
              Create your own flashcard deck or explore curated technical topics to get started.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 shadow-2xs"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Create Deck</span>
            </button>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50"
            >
              <span>Explore Decks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* Decks Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {decks.map((deck) => {
            const styles = getCategoryStyles(deck.category);

            return (
              <div
                key={deck._id}
                className={`p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-xs transition-shadow border-l-4 ${styles.border} flex flex-col justify-between`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${styles.badge}`}>
                      {deck.category || 'General'}
                    </span>
                    <span className="font-mono text-stone-500">
                      {deck.cardCount || 0} card{deck.cardCount === 1 ? '' : 's'}
                    </span>
                  </div>

                  <Link
                    to={`/my-decks/${deck._id}`}
                    className="block group"
                  >
                    <h2 className="text-base font-bold text-stone-900 group-hover:text-stone-700 leading-snug">
                      {deck.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                    {deck.description || 'No description added.'}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => openEditModal(deck, e)}
                      className="p-1.5 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
                      title="Edit deck"
                      aria-label="Edit deck details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteDeckId(deck._id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete deck"
                      aria-label="Delete deck"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/my-decks/${deck._id}`}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium transition-colors"
                    >
                      Manage Cards
                    </Link>
                    <Link
                      to={`/study/${deck._id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors shadow-2xs"
                    >
                      <Play className="w-3 h-3 fill-current text-amber-300" />
                      <span>Study</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Deck Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white border border-stone-200 shadow-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-stone-900">
                {modalMode === 'create' ? 'Create a New Deck' : 'Edit Deck'}
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

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Deck Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JavaScript Closures & Scope"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief note on what this deck covers..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10"
                  >
                    <option value="JavaScript">JavaScript</option>
                    <option value="React">React</option>
                    <option value="SQL">SQL</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
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
                  {isSubmitting ? 'Saving...' : modalMode === 'create' ? 'Create Deck' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDeckId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-stone-200 shadow-lg p-6 space-y-4">
            <h2 className="text-base font-bold text-stone-900">Delete this deck?</h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              This will remove the deck and all flashcards inside it. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteDeckId(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg"
              >
                Keep Deck
              </button>
              <button
                onClick={confirmDelete}
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
