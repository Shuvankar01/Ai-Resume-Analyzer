import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import api from '../services/api';
import logger from '../utils/logger';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      setUser(response.data);
      setError(null);
    } catch (err) {
      logger.error('Failed to fetch user profile', err);
      // Clear user state if check fails (e.g. unauthenticated or expired cookie)
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await authService.login(email, password);
      
      // Keep Authorization bearer headers as fallback
      if (data && data.access_token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;
        localStorage.setItem('token', data.access_token);
      }
      
      await fetchProfile();
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      logger.error('Backend logout failed', err);
    }
    
    // Clear tokens and API headers
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    delete api.defaults.headers.common['Authorization'];
    
    setUser(null);
    window.location.href = '/';
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    authenticated: !!user,
    isAuthenticated: !!user,
    isRecruiter: user?.is_recruiter || false,
    refreshUser: fetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
