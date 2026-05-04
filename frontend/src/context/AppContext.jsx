import React, { createContext, useContext, useState, useEffect } from 'react';
import logger from '../utils/logger';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [systemAlert, setSystemAlert] = useState(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSystemAlert({ message: 'Back online', type: 'success' });
      setTimeout(() => setSystemAlert(null), 3000);
      logger.info('App went online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSystemAlert({ message: 'You are currently offline. Some features may be unavailable.', type: 'error' });
      logger.warn('App went offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
