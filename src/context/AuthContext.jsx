import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  getToken,
} from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check token on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        if (response && response.user) {
          setUser(response.user);
        } else {
          logoutUser();
        }
      } catch (err) {
        console.warn('[Auth] Session check failed, clearing token');
        logoutUser();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await loginUser({ email, password });
      setUser(response.user);
      return { success: true, user: response.user };
    } catch (err) {
      const message = err.message || 'Login failed';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const response = await registerUser(userData);
      setUser(response.user);
      return { success: true, user: response.user };
    } catch (err) {
      const message = err.message || 'Registration failed';
      setAuthError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setAuthError(null);
  };

  const updateProfile = async (name) => {
    try {
      const response = await updateUserProfile({ name });
      setUser(response.user);
      return { success: true, user: response.user };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
