import { useCallback, useEffect, useMemo, useState } from 'react';
import { activityService } from '../services/activityService';
import { recruiterService, candidateKey } from '../services/recruiterService';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';

// The four recruiter decisions, defined once so every section (spotlight card,
// talent pool cards, drawer, benchmarking table) renders identical controls.
export const CANDIDATE_ACTIONS = [
  {
    label: 'Shortlist',
    action: 'SHORTLIST',
    status: 'Shortlisted',
    eventType: 'SHORTLIST',
    title: 'Candidate Shortlisted',
    toastType: 'success',
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
  },
  {
    label: 'Reject',
    action: 'REJECT',
    status: 'Rejected',
    eventType: 'REJECT',
    title: 'Candidate Rejected',
    toastType: 'error',
    color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20',
  },
  {
    label: 'Schedule',
    action: 'INTERVIEW',
    status: 'Interview',
    eventType: 'INTERVIEW',
    title: 'Interview Scheduled',
    toastType: 'info',
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
    // Requires a date before the action can be recorded.
    requiresSchedule: true,
  },
  {
    label: 'Send Offer',
    action: 'OFFER',
    status: 'Offer',
    eventType: 'OFFER',
    title: 'Offer Extended',
    toastType: 'success',
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
  },
];

export const STATUS_VARIANTS = {
  Applied: 'default',
  Shortlisted: 'success',
  Interview: 'info',
  Offer: 'warning',
  Hired: 'success',
  Rejected: 'danger',
};

/**
 * Owns the recruiter decision flow for one candidate.
 *
 * Every action does the same three things, in this order:
 *   1. persist to the backend (`POST /recruiter/actions`)
 *   2. mirror into the local activity/status bus so existing consumers update
 *   3. raise a toast
 *
 * The local mirror is written optimistically and kept even if the network
 * call fails, so the UI never loses a recruiter's decision — it just reports
 * that the server copy did not save.
 */
export default function useCandidateActions(candidate) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [status, setStatus] = useState(() => activityService.getCandidateStatus(candidateKey(candidate)));
  const [pending, setPending] = useState(false);

  const key = candidateKey(candidate);

  // Re-read the status when the component is pointed at a different candidate.
  // Done during render (React's documented "adjust state when a prop changes"
  // pattern) rather than in an effect, which would cascade an extra render.
  const [trackedKey, setTrackedKey] = useState(key);
  if (trackedKey !== key) {
    setTrackedKey(key);
    setStatus(activityService.getCandidateStatus(key));
  }

  useEffect(() => {
    // Re-read when any status write happens anywhere in the app.
    return activityService.subscribeToStatus((detail) => {
      if (!detail || detail.hydrated) {
        setStatus(activityService.getCandidateStatus(key));
        return;
      }
      if (detail.candidateId === key) setStatus(detail.status);
    });
  }, [key]);

  const runAction = useCallback(
    async (actionKey, { scheduledFor = null, notes = null } = {}) => {
      const config = CANDIDATE_ACTIONS.find((a) => a.action === actionKey);
      if (!config || pending) return false;

      setPending(true);
      const displayName = candidate.name || candidate.email || 'Candidate';

      // 1. Persist to the backend.
      let persisted = false;
      try {
        await recruiterService.recordAction({
          candidate_id: candidate.id ?? null,
          candidate_name: displayName,
          action: config.action,
          ats_score: candidate.score ?? null,
          notes,
          scheduled_for: scheduledFor,
        });
        persisted = true;
      } catch {
        // Network/auth failure: keep going so the recruiter's decision is not
        // lost, but be explicit that it did not reach the server.
      }

      // 2. Mirror locally for the activity feed + status badges.
      activityService.addActivity(
        config.eventType,
        config.title,
        `${displayName} → ${config.status}${scheduledFor ? ` on ${new Date(scheduledFor).toLocaleString()}` : ''}.`,
        {
          candidateName: displayName,
          candidateId: candidate.id ?? null,
          atsScore: candidate.score ?? null,
          recruiterName: user?.full_name || 'You',
          statusBadge: config.status,
        }
      );
      activityService.updateCandidateStatus(key, config.status);
      setStatus(config.status);

      // 3. Toast.
      const message = persisted
        ? `${displayName} — ${config.status.toLowerCase()}`
        : `${displayName} — ${config.status.toLowerCase()} (saved locally only, server unavailable)`;
      addNotification(message, persisted ? config.toastType : 'warning', { category: 'system' });

      setPending(false);
      return persisted;
    },
    [addNotification, candidate.email, candidate.id, candidate.name, candidate.score, key, pending, user]
  );

  return useMemo(
    () => ({ status, pending, runAction, actions: CANDIDATE_ACTIONS }),
    [status, pending, runAction]
  );
}
