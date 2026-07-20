import React from 'react';
import { FileText, Type, List, AlertTriangle } from 'lucide-react';
import GlassCard from '../GlassCard';

export default function AtsMetricsCard({ ats, risks }) {
  if (!ats) return null;

  const metrics = [
    { label: 'Readability', value: ats.readability_score, icon: Type },
    { label: 'Formatting', value: ats.formatting_score, icon: FileText },
    { label: 'Buzzword Density', value: ats.buzzword_density, icon: List }
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
        <AlertTriangle className="text-[var(--primary)]" size={20} />
        ATS Metrics & Risks
      </h3>
      
      <div className="space-y-4 mb-6">
        {metrics.map((m, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-muted)] flex items-center gap-2">
              <m.icon size={16} /> {m.label}
            </span>
            <div className="w-1/2 bg-[var(--surface-elevated)] h-2 rounded-full overflow-hidden border border-[var(--border)]">
              <div 
                className="h-full bg-[var(--primary)]" 
                style={{ width: `${m.value}%` }} 
              />
            </div>
            <span className="text-sm font-medium w-8 text-right">{m.value}%</span>
          </div>
        ))}
      </div>

      {risks && risks.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-1.5">
            <AlertTriangle size={14} /> Potential Blockers
          </h4>
          <ul className="space-y-2">
            {risks.map((risk, i) => (
              <li key={i} className="text-xs text-[var(--text-muted)] flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1 flex-shrink-0" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlassCard>
  );
}
