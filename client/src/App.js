import React, { useEffect, useRef } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { Toaster } from 'sonner';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';

import './index.css';


// 🔐 Google Auth Callback
const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = location.hash;
    const sessionIdMatch = hash.match(/session_id=([^&]+)/);

    if (sessionIdMatch) {
      const sessionId = sessionIdMatch[1];

      loginWithGoogle(sessionId)
        .then(() => navigate('/chat', { replace: true }))
        .catch(() => navigate('/login', { replace: true }));
    } else {
      navigate('/login', { replace: true });
    }
  }, [location, loginWithGoogle, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b141a]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#202c33] border-t-[#00a884] rounded-full animate-spin"></div>
        <span className="text-[#8696a0] text-sm">Authenticating...</span>
      </div>
    </div>
  );
};


// 🔒 Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b141a]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#202c33] border-t-[#00a884] rounded-full animate-spin"></div>
          <span className="text-[#8696a0] text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};


// 🌐 App Router
const AppRouter = () => {
  const location = useLocation();

  // Handle Google OAuth callback
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatProvider>
              <ChatPage />
            </ChatProvider>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/chat" replace />} />
      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
};


// 🚀 Main App
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <AppRouter />

        <Toaster
          position="top-right"
          toastOptions={{
            className: 'bg-[#202c33] text-white border-none'
          }}
        />

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

