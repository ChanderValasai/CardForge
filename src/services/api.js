/**
 * CardForge API Service
 * Centralized client for REST API communication.
 */

const API_BASE = '/api';
const TOKEN_KEY = 'cardforge_auth_token';

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Generic helper for authenticated requests
export const authFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

// Health checks
export const checkServerHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    return {
      status: 'error',
      message: error.message || 'Cannot connect to backend server',
      database: { state: 'disconnected', error: error.message },
    };
  }
};

export const retryDBConnection = async () => {
  try {
    const res = await fetch(`${API_BASE}/health/retry`, { method: 'POST' });
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      database: { state: 'error', error: error.message },
    };
  }
};

// Authentication Endpoints
export const registerUser = async ({ name, email, password, confirmPassword }) => {
  const data = await authFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });
  if (data.token) {
    setToken(data.token);
  }
  return data;
};

export const loginUser = async ({ email, password }) => {
  const data = await authFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (data.token) {
    setToken(data.token);
  }
  return data;
};

export const getCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;
  return await authFetch('/auth/me');
};

export const updateUserProfile = async ({ name }) => {
  return await authFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
};

export const logoutUser = () => {
  removeToken();
};

// Decks API Endpoints
export const fetchDecks = async ({ filter, category, search } = {}) => {
  const params = new URLSearchParams();
  if (filter) params.append('filter', filter);
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return await authFetch(`/decks${queryString}`);
};

export const fetchDeckById = async (deckId) => {
  return await authFetch(`/decks/${deckId}`);
};

export const createDeck = async (deckData) => {
  return await authFetch('/decks', {
    method: 'POST',
    body: JSON.stringify(deckData),
  });
};

export const updateDeck = async (deckId, deckData) => {
  return await authFetch(`/decks/${deckId}`, {
    method: 'PUT',
    body: JSON.stringify(deckData),
  });
};

export const deleteDeck = async (deckId) => {
  return await authFetch(`/decks/${deckId}`, {
    method: 'DELETE',
  });
};

export const triggerSeedDecks = async () => {
  return await authFetch('/decks/seed', {
    method: 'POST',
  });
};

// Flashcards API Endpoints
export const fetchCardsByDeck = async (deckId) => {
  return await authFetch(`/decks/${deckId}/cards`);
};

export const createCard = async (deckId, cardData) => {
  return await authFetch(`/decks/${deckId}/cards`, {
    method: 'POST',
    body: JSON.stringify(cardData),
  });
};

export const updateCard = async (cardId, cardData) => {
  return await authFetch(`/cards/${cardId}`, {
    method: 'PUT',
    body: JSON.stringify(cardData),
  });
};

export const deleteCard = async (cardId) => {
  return await authFetch(`/cards/${cardId}`, {
    method: 'DELETE',
  });
};

// Study Session & Spaced Repetition Endpoints
export const recordStudySession = async (sessionData) => {
  return await authFetch('/study/session', {
    method: 'POST',
    body: JSON.stringify(sessionData),
  });
};

export const fetchStudyStats = async () => {
  return await authFetch('/study/stats');
};

export const fetchReviewQueue = async () => {
  return await authFetch('/study/review-queue');
};
