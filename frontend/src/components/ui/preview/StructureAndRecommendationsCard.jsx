import React from 'react';
import { Layers, Lightbulb, CheckCircle2, ThumbsUp, ThumbsDown } from 'lucide-react';
import GlassCard from '../GlassCard';

export default function StructureAndRecommendationsCard({ sections, recommendations, strengths, weaknesses }) {
  return (
    <div className="space-y-6">
      {(strengths?.length > 0 || weaknesses?.length > 0) && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <ThumbsUp className="text-[var(--primary)]" size={20} />
            Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strengths?.length > 0 && (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ThumbsUp size={14} /> Strengths
                </h4>
                <ul className="space-y-2">
                  {strengths.map((str, i) => (
                    <li key={i} className="text-xs text-[var(--text-muted)] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                      {str}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {weaknesses?.length > 0 && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ThumbsDown size={14} /> Areas for Improvement
                </h4>
                <ul className="space-y-2">
                  {weaknesses.map((wk, i) => (
                    <li key={i} className="text-xs text-[var(--text-muted)] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                      {wk}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </GlassCard>
      )}
      {sections && sections.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Layers className="text-[var(--primary)]" size={20} />
            Detected Sections
          </h3>
          <div className="flex flex-wrap gap-2">
            {sections.map((section, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-full text-xs text-[var(--text-muted)]">
                <CheckCircle2 size={12} className="text-[var(--primary)]" />
                {section}
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {recommendations && recommendations.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="text-[var(--primary)]" size={20} />
            Quick Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-[var(--background)]/30 rounded-lg border border-[var(--border)]">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  rec.priority === 'high' ? 'bg-red-400' :
                  rec.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)] block mb-0.5">
                    {rec.category}
                  </span>
                  <p className="text-xs text-[var(--text)] leading-relaxed">
                    {rec.suggestion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
