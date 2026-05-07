import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Loader2, AlertTriangle } from 'lucide-react';

// Lazy load pages for performance
const Login = lazy(() => import('./pages/Login'));
const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard'));
const CandidateOverview = lazy(() => import('./pages/CandidateOverview'));
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'));
const Overview = lazy(() => import('./pages/Overview'));
const TalentPool = lazy(() => import('./pages/TalentPool'));
const Preferences = lazy(() => import('./pages/Preferences'));
const Profile = lazy(() => import('./pages/Profile'));

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
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <Loader2 className="text-[#00f3ff] animate-spin" size={48} />
    </div>
  );
}

function AppRoutes() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setUser({ token, role });
    }
  }, []);

  return (
    <div className="min-h-screen text-white bg-[#0a0a0f]">
      <GlobalAlert />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route 
            path="/" 
            element={!user ? <Login setUser={setUser} /> : <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/candidate'} />} 
          />
          <Route 
            path="/candidate" 
            element={user && user.role === 'candidate' ? <CandidateDashboard setUser={setUser} /> : <Navigate to="/" />} 
          >
            <Route index element={<CandidateOverview />} />
            <Route path="preferences" element={<Preferences />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          <Route 
            path="/recruiter" 
            element={user && user.role === 'recruiter' ? <RecruiterDashboard setUser={setUser} /> : <Navigate to="/" />}
          >
            <Route index element={<Overview />} />
            <Route path="talent-pool" element={<TalentPool />} />
            <Route path="preferences" element={<Preferences />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
