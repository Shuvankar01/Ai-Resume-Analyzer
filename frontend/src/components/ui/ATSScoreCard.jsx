import { Sparkles, Target } from 'lucide-react';
import GlassCard from './GlassCard';
import ProgressRing from './ProgressRing';
import AnimatedCounter from './AnimatedCounter';
import Badge from './Badge';

export default function ATSScoreCard({ score, label = "AI Compatibility Index" }) {
  const getStatus = () => {
    if (score >= 80) return { label: 'Strategic Alignment', variant: 'success' };
    if (score >= 50) return { label: 'Potential Match', variant: 'warning' };
    return { label: 'Structural Gap', variant: 'danger' };
  };

  const status = getStatus();

  return (
    <GlassCard glow className="p-10 md:p-14 flex flex-col md:flex-row items-center gap-10 md:gap-16">
      <div className="relative flex items-center justify-center shrink-0">
        <ProgressRing score={score} size={224} strokeWidth={14} color={score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e'} />
        
        <div className="absolute flex flex-col items-center">
          <span className="text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
            <AnimatedCounter value={score} />
            <span className="text-2xl text-[var(--accent)] ml-0.5">%</span>
          </span>
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-[0.4em] font-black mt-1">Score</span>
        </div>
      </div>

      <div className="flex-1 space-y-6 text-center md:text-left relative z-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
            <Target size={12} className="text-[var(--accent)]" /> {label}
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Resume Match <br className="hidden md:block" /> Integrity
          </h3>
        </div>

        <p className="text-[var(--text-muted)] text-base leading-relaxed max-w-sm mx-auto md:mx-0">
          Based on our deep neural analysis of the job description and your professional profile.
        </p>

        <div className="flex flex-wrap justify-center md:justify-start gap-4">
           <Badge variant={status.variant} className="px-4 py-2 text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-current animate-pulse shadow-[0_0_8px_currentColor]"></div>
              {status.label}
           </Badge>
           <div className="px-4 py-2 rounded-full border border-white/5 bg-white/[0.03] text-[var(--text-muted)] text-sm font-bold tracking-tight flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500/50" /> Premium Analysis
           </div>
        </div>
      </div>
    </GlassCard>
  );
}
