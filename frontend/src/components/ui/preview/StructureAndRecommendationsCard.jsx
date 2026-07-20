import React from 'react';
import { Layers, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';
import GlassCard from '../GlassCard';

export default function StructureAndRecommendationsCard({ sections, recommendations }) {
  return (
    <div className="space-y-6">
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
