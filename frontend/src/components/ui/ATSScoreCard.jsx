import { Sparkles, Target, Zap, AlertTriangle, Lightbulb } from 'lucide-react';
import GlassCard from './GlassCard';
import ProgressRing from './ProgressRing';
import AnimatedCounter from './AnimatedCounter';
import Badge from './Badge';

export default function ATSScoreCard({ analysis }) {
  if (!analysis) return null;

  const score = analysis.ats_score;
  const getStatus = () => {
    if (score >= 80) return { label: 'Strategic Alignment', variant: 'success' };
    if (score >= 50) return { label: 'Potential Match', variant: 'warning' };
    return { label: 'Structural Gap', variant: 'danger' };
  };

  const status = getStatus();

  return (
    <GlassCard glow className="p-8 md:p-12">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 pb-10 border-b border-[var(--border)]">
        <div className="relative flex items-center justify-center shrink-0">
          <ProgressRing score={score} size={224} strokeWidth={14} color={score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e'} />
          
          <div className="absolute flex flex-col items-center">
            <span className="text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
              <AnimatedCounter value={score} />
              <span className="text-2xl text-[var(--accent)] ml-0.5">%</span>
            </span>
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.4em] font-black mt-1">Match</span>
          </div>
        </div>

        <div className="flex-1 space-y-6 text-center md:text-left relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
              <Target size={12} className="text-[var(--accent)]" /> AI Capability Index
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Resume <br className="hidden md:block" /> Integrity
            </h3>
          </div>

          <p className="text-[var(--text-muted)] text-base leading-relaxed max-w-md mx-auto md:mx-0">
            Based on deep neural analysis of the job description against your professional profile metrics.
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-3">
             <Badge variant={status.variant} className="px-4 py-2 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]"></div>
                {status.label}
             </Badge>
             <div className="px-4 py-2 rounded-full border border-white/5 bg-white/[0.03] text-[var(--text-muted)] text-sm font-bold tracking-tight flex items-center gap-2">
                <Sparkles size={16} className="text-[var(--accent)]" /> 2.0 Engine
             </div>
          </div>
        </div>
      </div>

      {/* Analysis Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10">
        {/* Left Column */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Zap size={14} /> Matched Proficiency
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.matched_keywords?.map((kw, i) => (
                <Badge key={i} variant="success">{kw}</Badge>
              ))}
              {(!analysis.matched_keywords || analysis.matched_keywords.length === 0) && (
                <span className="text-[var(--text-muted)] text-sm italic">No direct keyword matches found.</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <AlertTriangle size={14} /> Critical Skill Gaps
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysis.missing_keywords?.map((kw, i) => (
                <Badge key={i} variant="danger">{kw}</Badge>
              ))}
              {(!analysis.missing_keywords || analysis.missing_keywords.length === 0) && (
                <span className="text-[var(--text-muted)] text-sm italic">Perfect skill alignment detected!</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="p-6 rounded-[24px] bg-[var(--surface-elevated)] border border-[var(--border)]">
            <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-[0.3em] mb-3">Core Strengths</h4>
            <ul className="space-y-3">
              {analysis.strengths?.map((strength, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-3">
                  <span className="text-[var(--primary)] mt-1">•</span> {strength}
                </li>
              ))}
              {(!analysis.strengths || analysis.strengths.length === 0) && (
                <li className="text-[var(--text-muted)] text-sm italic">No specific strengths highlighted.</li>
              )}
            </ul>
          </div>

          <div className="p-6 rounded-[24px] bg-gradient-to-br from-[var(--accent)]/5 to-transparent border border-[var(--accent)]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/10 blur-[50px] rounded-full pointer-events-none"></div>
            <h4 className="text-xs font-bold text-[var(--accent)] uppercase tracking-[0.3em] flex items-center gap-2 mb-3 relative z-10">
              <Lightbulb size={14} /> Strategic Recommendations
            </h4>
            <p className="text-sm text-gray-300 leading-relaxed font-serif italic relative z-10">
              "{analysis.recommendations}"
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
