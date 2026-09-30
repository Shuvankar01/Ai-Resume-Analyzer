import { Target, Users } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';
import { useMemo } from 'react';

const STAGES = [
  { status: 'Shortlisted', label: 'Shortlisted', color: 'from-purple-500 to-purple-600' },
  { status: 'Interview', label: 'Interview', color: 'from-amber-500 to-amber-600' },
  { status: 'Offer', label: 'Offer', color: 'from-orange-500 to-orange-600' },
  { status: 'Hired', label: 'Hired', color: 'from-emerald-500 to-emerald-600' },
  { status: 'Rejected', label: 'Rejected', color: 'from-rose-500 to-rose-600' },
];

/**
 * Live pipeline tracker.
 *
 * Counts come from the recruiter's persisted action rows via
 * `GET /recruiter/metrics` → `pipeline`, where each candidate is counted once
 * under their most recent status. Nothing here is seeded, so an untouched
 * account correctly reads zero.
 */
export default function PipelineTracker({ pipeline, candidates = 0 }) {
  const rows = useMemo(() => {
    const counts = pipeline || {};
    const max = Math.max(1, ...STAGES.map((s) => counts[s.status] || 0));
    return STAGES.map((stage) => ({ ...stage, count: counts[stage.status] || 0, max }));
  }, [pipeline]);

  const totalTouched = rows
    .filter((row) => row.status !== 'Rejected')
    .reduce((sum, row) => sum + row.count, 0);

  return (
    <GlassCard className="p-8 flex flex-col">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <Target size={22} className="text-emerald-400" /> Pipeline Tracker
        </h3>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="block text-[9px] font-bold uppercase tracking-widest text-(--text-muted)">
              In Flight
            </span>
            <span className="text-sm font-black text-white">{totalTouched}</span>
          </div>
          <div className="text-right">
            <span className="block text-[9px] font-bold uppercase tracking-widest text-(--text-muted)">
              Talent Pool
            </span>
            <span className="text-sm font-black text-white">{candidates}</span>
          </div>
        </div>
      </div>

      {totalTouched === 0 && rows.every((row) => row.count === 0) ? (
        <EmptyState
          icon={Users}
          title="No pipeline activity yet"
          description="Shortlist, schedule, reject or offer a candidate and they will appear here by stage."
        />
      ) : (
        <div className="flex-1 flex flex-col gap-3">
          {rows.map((stage) => (
            <div key={stage.status} className="flex items-center gap-4">
              <div className="w-24 text-right">
                <span className="text-xs font-bold text-gray-400">{stage.label}</span>
              </div>
              <div className="flex-1 h-8 rounded-xl bg-white/5 overflow-hidden relative">
                <div
                  className={`h-full rounded-xl bg-linear-to-r ${stage.color} transition-all duration-700`}
                  style={{ width: `${(stage.count / stage.max) * 100}%` }}
                />
                <span className="absolute inset-0 flex items-center pl-3 text-xs font-black text-white">
                  {stage.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
