import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DemandsPage from './pages/DemandsPage';
import CreateDemandPage from './pages/CreateDemandPage';
import DemandDetailPage from './pages/DemandDetailPage';
import ProfilePage from './pages/ProfilePage';
import ArtisanSearchPage from './pages/ArtisanSearchPage';
import MessagesPage from './pages/MessagesPage';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <>
      {user && <Navbar />}
      <main className={user ? 'main-content' : ''}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={user ? <DashboardPage /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/demands" element={<ProtectedRoute><DemandsPage /></ProtectedRoute>} />
          <Route path="/demands/create" element={<ProtectedRoute><CreateDemandPage /></ProtectedRoute>} />
          <Route path="/demands/:id" element={<ProtectedRoute><DemandDetailPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/users/:id" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/artisans" element={<ProtectedRoute><ArtisanSearchPage /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
