import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, isAuthenticated, role } = useAuth();

  // Show premium spinner while restoring user session
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="relative font-bold text-center">
          <Loader2 className="text-[#00f3ff] animate-spin mx-auto" size={48} />
          <div className="absolute inset-0 bg-[#00f3ff]/10 blur-xl rounded-full"></div>
          <p className="mt-4 text-xs uppercase tracking-widest text-gray-500 animate-pulse">Synchronizing Identity...</p>
        </div>
      </div>
    );
  }

  // Redirect unauthenticated user to root Login page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Enforce role-based access control bounds
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'recruiter' ? '/recruiter' : '/candidate'} replace />;
  }

  return children;
}
