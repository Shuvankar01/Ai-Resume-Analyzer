// A simple event bus mapped to localStorage to achieve cross-module synchronization
// without requiring backend endpoint changes.

const STORAGE_KEY = 'resume_ai_global_activity';
const STATUS_KEY = 'resume_ai_candidate_status';
const RESUMES_KEY = 'resume_ai_resumes';
const EVENTS = {
  UPDATED: 'resume_ai_activity_updated',
  PREFERENCES_CHANGED: 'resume_ai_preferences_changed',
  STATUS_UPDATED: 'resume_ai_status_updated',
  RESUME_ADDED: 'resume_ai_resume_added'
};

const getActivities = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

const addActivity = (type, title, description, metadata = {}) => {
  const activities = getActivities();
  const newActivity = {
    id: Date.now().toString(),
    type, // 'UPLOAD', 'ANALYSIS', 'SHORTLIST', 'REJECT', 'INTERVIEW', 'OFFER', 'SYSTEM'
    title,
    description,
    metadata,
    timestamp: new Date().toISOString()
  };
  
  const updated = [newActivity, ...activities].slice(0, 100); // keep last 100
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  // Dispatch global event for cross-module sync
  window.dispatchEvent(new CustomEvent(EVENTS.UPDATED, { detail: newActivity }));
  return newActivity;
};

const subscribe = (callback) => {
  const handler = (e) => callback(e.detail, getActivities());
  window.addEventListener(EVENTS.UPDATED, handler);
  return () => window.removeEventListener(EVENTS.UPDATED, handler);
};

const notifyPreferencesChanged = (newPrefs) => {
  window.dispatchEvent(new CustomEvent(EVENTS.PREFERENCES_CHANGED, { detail: newPrefs }));
};

const subscribeToPreferences = (callback) => {
  const handler = (e) => callback(e.detail);
  window.addEventListener(EVENTS.PREFERENCES_CHANGED, handler);
  return () => window.removeEventListener(EVENTS.PREFERENCES_CHANGED, handler);
};

// --- Candidate Status Management ---
const getAllStatuses = () => {
  try {
    return JSON.parse(localStorage.getItem(STATUS_KEY)) || {};
  } catch {
    return {};
  }
};

const getCandidateStatus = (candidateId) => {
  const statuses = getAllStatuses();
  return statuses[candidateId] || 'Applied';
};

const updateCandidateStatus = (candidateId, status) => {
  const statuses = getAllStatuses();
  statuses[candidateId] = status;
  localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));
  window.dispatchEvent(new CustomEvent(EVENTS.STATUS_UPDATED, { detail: { candidateId, status } }));
  return status;
};

const subscribeToStatus = (callback) => {
  const handler = (e) => callback(e.detail);
  window.addEventListener(EVENTS.STATUS_UPDATED, handler);
  return () => window.removeEventListener(EVENTS.STATUS_UPDATED, handler);
};

// --- Server sync -------------------------------------------------------
// Candidate actions are persisted server-side by recruiterService. The rows it
// returns are mirrored into the local status map on load, so a status set on
// another device (or before a reload) is reflected here. This module stays the
// event bus — it is not a second source of truth, just a local mirror.
const hydrateStatusesFromServer = (actions = []) => {
  if (!Array.isArray(actions) || actions.length === 0) return getAllStatuses();

  const statuses = getAllStatuses();
  // `actions` arrives newest-first, so walk it oldest-first and let later
  // writes win — the most recent action is the one that sticks.
  [...actions].reverse().forEach((action) => {
    const key = action.candidate_id ?? action.candidate_name;
    if (key !== undefined && key !== null && action.status) {
      statuses[key] = action.status;
      // Older entries were written against the display name; keep them in
      // agreement so a name-keyed lookup does not report a stale status.
      if (action.candidate_name) statuses[action.candidate_name] = action.status;
    }
  });

  localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));
  window.dispatchEvent(new CustomEvent(EVENTS.STATUS_UPDATED, { detail: { hydrated: true } }));
  return statuses;
};

// --- Resume History Management ---
const getResumeHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(RESUMES_KEY)) || [];
  } catch {
    return [];
  }
};

const addResume = (resumeData) => {
  const resumes = getResumeHistory();
  const newResume = {
    ...resumeData,
    id: resumeData.id || Date.now().toString(),
    timestamp: new Date().toISOString()
  };
  const updated = [newResume, ...resumes].slice(0, 100);
  localStorage.setItem(RESUMES_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(EVENTS.RESUME_ADDED, { detail: newResume }));
  return newResume;
};

const subscribeToResumes = (callback) => {
  const handler = (e) => callback(e.detail, getResumeHistory());
  window.addEventListener(EVENTS.RESUME_ADDED, handler);
  return () => window.removeEventListener(EVENTS.RESUME_ADDED, handler);
};

export const activityService = {
  getActivities,
  addActivity,
  subscribe,
  notifyPreferencesChanged,
  subscribeToPreferences,
  getAllStatuses,
  getCandidateStatus,
  updateCandidateStatus,
  subscribeToStatus,
  hydrateStatusesFromServer,
  getResumeHistory,
  addResume,
  subscribeToResumes
};
