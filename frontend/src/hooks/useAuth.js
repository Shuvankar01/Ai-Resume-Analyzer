import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, loading, error, login, logout, refreshUser } = context;

  return {
    user,
    loading,
    error,
    role: user ? (user.is_recruiter ? 'recruiter' : 'candidate') : null,
    isAuthenticated: !!user,
    isCandidate: user ? !user.is_recruiter : false,
    isRecruiter: user ? user.is_recruiter : false,
    login,
    logout,
    refreshUser
  };
}
