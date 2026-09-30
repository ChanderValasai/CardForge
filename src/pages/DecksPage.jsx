import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Layers,
  Edit2,
  Trash2,
  Play,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FolderPlus,
  Lock,
  Globe,
} from 'lucide-react';
import { fetchDecks, createDeck, updateDeck, deleteDeck } from '../services/api.js';

export default function DecksPage() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [activeDeckId, setActiveDeckId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    difficulty: 'Beginner',
    isPublic: true,
  });

  // Delete Confirmation State
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
      category: 'General',
      difficulty: 'Beginner',
      isPublic: true,
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (deck) => {
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

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setModalError('Deck title is required.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      if (modalMode === 'create') {
        const res = await createDeck(formData);
        setDecks([res.deck, ...decks]);
        setSuccessMessage('Deck created successfully.');
      } else {
        const res = await updateDeck(activeDeckId, formData);
        setDecks(decks.map((d) => (d._id === activeDeckId ? res.deck : d)));
        setSuccessMessage('Deck updated successfully.');
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      setModalError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDeckId) return;
    setIsDeleting(true);
    try {
      await deleteDeck(deleteDeckId);
      setDecks(decks.filter((d) => d._id !== deleteDeckId));
      setDeleteDeckId(null);
      setSuccessMessage('Deck deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to delete deck.');
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = [
    'General',
    'JavaScript',
    'React',
    'Backend',
    'Databases',
    'Web Development',
    'System Design',
    'Algorithms',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Flashcard Decks</h1>
          <p className="text-sm text-slate-600 mt-1">
            Create, customize, and manage your private study material.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Deck</span>
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-md flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mb-3 text-slate-900" />
          <span className="text-xs font-medium">Loading your decks...</span>
        </div>
      ) : decks.length === 0 ? (
        <div className="my-10 bg-white border border-slate-200 rounded-lg p-10 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-4">
            <FolderPlus className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            You don't have any custom decks yet
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Create a personalized deck to organize cards for your target concepts, or study our curated interview decks.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Deck
            </button>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-50 transition-colors"
            >
              Browse Seed Decks
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-8">
          {decks.map((deck) => (
            <div
              key={deck._id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {deck.category}
                  </span>
                  <div className="flex items-center gap-2">
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
                    {deck.isPublic ? (
                      <Globe className="w-3.5 h-3.5 text-slate-400" title="Public deck" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400" title="Private deck" />
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1.5 line-clamp-1">
                  {deck.title}
                </h3>
                <p className="text-xs text-slate-600 mb-4 line-clamp-2 min-h-[32px]">
                  {deck.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1.5 font-mono">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{deck.cardCount || 0} cards</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(deck)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                      title="Edit deck"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteDeckId(deck._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                      title="Delete deck"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to={`/my-decks/${deck._id}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Cards</span>
                  </Link>
                  <Link
                    to={`/study/${deck._id}`}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-md bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Study</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {modalMode === 'create' ? 'Create New Flashcard Deck' : 'Edit Flashcard Deck'}
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              Configure your deck title, subject category, and difficulty level.
            </p>

            {modalError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
                {modalError}
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deck-title">
                  Deck Title *
                </label>
                <input
                  id="deck-title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., System Design Fundamentals"
                  className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deck-description">
                  Description
                </label>
                <textarea
                  id="deck-description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief overview of what this deck covers..."
                  className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deck-category">
                    Category
                  </label>
                  <select
                    id="deck-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="deck-difficulty">
                    Difficulty
                  </label>
                  <select
                    id="deck-difficulty"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 focus:outline-hidden focus:border-slate-900 bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="deck-public"
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <label htmlFor="deck-public" className="text-xs text-slate-700 select-none">
                  Make this deck public in Explore directory
                </label>
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
                  <span>{modalMode === 'create' ? 'Create Deck' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDeckId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">Delete this deck?</h3>
            <p className="text-xs text-slate-600 mb-6">
              This action cannot be undone. All flashcards and study history associated with this deck will also be removed.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteDeckId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-md hover:bg-rose-700 transition-colors disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Deck</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
