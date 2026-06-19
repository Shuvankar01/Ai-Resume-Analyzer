import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase, TrendingUp, BookOpen, FileEdit,
  ChevronRight, Sparkles, Star, Target, Lightbulb
} from 'lucide-react';
import GlassCard from './GlassCard';

// Parse recommendations text into structured sections
function parseInsights(analysis) {
  const recommendations = analysis?.recommendations || '';
  const strengths = analysis?.strengths || [];
  const missing = analysis?.missing_keywords || [];
  const score = analysis?.ats_score ?? 0;

  // Derive role suggestions based on score tier and matched keywords
  const roles = score >= 80
    ? ['Senior ' + (analysis?.matched_keywords?.[0] || 'Technical') + ' Specialist', 'Lead Engineer', 'Principal Architect']
    : score >= 50
    ? ['Mid-Level Developer', 'Software Engineer II', 'Technical Analyst']
    : ['Junior Developer', 'Associate Engineer', 'Technical Intern'];

  // Growth areas from missing keywords
  const growthAreas = missing.slice(0, 4).map((kw) => ({
    skill: kw,
    urgency: 'High',
  }));

  // Learning suggestions based on missing skills
  const learnings = missing.slice(0, 3).map((kw) => ({
    topic: `${kw} Fundamentals`,
    resource: 'Professional Certification',
  }));

  return { recommendations, strengths, roles, growthAreas, learnings };
}

const SectionHeader = ({ icon: Icon, label, color = 'var(--primary)' }) => (
  <div className="flex items-center gap-2 mb-4">
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center"
      style={{ background: `${color}15`, border: `1px solid ${color}30` }}
    >
      <Icon size={15} style={{ color }} />
    </div>
    <h4 className="text-xs font-bold uppercase tracking-[0.3em]" style={{ color }}>
      {label}
    </h4>
  </div>
);

const CareerInsight = memo(function CareerInsight({ analysis }) {
  if (!analysis) return null;

  const { recommendations, strengths, roles, growthAreas, learnings } = parseInsights(analysis);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* AI Insight Header */}
      <motion.div variants={itemVariants}>
        <GlassCard glow className="p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Sparkles size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest mb-2">
                AI Engine · Gemini 2.0
              </div>
              <p className="text-gray-300 text-base leading-relaxed font-serif italic">
                "{recommendations || 'Analysis complete. Review your matched skills and address critical gaps to strengthen your application.'}"
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended Roles */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <SectionHeader icon={Briefcase} label="Recommended Roles" color="#3b82f6" />
            <div className="space-y-3">
              {roles.map((role, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-[var(--primary)]/20 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                      <Star size={11} className="text-[var(--primary)]" />
                    </div>
                    <span className="text-sm font-semibold text-gray-200">{role}</span>
                  </div>
                  <ChevronRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Strengths */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <SectionHeader icon={Target} label="Core Strengths" color="#10b981" />
            <div className="space-y-3">
              {strengths.length > 0 ? strengths.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <p className="text-sm text-gray-300 leading-relaxed">{s}</p>
                </div>
              )) : (
                <p className="text-[var(--text-muted)] text-sm italic">No strengths identified yet.</p>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Growth Areas */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <SectionHeader icon={TrendingUp} label="Growth Areas" color="#f59e0b" />
            {growthAreas.length > 0 ? (
              <div className="space-y-3">
                {growthAreas.map((area, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <span className="text-sm font-semibold text-gray-200">{area.skill}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/20">
                      {area.urgency}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--text-muted)] text-sm italic">No critical growth gaps detected.</p>
            )}
          </GlassCard>
        </motion.div>

        {/* Learning Suggestions */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-6">
            <SectionHeader icon={BookOpen} label="Learning Path" color="#a78bfa" />
            {learnings.length > 0 ? (
              <div className="space-y-3">
                {learnings.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Lightbulb size={13} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-200">{item.topic}</p>
                      <p className="text-[10px] text-[var(--text-muted)] font-mono">{item.resource}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--text-muted)] text-sm italic">No specific learning path identified.</p>
            )}
          </GlassCard>
        </motion.div>
      </div>

      {/* Resume Improvement Tips (from recommendations) */}
      <motion.div variants={itemVariants}>
        <GlassCard className="p-6">
          <SectionHeader icon={FileEdit} label="Resume Improvement Tips" color="var(--accent)" />
          <div className="p-5 rounded-2xl bg-[var(--accent)]/5 border border-[var(--accent)]/15 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--accent)]/10 blur-3xl rounded-full pointer-events-none" />
            <p className="text-sm text-gray-300 leading-relaxed relative z-10">
              {recommendations
                ? recommendations
                : 'Focus on adding measurable achievements, quantifying impact, and aligning your experience descriptions with the job description keywords identified above.'}
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
});

export default CareerInsight;
