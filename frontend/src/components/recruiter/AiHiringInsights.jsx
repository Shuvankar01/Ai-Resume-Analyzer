import { useMemo } from 'react';
import { BrainCircuit, TrendingUp, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

const ICONS = {
  success: { Icon: CheckCircle2, color: 'text-emerald-400', dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' },
  warning: { Icon: AlertTriangle, color: 'text-amber-400', dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' },
  info: { Icon: Info, color: 'text-blue-400', dot: 'bg-(--primary) shadow-[0_0_8px_rgba(0,243,255,0.8)]' },
};

/**
 * AI Hiring Insights.
 *
 * Every sentence is derived from the real metrics/skills payload. If there is
 * not enough data to say anything meaningful, the panel says so rather than
 * filling the space with marketing copy.
 */
function buildInsights({ metrics, topMissingSkills = [], trendingSkills = [], candidates = 0, analyses = 0 }) {
  const insights = [];

  if (candidates === 0 && analyses === 0) {
    return [
      {
        type: 'info',
        text: 'No candidates have been analyzed yet. Publish a job description or wait for resume submissions to build the pipeline.',
      },
    ];
  }

  const avg = metrics?.average_ats_score ?? 0;
  if (avg > 0) {
    if (avg >= 75) {
      insights.push({ type: 'success', text: `Average ATS alignment is ${avg}%. The pool is strong — accelerating final-round interviews is low risk.` });
    } else if (avg < 50) {
      insights.push({ type: 'warning', text: `Average ATS alignment is only ${avg}%. Tightening job descriptions would pull higher-quality matches into the funnel.` });
    } else {
      insights.push({ type: 'info', text: `Average ATS alignment is ${avg}%. Quality is steady — the leverage is in interview conversion, not sourcing volume.` });
    }
  }

  if (topMissingSkills.length > 0) {
    const names = topMissingSkills.slice(0, 3).map((s) => s.skill).join(', ');
    insights.push({ type: 'warning', text: `${names} are the most frequently missing skills across ${analyses} analyzed resume${analyses === 1 ? '' : 's'}. Prioritise sourcing campaigns for these.` });
  }

  if (trendingSkills.length > 0) {
    const names = trendingSkills.slice(0, 3).map((s) => s.skill).join(', ');
    insights.push({ type: 'success', text: `${names} are matching most often — this is the technology mix your current pool is strongest in.` });
  }

  const pipeline = metrics?.pipeline;
  if (pipeline) {
    const shortlisted = pipeline.Shortlisted || 0;
    const interview = pipeline.Interview || 0;
    if (shortlisted > 0 && interview === 0) {
      insights.push({ type: 'warning', text: `${shortlisted} candidate${shortlisted === 1 ? ' is' : 's are'} shortlisted with none in interview. Scheduling is the next conversion step.` });
    }
    if (interview > 0 && (pipeline.Offer || 0) === 0) {
      insights.push({ type: 'info', text: `${interview} candidate${interview === 1 ? ' is' : 's are'} in interview with no offers out. Review the interview slate for readiness.` });
    }
    if ((pipeline.Hired || 0) > 0) {
      insights.push({ type: 'success', text: `${pipeline.Hired} hire${pipeline.Hired === 1 ? '' : 's'} closed. Time-to-hire currently averages ${metrics.time_to_hire_days} day${metrics.time_to_hire_days === 1 ? '' : 's'}.` });
    }
  }

  const completion = metrics?.ai_completion_rate;
  if (completion != null && completion < 100) {
    insights.push({ type: 'warning', text: `AI analysis completion rate is ${completion}%. Failed jobs need a re-run before their candidates can be ranked.` });
  }

  if (insights.length === 0) {
    insights.push({ type: 'info', text: 'Not enough activity yet to generate insights. Shortlist or schedule a candidate to start the funnel.' });
  }

  return insights;
}

export default function AiHiringInsights({ metrics, topMissingSkills, trendingSkills, candidates = 0, analyses = 0 }) {
  const insights = useMemo(
    () => buildInsights({ metrics, topMissingSkills, trendingSkills, candidates, analyses }),
    [metrics, topMissingSkills, trendingSkills, candidates, analyses]
  );

  return (
    <GlassCard className="p-8 flex flex-col">
      <h3 className="text-xl font-bold text-(--primary) mb-6 flex items-center gap-3">
        <BrainCircuit size={22} /> AI Hiring Insights
      </h3>

      <ul className="space-y-4">
        {insights.map((insight, idx) => {
          const { Icon, color, dot } = ICONS[insight.type] || ICONS.info;
          return (
            <li key={idx} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed font-medium">
              <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${dot}`} />
              <span className="flex items-start gap-2">
                <Icon size={15} className={`${color} mt-0.5 shrink-0`} />
                <span>{insight.text}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 flex items-center justify-between text-[10px] text-(--text-muted) font-mono tracking-widest uppercase border-t border-(--border) pt-5">
        <span className="inline-flex items-center gap-1">
          <TrendingUp size={11} /> Derived from live analysis data
        </span>
      </div>
    </GlassCard>
  );
}
