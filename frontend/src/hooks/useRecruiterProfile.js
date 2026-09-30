import { useCallback, useEffect, useState } from 'react';
import { recruiterService } from '../services/recruiterService';

// Pure request helper kept outside the hook so the mount effect only awaits it
// (setting state in an async continuation) instead of calling a function the
// linter has to trace into.
const requestProfile = () => recruiterService.getProfile();

/**
 * Loads the recruiter's hiring profile and tracks onboarding state.
 *
 * A brand new recruiter gets an empty row back from `GET /recruiter/profile`
 * with `onboarding_completed: false`, which is the only signal that decides
 * whether the onboarding wizard is shown. Shared by the dashboard (as a modal)
 * and the profile page (embedded), so the flag can never disagree between them.
 */
export default function useRecruiterProfile() {
  const [profile, setProfile] = useState(null);
  // `loaded` tracks whether the initial fetch has resolved, so the effect body
  // never has to flip a loading flag synchronously.
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const applyData = useCallback((data) => {
    setProfile(data);
    setNeedsOnboarding(!data?.onboarding_completed);
    setLoaded(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    requestProfile()
      .then((data) => {
        if (!cancelled) applyData(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.detail || 'Could not load your recruiter profile');
          setLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [applyData]);

  // Manual refresh re-arms the loading flag from an event handler, not an effect.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await requestProfile();
      applyData(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not load your recruiter profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, [applyData]);

  const applyProfile = useCallback((saved) => {
    setProfile(saved);
    setNeedsOnboarding(!saved?.onboarding_completed);
    setDismissed(false);
  }, []);

  return {
    profile,
    // True until the first fetch resolves, so callers can hold back the
    // onboarding modal instead of flashing it for an already-onboarded account.
    loading: !loaded || loading,
    error,
    needsOnboarding,
    // "Skip for now" hides the modal for this session but leaves the server
    // flag alone, so the profile page still prompts for the details.
    dismissOnboarding: () => setDismissed(true),
    // Re-open the wizard on demand (profile is complete, or the user skipped).
    openOnboarding: () => {
      setDismissed(false);
      setNeedsOnboarding(true);
    },
    showOnboarding: needsOnboarding && !dismissed,
    setProfile: applyProfile,
    reload: load,
  };
}
