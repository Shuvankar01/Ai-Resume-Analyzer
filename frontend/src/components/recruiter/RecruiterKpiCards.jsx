import { Briefcase, FileText, Target, Clock, CheckCircle2, Timer, Sparkles, Loader2 } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';

/**
 * The four consolidated KPI cards that replaced the previous ten.
 *
 * Every figure is read from `GET /recruiter/metrics`, which derives it from real
 * rows (jobs, analyses, candidate actions, job timings). A newly registered
 * recruiter therefore sees genuine zeros rather than seeded numbers, so this
 * component never invents a fallback number — an absent metric renders as `—`.
 */
const CARDS = [
  {
    key: 'sourcing',
    title: 'Active Sourcing',
    icon: Briefcase,
    accent: 'text-(--primary)',
    ring: 'bg-(--primary)/10 border-(--primary)/20',
    metrics: [
      { label: 'Open Jobs', value: (m) => m.open_jobs, suffix: '' },
      { label: 'Resumes Analyzed', value: (m) => m.resumes_analyzed, suffix: '' },
    ],
  },
  {
    key: 'funnel',
    title: 'Funnel Performance',
    icon: Target,
    accent: 'text-emerald-400',
    ring: 'bg-emerald-500/10 border-emerald-500/20',
    metrics: [
      { label: 'Average ATS', value: (m) => m.average_ats_score, suffix: '%' },
      { label: 'Time-to-Hire', value: (m) => m.time_to_hire_days, suffix: 'd' },
    ],
  },
  {
    key: 'offers',
    title: 'Offer Conversion',
    icon: CheckCircle2,
    accent: 'text-amber-400',
    ring: 'bg-amber-500/10 border-amber-500/20',
    metrics: [
      { label: 'Offers Sent', value: (m) => m.offers_sent, suffix: '' },
      { label: 'Acceptance Rate', value: (m) => m.offer_acceptance_rate, suffix: '%' },
    ],
  },
  {
    key: 'ai',
    title: 'AI Benchmark',
    icon: Sparkles,
    accent: 'text-(--accent)',
    ring: 'bg-(--accent)/10 border-(--accent)/20',
    metrics: [
      { label: 'Processing Time', value: (m) => m.avg_processing_seconds, suffix: 's' },
      { label: 'Confidence Rate', value: (m) => m.ai_completion_rate, suffix: '%' },
    ],
  },
];

// 0 is a legitimate result (a brand new recruiter), so only null/undefined is
// rendered as "no data yet".
const format = (raw, suffix) => {
  if (raw === null || raw === undefined) return '—';
  if (typeof raw !== 'number') return `${raw}${suffix || ''}`;
  const rounded = Number.isInteger(raw) ? raw : Math.round(raw * 10) / 10;
  return `${rounded}${suffix || ''}`;
};

export default function RecruiterKpiCards({ metrics, loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {CARDS.map((card) => (
          <GlassCard key={card.key} className="p-6 flex items-center justify-center min-h-40">
            <Loader2 size={20} className="animate-spin text-(--text-muted)" />
          </GlassCard>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <EmptyState
        icon={FileText}
        title="Metrics unavailable"
        description="Recruiter metrics could not be loaded. Use Sync Intelligence to retry."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {CARDS.map((card) => {
        const Icon = card.icon;
        return (
          <GlassCard key={card.key} className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${card.ring}`}>
                <Icon size={18} className={card.accent} />
              </div>
              <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${card.accent}`}>
                {card.title}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {card.metrics.map((metric) => {
                const value = metric.value(metrics);
                return (
                  <div key={metric.label} className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-(--text-muted)">
                      {metric.label}
                    </span>
                    <span className="text-2xl font-black text-white tracking-tight">
                      {format(value, metric.suffix)}
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}

// Re-exported so the pipeline/health widgets can render the same clock
// treatment as the KPI cards without duplicating the icon set.
export { Clock, Timer };
