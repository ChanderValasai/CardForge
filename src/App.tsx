import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DecksPage from './pages/DecksPage.jsx';
import DeckDetailPage from './pages/DeckDetailPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import StudyPage from './pages/StudyPage.jsx';
import ReviewPage from './pages/ReviewPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<LandingPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="my-decks" element={<DecksPage />} />
              <Route path="my-decks/:deckId" element={<DeckDetailPage />} />
              <Route path="study/:deckId" element={<StudyPage />} />
              <Route path="review" element={<ReviewPage />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
