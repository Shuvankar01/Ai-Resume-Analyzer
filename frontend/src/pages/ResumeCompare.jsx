import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, GitCompare, Zap, TrendingUp, AlertTriangle, Sparkles, Check, X } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import MotionWrapper from '../components/ui/MotionWrapper';
import ProgressRing from '../components/ui/ProgressRing';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import AnimatedCounter from '../components/ui/AnimatedCounter';

// Simulates an "improved" version by bumping metrics
function deriveImproved(analysis) {
  if (!analysis) return null;
  const score = analysis.ats_score ?? 0;
  const improved = Math.min(100, Math.round(score + (100 - score) * 0.4));
  const addedKeywords = (analysis.missing_keywords || []).slice(0, 3);
  return {
    ats_score: improved,
    matched_keywords: [...(analysis.matched_keywords || []), ...addedKeywords],
    missing_keywords: (analysis.missing_keywords || []).slice(3),
    strengths: [
      ...(analysis.strengths || []),
      'Improved keyword alignment',
      'Enhanced formatting structure',
    ],
    improvement: improved - score,
  };
}

function ScoreColumn({ label, analysis, color, delay = 0 }) {
  const score = analysis?.ats_score ?? 0;
  const matchedCount = analysis?.matched_keywords?.length ?? 0;
  const missingCount = analysis?.missing_keywords?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Score Ring */}
      <GlassCard glow className="p-8 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--text-muted)] mb-4">{label}</p>
        <div className="flex justify-center mb-4 relative">
          <ProgressRing score={score} size={160} strokeWidth={12} color={color} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div>
              <span className="text-4xl font-black text-white">
                <AnimatedCounter value={score} />
                <span className="text-xl" style={{ color }}>%</span>
              </span>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold mt-1">ATS Score</p>
            </div>
          </div>
        </div>

        {/* Mini metrics */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-[var(--border)]">
            <p className="text-xl font-black text-emerald-400">{matchedCount}</p>
            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Matched</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-[var(--border)]">
            <p className="text-xl font-black text-rose-400">{missingCount}</p>
            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider">Missing</p>
          </div>
        </div>
      </GlassCard>

      {/* Keyword Lists */}
      <GlassCard className="p-6 space-y-5">
        <div>
          <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-3">
            <Check size={11} /> Matched Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {(analysis?.matched_keywords || []).slice(0, 8).map((kw, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {kw}
              </span>
            ))}
            {(!analysis?.matched_keywords?.length) && (
              <span className="text-[var(--text-muted)] text-sm italic">None found</span>
            )}
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-3">
            <X size={11} /> Missing Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {(analysis?.missing_keywords || []).slice(0, 6).map((kw, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                {kw}
              </span>
            ))}
            {(!analysis?.missing_keywords?.length) && (
              <span className="text-emerald-400 text-sm font-bold">Perfect alignment ✓</span>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Strengths */}
      <GlassCard className="p-6">
        <h4 className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.3em] mb-3">Core Strengths</h4>
        <ul className="space-y-2">
          {(analysis?.strengths || []).map((s, i) => (
            <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-[var(--primary)] mt-1">•</span> {s}
            </li>
          ))}
          {(!analysis?.strengths?.length) && (
            <li className="text-[var(--text-muted)] text-sm italic">No strengths highlighted.</li>
          )}
        </ul>
      </GlassCard>
    </motion.div>
  );
}

export default function ResumeCompare() {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysis } = location.state || {};
  const improved = deriveImproved(analysis);

  if (!analysis) {
    return (
      <MotionWrapper variant="page" className="p-10">
        <EmptyState
          icon={GitCompare}
          title="No Analysis to Compare"
          description="Run a resume analysis first, then use the Compare button to see before/after results."
          action={
            <button
              onClick={() => navigate('/candidate')}
              className="px-6 py-3 rounded-2xl bg-[var(--primary)] text-white font-bold hover-lift transition-all"
            >
              Go to Analysis
            </button>
          }
        />
      </MotionWrapper>
    );
  }

  return (
    <MotionWrapper variant="page" className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <button
            onClick={() => navigate('/candidate')}
            className="flex items-center gap-2 text-[var(--text-muted)] hover:text-white transition-colors text-sm font-bold mb-2"
          >
            <ArrowLeft size={16} /> Back to Analysis
          </button>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            Resume Comparison <GitCompare className="text-[var(--accent)]" size={32} />
          </h2>
          <p className="text-[var(--text-muted)]">Side-by-side before/after intelligence comparison.</p>
        </div>

        {/* Improvement Badge */}
        {improved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-1 px-8 py-5 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20"
          >
            <div className="flex items-center gap-2 text-emerald-400">
              <TrendingUp size={20} />
              <span className="text-3xl font-black">+{improved.improvement}%</span>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Potential Uplift</p>
          </motion.div>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
        {/* VS Divider (desktop) */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', bounce: 0.5 }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white font-black text-sm shadow-[0_0_30px_rgba(0,243,255,0.3)]"
          >
            VS
          </motion.div>
        </div>

        {/* Current Resume */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <h3 className="text-lg font-bold text-white">Current Resume</h3>
            <Badge variant="danger">Before</Badge>
          </div>
          <ScoreColumn label="Current Score" analysis={analysis} color="#f43f5e" delay={0.1} />
        </div>

        {/* Improved Resume */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
            <h3 className="text-lg font-bold text-white">Optimized Resume</h3>
            <Badge variant="success">After AI Optimization</Badge>
          </div>
          <ScoreColumn label="Improved Score" analysis={improved} color="#10b981" delay={0.25} />
        </div>
      </div>

      {/* Action Panel */}
      <GlassCard glow className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center border border-[var(--accent)]/20 shrink-0">
            <Sparkles size={22} className="text-[var(--accent)]" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-1">Ready to optimize your resume?</h4>
            <p className="text-[var(--text-muted)] text-sm">Apply the missing skills and keyword improvements to boost your ATS score by up to {improved?.improvement ?? 0}%.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/candidate')}
            className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-[var(--border)] text-sm"
          >
            New Analysis
          </button>
          <button className="px-6 py-3 rounded-2xl premium-gradient-bg text-white font-bold hover-lift transition-all shadow-[0_8px_25px_rgba(0,243,255,0.2)] text-sm flex items-center gap-2">
            <Zap size={15} /> Apply Improvements
          </button>
        </div>
      </GlassCard>
    </MotionWrapper>
  );
}
