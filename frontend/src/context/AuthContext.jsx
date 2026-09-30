/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { authService } from '../services/authService';
import api from '../services/api';
import logger from '../utils/logger';
import { usePreferences } from './PreferencesContext';
import { useNotifications } from './NotificationContext';

const IDLE_ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
const IDLE_CHECK_INTERVAL_MS = 5000;
const IDLE_WARNING_MS = 60000;

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { preferences } = usePreferences();
  const { addNotification, dismissToast } = useNotifications();

  // Keeps the idle timer effect stable: `logout` and `addNotification` are
  // recreated on every render, and re-running the effect would reset the
  // countdown each time. Synced after `logout` is declared, further down.
  const logoutRef = useRef(null);
  const notifyRef = useRef(null);
  const dismissRef = useRef(null);

  const fetchProfile = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await api.get('/auth/me');
      setUser(response.data);
      setError(null);
    } catch (err) {
      // A canceled request is not an authentication failure. Concurrent profile checks
      // (React StrictMode double-invokes this effect on mount) can be deduplicated by
      // the API layer, and that cancellation must not sign an already-authenticated
      // user out.
      if (axios.isCancel(err)) {
        logger.info('Profile request canceled, keeping existing session');
        return;
      }
      logger.error('Failed to fetch user profile', err);
      // Clear user state if check fails (e.g. unauthenticated or expired cookie)
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile(false); // Intentional: Fetch auth state on mount
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

  useEffect(() => { logoutRef.current = logout; });
  useEffect(() => { notifyRef.current = addNotification; dismissRef.current = dismissToast; });

  // Idle auto sign-out, driven by the Security preferences.
  const idleTimeout = preferences.pref_idle_timeout;
  const warnBeforeExpiry = preferences.pref_session_warning;

  useEffect(() => {
    if (!user || idleTimeout === 'off') return;

    const limitMs = Number(idleTimeout) * 60 * 1000;
    let lastActivity = Date.now();
    let warned = false;
    let warningId = null;

    const clearWarning = () => {
      if (warningId) {
        dismissRef.current?.(warningId);
        warningId = null;
      }
      warned = false;
    };

    const handleActivity = () => {
      lastActivity = Date.now();
      clearWarning();
    };

    IDLE_ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    const interval = setInterval(() => {
      const idleFor = Date.now() - lastActivity;

      if (idleFor >= limitMs) {
        logger.info(`Idle for ${Math.round(idleFor / 1000)}s, signing out`);
        clearInterval(interval);
        clearWarning();
        notifyRef.current?.('Session ended after inactivity.', 'info', { category: 'session' });
        logoutRef.current?.();
        return;
      }

      if (warnBeforeExpiry && !warned && idleFor >= limitMs - IDLE_WARNING_MS) {
        warned = true;
        warningId = notifyRef.current?.(
          'Your session expires in 60 seconds. Interact with the page to stay signed in.',
          'warning',
          { category: 'session' }
        );
      }
    }, IDLE_CHECK_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearWarning();
      IDLE_ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, [user, idleTimeout, warnBeforeExpiry]);

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
