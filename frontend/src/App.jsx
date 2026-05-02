import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import CandidateDashboard from './components/CandidateDashboard';
import RecruiterDashboard from './components/RecruiterDashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setUser({ token, role });
    }
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen text-white bg-[#0a0a0f]">
        <Routes>
          <Route 
            path="/" 
            element={!user ? <Login setUser={setUser} /> : <Navigate to={user.role === 'recruiter' ? '/recruiter' : '/candidate'} />} 
          />
          <Route 
            path="/candidate" 
            element={user && user.role === 'candidate' ? <CandidateDashboard setUser={setUser} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/recruiter" 
            element={user && user.role === 'recruiter' ? <RecruiterDashboard setUser={setUser} /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
