/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { usePreferences } from './PreferencesContext';

// eslint-disable-next-line react-refresh/only-export-components
export const NotificationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const { preferences } = usePreferences();

  const addNotification = useCallback((message, type = 'info', options = {}) => {
    const { category = 'system' } = options;

    // Feature components call this unconditionally; the user's preferences
    // decide whether anything is actually raised.
    if (!preferences.pref_notifications) return null;
    if (category === 'analysis' && !preferences.pref_analysis_alerts) return null;

    const id = Math.random().toString(36).substring(2, 9);
    const newNotif = {
      id,
      message,
      type,
      category,
      isRead: false,
      timestamp: new Date()
    };

    // Add to persistent notification history
    setNotifications((prev) => [newNotif, ...prev]);

    // Add to temporary toast list
    setToasts((prev) => [...prev, newNotif]);

    // Auto dismiss toast after 4000ms
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);

    return id;
  }, [preferences]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const icons = {
    success: <CheckCircle className="text-emerald-400" size={18} />,
    error: <AlertCircle className="text-rose-400" size={18} />,
    warning: <AlertTriangle className="text-amber-400" size={18} />,
    info: <Info className="text-(--accent)" size={18} />
  };

  const backgrounds = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
    error: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    info: 'bg-(--accent)/10 border-(--accent)/20 text-(--accent)'
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        dismissToast,
        markAsRead,
        markAllAsRead,
        clearAll
      }}
    >
      {children}

      {/* Global Toast Portal */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className={`flex items-start gap-3 p-4 rounded-2xl border card-glass pointer-events-auto shadow-2xl ${backgrounds[toast.type]}`}
            >
              <div className="pt-0.5">{icons[toast.type]}</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white tracking-tight">{toast.message}</p>
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-(--text-muted) hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
