import React from 'react';
import { Activity, ShieldCheck, FileCheck, Target } from 'lucide-react';
import GlassCard from '../GlassCard';
import ProgressRing from '../ProgressRing';

export default function HealthMetricsCard({ health }) {
  if (!health) return null;

  const metrics = [
    { label: 'Overall Health', value: health.overall_score, icon: Activity, color: 'text-emerald-400', ring: 'var(--primary)' },
    { label: 'AI Confidence', value: health.ai_confidence, icon: Target, color: 'text-blue-400', ring: '#60a5fa' },
    { label: 'Upload Quality', value: health.upload_quality, icon: FileCheck, color: 'text-purple-400', ring: '#c084fc' },
    { label: 'Completeness', value: health.completeness, icon: ShieldCheck, color: 'text-amber-400', ring: '#fbbf24' }
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Activity className="text-[var(--primary)]" size={20} />
        Resume Health Score
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div key={i} className="flex flex-col items-center justify-center">
            <ProgressRing progress={m.value} size={80} strokeWidth={6} color={m.ring} />
            <div className="mt-4 text-center">
              <span className={`flex items-center justify-center gap-1.5 text-sm font-semibold ${m.color}`}>
                <m.icon size={14} /> {m.value}%
              </span>
              <span className="text-xs text-[var(--text-muted)] mt-1.5 block">{m.label}</span>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
