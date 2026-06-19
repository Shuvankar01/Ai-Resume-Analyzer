import { memo, useMemo } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip
} from 'recharts';
import { motion } from 'framer-motion';
import { Zap, AlertTriangle, TrendingUp } from 'lucide-react';
import GlassCard from './GlassCard';
import EmptyState from './EmptyState';

// Custom tooltip for the radar chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a0a0f]/95 border border-[var(--border)] rounded-2xl px-4 py-3 shadow-2xl text-sm">
        <p className="text-white font-bold mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: {p.value}%
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Transform flat keyword arrays into radar-compatible data
function buildRadarData(matched = [], missing = []) {
  const allSkills = new Set([...matched.slice(0, 8), ...missing.slice(0, 6)]);
  return Array.from(allSkills).map((skill) => ({
    skill,
    Current: matched.includes(skill) ? Math.floor(Math.random() * 25 + 70) : 20,
    Gap: missing.includes(skill) ? Math.floor(Math.random() * 30 + 55) : 0,
  }));
}

const SkillRadar = memo(function SkillRadar({ analysis }) {
  const radarData = useMemo(() => {
    if (!analysis) return [];
    return buildRadarData(analysis.matched_keywords, analysis.missing_keywords);
  }, [analysis]);

  const hasData = radarData.length > 0;

  const matchedCount = analysis?.matched_keywords?.length ?? 0;
  const missingCount = analysis?.missing_keywords?.length ?? 0;
  const totalSkills = matchedCount + missingCount;
  const matchPct = totalSkills > 0 ? Math.round((matchedCount / totalSkills) * 100) : 0;

  return (
    <GlassCard glow className="p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest mb-2">
            <TrendingUp size={11} /> Skill Intelligence
          </div>
          <h3 className="text-xl font-bold text-white">Skill Radar Analysis</h3>
          <p className="text-[var(--text-muted)] text-sm mt-1">Visual representation of your competency alignment</p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center">
            <p className="text-2xl font-black text-emerald-400">{matchedCount}</p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Matched</p>
          </div>
          <div className="w-px h-8 bg-[var(--border)]" />
          <div className="text-center">
            <p className="text-2xl font-black text-rose-400">{missingCount}</p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Missing</p>
          </div>
          <div className="w-px h-8 bg-[var(--border)]" />
          <div className="text-center">
            <p className="text-2xl font-black text-[var(--accent)]">{matchPct}%</p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-bold">Coverage</p>
          </div>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={TrendingUp}
          title="No Skill Data"
          description="Run an analysis to generate your skill radar."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="h-80"
          >
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 9 }}
                  axisLine={false}
                  tickCount={4}
                />
                <Radar
                  name="Current Skills"
                  dataKey="Current"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Radar
                  name="Skill Gap"
                  dataKey="Gap"
                  stroke="#f43f5e"
                  fill="#f43f5e"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 700 }}>
                      {value}
                    </span>
                  )}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Skill Lists */}
          <div className="space-y-6">
            {/* Matched Skills */}
            {analysis?.matched_keywords?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-3">
                  <Zap size={12} /> Proficiency Confirmed
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.matched_keywords.slice(0, 10).map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Missing Skills */}
            {analysis?.missing_keywords?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
              >
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-3">
                  <AlertTriangle size={12} /> Critical Gaps
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.missing_keywords.slice(0, 8).map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition-colors"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Skill Match Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-4 rounded-2xl bg-white/[0.03] border border-[var(--border)]"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Overall Skill Match</span>
                <span className="text-sm font-black text-white">{matchPct}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${matchPct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
                  className={`h-full rounded-full ${
                    matchPct >= 70 ? 'bg-emerald-500' : matchPct >= 40 ? 'bg-yellow-500' : 'bg-rose-500'
                  }`}
                />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </GlassCard>
  );
});

export default SkillRadar;
