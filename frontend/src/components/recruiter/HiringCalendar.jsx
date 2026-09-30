import { useEffect, useMemo, useState } from 'react';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';
import Badge from '../ui/Badge';
import { STATUS_VARIANTS } from '../../hooks/useCandidateActions';
import { recruiterService } from '../../services/recruiterService';

const BORDER = {
  Interview: 'border-purple-500/50',
  Offer: 'border-amber-500/50',
  Shortlisted: 'border-emerald-500/50',
  Hired: 'border-emerald-500/50',
  Rejected: 'border-rose-500/50',
};

/**
 * Hiring calendar.
 *
 * Reads the recruiter's persisted actions from `GET /recruiter/actions` and
 * lists the ones that carry a real `scheduled_for` timestamp — the date comes
 * from the scheduling picker in `CandidateActions`, never from the client.
 * Refetches whenever the recruiter records a new decision.
 */
export default function HiringCalendar({ refreshToken }) {
  // Results are stored against the token they were fetched for, so "loading" is
  // derived from a mismatch rather than set inside the effect.
  const [result, setResult] = useState({ token: null, rows: [] });

  useEffect(() => {
    let cancelled = false;
    recruiterService
      .listActions()
      .then((rows) => {
        if (!cancelled) setResult({ token: refreshToken, rows: Array.isArray(rows) ? rows : [] });
      })
      .catch(() => {
        if (!cancelled) setResult({ token: refreshToken, rows: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  // A candidate can appear more than once; only their most recent booking counts.
  const appointments = useMemo(() => {
    if (result.token !== refreshToken) return [];
    const seen = new Set();
    return result.rows
      .filter((a) => a.scheduled_for)
      .filter((a) => {
        const key = a.candidate_id ?? a.candidate_name;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for));
  }, [result, refreshToken]);

  return (
    <GlassCard className="p-8 flex flex-col">
      <div className="flex justify-between items-center mb-6 gap-3">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <Calendar size={22} className="text-purple-400" /> Hiring Calendar
        </h3>
        {result.token !== refreshToken && <Loader2 size={15} className="animate-spin text-(--text-muted)" />}
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nothing scheduled"
          description="Use Schedule on any candidate card to book an interview and it will show up here."
        />
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar pr-1">
          {appointments.map((appt) => {
            const when = new Date(appt.scheduled_for);
            return (
              <div
                key={appt.id}
                className={`p-4 rounded-2xl bg-(--surface-elevated) border-l-4 ${
                  BORDER[appt.status] || 'border-(--border)'
                } hover:bg-white/2 transition-colors`}
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <span className="text-xs font-bold text-(--text-muted) inline-flex items-center gap-1">
                    <Clock size={11} />
                    {when.toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                  <Badge variant={STATUS_VARIANTS[appt.status] || 'default'}>{appt.status}</Badge>
                </div>
                <p className="text-sm font-bold text-white truncate">{appt.candidate_name}</p>
                {appt.notes && <p className="text-xs text-(--text-muted) truncate">{appt.notes}</p>}
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
