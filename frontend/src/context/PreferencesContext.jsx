/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { activityService } from '../services/activityService';
import logger from '../utils/logger';

export const PREFERENCES_STORAGE_KEY = 'resume_ai_preferences';

// Single source of truth for every user preference. Feature code reads these
// flags before doing work, and PreferencesContext mirrors the presentation
// flags onto <html> so the whole app reacts to them.
export const PREFERENCE_DEFAULTS = Object.freeze({
  // Notifications
  pref_notifications: true,
  pref_analysis_alerts: true,
  pref_connection_alerts: true,

  // Security
  pref_idle_timeout: '30',
  pref_session_warning: true,

  // Appearance
  pref_compact_mode: false,
  pref_reduced_motion: false,
  pref_high_contrast: false,

  // AI Preferences
  pref_auto_analyze: false,
  pref_ai_recommendations: true,
  pref_detailed_summary: true,

  // System
  pref_performance_mode: false,
  pref_offline_cache: true,
});

// Prefixes that used to live on the old preferences page. They were saved to
// localStorage but never drove any behaviour, so they are removed instead of
// being carried forward as dead state.
const LEGACY_KEYS = [
  'pref_email_notif', 'pref_resume_complete', 'pref_weekly_report',
  'pref_interview_reminder', 'pref_system_updates', 'pref_2fa',
  'pref_session_timeout', 'pref_login_history', 'pref_active_devices',
  'pref_dark_mode', 'pref_system_theme', 'pref_density', 'pref_deep_parse',
  'pref_auto_ats', 'pref_ai_recs', 'pref_smart_scan', 'sys_perf',
  'sys_cache', 'sys_ws', 'sys_gpu', 'sys_analytics',
];

// Presentation preferences that toggle a class on <html>.
const ROOT_CLASS_FLAGS = {
  pref_compact_mode: 'compact-layout',
  pref_reduced_motion: 'reduce-motion',
  pref_high_contrast: 'high-contrast',
  pref_performance_mode: 'perf-mode',
};

const readStoredPreferences = () => {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (err) {
    logger.warn('Could not read saved preferences, falling back to defaults', err);
    return {};
  }
};

const persistPreferences = (preferences) => {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch (err) {
    logger.warn('Could not persist preferences', err);
  }
};

const purgeLegacyKeys = () => {
  LEGACY_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage can be unavailable (private mode / disabled cookies).
      // Preferences still work for the current session via React state.
    }
  });
};

export const PreferencesContext = createContext();

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    purgeLegacyKeys();
    // Only keep keys we actually know about so removed preferences can't
    // linger in the saved blob.
    const stored = readStoredPreferences();
    return Object.fromEntries(
      Object.keys(PREFERENCE_DEFAULTS).map((key) => [
        key,
        Object.prototype.hasOwnProperty.call(stored, key) ? stored[key] : PREFERENCE_DEFAULTS[key],
      ])
    );
  });

  useEffect(() => {
    persistPreferences(preferences);
  }, [preferences]);

  // Mirror presentation flags onto <html>. Runs on mount too, so a reload
  // restores the exact look the user left behind before the first paint.
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(ROOT_CLASS_FLAGS).forEach(([key, className]) => {
      root.classList.toggle(className, Boolean(preferences[key]));
    });
  }, [preferences]);

  const setPreference = useCallback((key, value) => {
    if (!Object.prototype.hasOwnProperty.call(PREFERENCE_DEFAULTS, key)) {
      logger.warn(`Ignoring unknown preference "${key}"`);
      return;
    }
    setPreferences((prev) => (prev[key] === value ? prev : { ...prev, [key]: value }));
    activityService.notifyPreferencesChanged({ key, value });
    logger.info(`Preference updated: ${key} = ${value}`);
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences({ ...PREFERENCE_DEFAULTS });
    activityService.notifyPreferencesChanged({ key: '*', value: 'reset' });
    logger.info('Preferences reset to defaults');
  }, []);

  const value = useMemo(
    () => ({ preferences, setPreference, resetPreferences }),
    [preferences, setPreference, resetPreferences]
  );

  return (
    <PreferencesContext.Provider value={value}>
      <MotionConfig reducedMotion={preferences.pref_reduced_motion ? 'always' : 'never'}>
        {children}
      </MotionConfig>
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
