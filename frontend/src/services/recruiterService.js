import api from './api';

/**
 * HTTP client for the recruiter domain (`/recruiter/*`).
 *
 * This is deliberately separate from `activityService.js`, which stays the
 * localStorage event bus for the activity feed, candidate status mirror and
 * resume history. This module only talks to the backend; `activityService`
 * mirrors what it returns so existing consumers keep working.
 */
export const recruiterService = {
  // ── Onboarding / profile ──────────────────────────────────────
  getProfile: async () => {
    const response = await api.get('/recruiter/profile');
    return response.data;
  },

  // Option A — manual form
  saveProfile: async (payload) => {
    const response = await api.put('/recruiter/profile', payload);
    return response.data;
  },

  // Option B — AI-parsed bio/resume upload
  parseBio: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/recruiter/profile/parse-bio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    });
    return response.data;
  },

  // ── Candidate actions ─────────────────────────────────────────
  recordAction: async (payload) => {
    const response = await api.post('/recruiter/actions', payload);
    return response.data;
  },

  listActions: async () => {
    const response = await api.get('/recruiter/actions');
    return response.data;
  },

  // ── Dashboard metrics ─────────────────────────────────────────
  getMetrics: async () => {
    const response = await api.get('/recruiter/metrics');
    return response.data;
  },

  // ── Candidate intelligence ────────────────────────────────────
  getCandidateIntelligence: async (candidateId) => {
    const response = await api.get(`/recruiter/candidates/${candidateId}/intelligence`);
    return response.data;
  },
};

/**
 * Stable key for a candidate across the local mirror and the server.
 *
 * The dashboard ranking now carries a real user `id`; older payloads (and the
 * localStorage mirror written before ids existed) key off the display name, so
 * fall back to it to keep existing status entries resolvable.
 */
export const candidateKey = (candidate) =>
  candidate?.id ?? candidate?.name ?? candidate?.email ?? 'unknown';
