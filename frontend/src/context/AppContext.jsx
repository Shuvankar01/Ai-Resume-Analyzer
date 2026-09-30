/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import logger from '../utils/logger';
import { usePreferences } from './PreferencesContext';

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function AppProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [systemAlert, setSystemAlert] = useState(null);
  const { preferences } = usePreferences();
  const showConnectionAlerts = preferences.pref_connection_alerts;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Connectivity state is always tracked, but the banner respects the
      // user's "Connection Alerts" preference.
      if (showConnectionAlerts) {
        setSystemAlert({ message: 'Back online', type: 'success' });
        setTimeout(() => setSystemAlert(null), 3000);
      }
      logger.info('App went online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (showConnectionAlerts) {
        setSystemAlert({ message: 'You are currently offline. Some features may be unavailable.', type: 'error' });
      }
      logger.warn('App went offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showConnectionAlerts]);

  return (
    <AppContext.Provider value={{ 
      isOnline, 
      globalLoading, 
      setGlobalLoading, 
      systemAlert, 
      setSystemAlert 
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
