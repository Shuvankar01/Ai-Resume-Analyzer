import { useState } from 'react';
import { UserCheck, UserX, Calendar, Briefcase, X } from 'lucide-react';
import { AnimatePresence, motion as MotionPrimitive } from 'framer-motion';
const MotionDiv = MotionPrimitive.div;
import useCandidateActions, { CANDIDATE_ACTIONS } from '../../hooks/useCandidateActions';

const ICONS = {
  SHORTLIST: UserCheck,
  REJECT: UserX,
  INTERVIEW: Calendar,
  OFFER: Briefcase,
};

/**
 * The four recruiter decisions (Shortlist / Reject / Schedule Interview /
 * Send Offer), rendered identically wherever a candidate appears.
 *
 * Scheduling opens a small date-time picker because the interview date is
 * needed for the hiring calendar widget — it is not invented client-side.
 */
export default function CandidateActions({ candidate, layout = 'grid', size = 'md' }) {
  const { status, pending, runAction } = useCandidateActions(candidate);
  const [scheduling, setScheduling] = useState(false);
  const [when, setWhen] = useState('');

  const isCompact = size === 'sm';
  const buttonClass = isCompact
    ? 'px-2.5 py-1.5 text-[11px] gap-1.5'
    : 'p-3 text-sm gap-2';

  const handleSchedule = async () => {
    if (!when) return;
    const ok = await runAction('INTERVIEW', { scheduledFor: new Date(when).toISOString() });
    if (ok !== false) setScheduling(false);
  };

  return (
    <div className="space-y-2">
      <div className={`grid ${layout === 'row' ? 'grid-cols-4' : 'grid-cols-2'} gap-2`}>
        {CANDIDATE_ACTIONS.map((action) => {
          const Icon = ICONS[action.action];
          const isActive = status === action.status;

          if (action.requiresSchedule) {
            return (
              <div key={action.action} className="relative">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setScheduling((s) => !s)}
                  aria-expanded={scheduling}
                  className={`w-full flex items-center justify-center rounded-xl border font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${buttonClass} ${action.color} ${
                    isActive ? 'ring-1 ring-(--accent)/40' : ''
                  }`}
                >
                  <Icon size={isCompact ? 13 : 15} /> {action.label}
                </button>

                <AnimatePresence>
                  {scheduling && (
                    <MotionDiv
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute left-0 right-0 top-full mt-2 z-30 p-3 rounded-2xl bg-(--surface-elevated) border border-(--border) shadow-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-(--text-muted)">
                          Interview date
                        </span>
                        <button
                          type="button"
                          onClick={() => setScheduling(false)}
                          className="text-(--text-muted) hover:text-white"
                          aria-label="Close scheduler"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <input
                        type="datetime-local"
                        value={when}
                        onChange={(e) => setWhen(e.target.value)}
                        className="w-full bg-(--background) border border-(--border) rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-(--accent)/40"
                      />
                      <button
                        type="button"
                        disabled={!when || pending}
                        onClick={handleSchedule}
                        className="w-full py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold disabled:opacity-40 hover:bg-purple-500/30 transition-colors"
                      >
                        Confirm Interview
                      </button>
                    </MotionDiv>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          return (
            <button
              key={action.action}
              type="button"
              disabled={pending}
              onClick={() => runAction(action.action)}
              className={`w-full flex items-center justify-center rounded-xl border font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${buttonClass} ${action.color} ${
                isActive ? 'ring-1 ring-(--accent)/40' : ''
              }`}
            >
              <Icon size={isCompact ? 13 : 15} /> {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
