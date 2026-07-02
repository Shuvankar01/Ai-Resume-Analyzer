import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import { Loader2, AlertTriangle } from 'lucide-react';

// Lazy load pages for performance
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard'));
const CandidateOverview = lazy(() => import('./pages/CandidateOverview'));
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'));
const Overview = lazy(() => import('./pages/Overview'));
const TalentPool = lazy(() => import('./pages/TalentPool'));
const Preferences = lazy(() => import('./pages/Preferences'));
const Profile = lazy(() => import('./pages/Profile'));
const ResumeCompare = lazy(() => import('./pages/ResumeCompare'));

function GlobalAlert() {
  const { systemAlert } = useApp();
  if (!systemAlert) return null;

  return (
    <div className={`fixed top-0 left-0 w-full z-[100] p-2 text-center text-xs font-bold uppercase tracking-widest animate-in slide-in-from-top duration-300 ${
      systemAlert.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
    }`}>
      <div className="flex items-center justify-center gap-2">
        {systemAlert.type === 'error' && <AlertTriangle size={14} />}
        {systemAlert.message}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="relative">
        <Loader2 className="text-[var(--accent)] animate-spin" size={48} />
        <div className="absolute inset-0 bg-[var(--accent)]/10 blur-xl rounded-full"></div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading, isRecruiter } = useAuth();

  if (loading) return <LoadingFallback />;

  return (
    <div className="min-h-screen text-[var(--text)] bg-[var(--background)]">
      <GlobalAlert />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route 
            path="/" 
            element={!user ? <Landing /> : <Navigate to={isRecruiter ? '/recruiter' : '/candidate'} replace />} 
          />
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to={isRecruiter ? '/recruiter' : '/candidate'} replace />} 
          />
          
          {/* Candidate Routes */}
          <Route 
            path="/candidate" 
            element={
              <ProtectedRoute requiredRole="candidate">
                <CandidateDashboard />
              </ProtectedRoute>
            } 
          >
            <Route index element={<CandidateOverview />} />
            <Route path="preferences" element={<Preferences />} />
            <Route path="profile" element={<Profile />} />
            <Route path="compare" element={<ResumeCompare />} />
          </Route>

          {/* Recruiter Routes */}
          <Route 
            path="/recruiter" 
            element={
              <ProtectedRoute requiredRole="recruiter">
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="talent-pool" element={<TalentPool />} />
            <Route path="preferences" element={<Preferences />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

import ErrorBoundary from './components/ErrorBoundary';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <NotificationProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </NotificationProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
