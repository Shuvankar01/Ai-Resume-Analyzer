import { useEffect, useMemo, useState } from 'react';
import { Activity, Loader2, RefreshCw, UserCheck, UserX, CalendarCheck, Briefcase, FileSearch } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';
import Badge from '../ui/Badge';
import { STATUS_VARIANTS } from '../../hooks/useCandidateActions';
import { resumeService } from '../../services/resumeService';

const KIND_ICON = {
  SHORTLIST: UserCheck,
  REJECT: UserX,
  INTERVIEW: CalendarCheck,
  OFFER: Briefcase,
  ANALYSIS: FileSearch,
};

const DOT = {
  SHORTLIST: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]',
  REJECT: 'bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]',
  INTERVIEW: 'bg-purple-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]',
  OFFER: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]',
  ANALYSIS: 'bg-(--primary) shadow-[0_0_8px_rgba(0,243,255,0.8)]',
};

const relative = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

/**
 * Recent Sourcing Activity Feed.
 *
 * Replaces the raw audit log with a narrative timeline. The backend already
 * translates the internal event vocabulary into human headlines
 * (`GET /analytics/activities` → `{ headline, detail }`), so this renders that
 * copy directly instead of mapping enums in the view.
 */
export default function SourcingActivityFeed({ refreshToken }) {
  // Results are stored against the token they were fetched for, so "loading" and
  // "error" are derived from a mismatch rather than set inside the effect.
  const [state, setState] = useState({ token: null, events: [], error: null });

  useEffect(() => {
    let cancelled = false;
    resumeService
      .getRecruiterActivities()
      .then((rows) => {
        if (!cancelled) setState({ token: refreshToken, events: Array.isArray(rows) ? rows : [], error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            token: refreshToken,
            events: [],
            error: err.response?.data?.detail || 'Could not load sourcing activity.',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  const items = useMemo(
    () => (state.token === refreshToken ? state.events.slice(0, 12) : []),
    [state, refreshToken]
  );

  const error = state.token === refreshToken ? state.error : null;

  return (
    <GlassCard className="p-8 flex flex-col">
      <div className="flex justify-between items-center mb-6 gap-3">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <Activity size={22} className="text-(--primary)" /> Recent Sourcing Activity
        </h3>
        {state.token !== refreshToken && <Loader2 size={15} className="animate-spin text-(--text-muted)" />}
      </div>

      {error ? (
        <EmptyState
          icon={RefreshCw}
          title="Activity unavailable"
          description={error}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Shortlisting, scheduling, rejecting or offering a candidate writes a row here."
        />
      ) : (
        <div className="relative border-l border-white/10 ml-2 pl-5 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
          {items.map((event) => {
            const kind = event.action || 'ANALYSIS';
            const Icon = KIND_ICON[kind] || Activity;
            return (
              <div key={event.id} className="relative">
                <span
                  className={`absolute -left-5.5 top-1.5 w-2 h-2 rounded-full border-2 border-(--background) ${
                    DOT[kind] || DOT.ANALYSIS
                  }`}
                />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Icon size={12} className="text-(--text-muted) shrink-0" />
                      {event.headline}
                    </p>
                    {event.candidate_name && (
                      <p className="text-xs text-gray-300 truncate">{event.candidate_name}</p>
                    )}
                    {event.detail && (
                      <p className="text-[11px] text-(--text-muted) leading-relaxed">{event.detail}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-(--text-muted) whitespace-nowrap">
                      {relative(event.created_at)}
                    </span>
                    {event.status && (
                      <Badge variant={STATUS_VARIANTS[event.status] || 'default'}>{event.status}</Badge>
                    )}
                    {event.ats_score != null && (
                      <span className="text-[10px] font-black text-emerald-400">ATS {Math.round(event.ats_score)}%</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
