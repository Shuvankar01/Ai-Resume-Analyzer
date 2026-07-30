import React from 'react';
import { Activity, ShieldCheck, FileCheck, Target, Info } from 'lucide-react';
import GlassCard from '../GlassCard';
import ProgressRing from '../ProgressRing';
import { motion } from 'framer-motion';

export default function HealthMetricsCard({ health }) {
  if (!health) return null;

  const metrics = [
    { label: 'Overall Health', value: health.overall_score, explanation: health.overall_score_explanation, icon: Activity, color: 'text-emerald-400', ring: 'var(--primary)' },
    { label: 'AI Confidence', value: health.ai_confidence, explanation: health.ai_confidence_explanation, icon: Target, color: 'text-blue-400', ring: '#60a5fa' },
    { label: 'Upload Quality', value: health.upload_quality, explanation: health.upload_quality_explanation, icon: FileCheck, color: 'text-purple-400', ring: '#c084fc' },
    { label: 'Completeness', value: health.completeness, explanation: health.completeness_explanation, icon: ShieldCheck, color: 'text-amber-400', ring: '#fbbf24' }
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Activity className="text-[var(--primary)]" size={20} />
        Resume Health Score
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, ease: 'easeOut' }}
            className="flex flex-col items-center justify-start group"
          >
            <ProgressRing progress={m.value} size={80} strokeWidth={6} color={m.ring} />
            <div className="mt-4 text-center flex flex-col items-center">
              <span className={`flex items-center justify-center gap-1.5 text-sm font-semibold ${m.color}`}>
                <m.icon size={14} /> {m.value}%
              </span>
              <span className="text-xs text-white font-medium mt-1.5 block">{m.label}</span>
              {m.explanation && (
                <p className="text-[10px] text-[var(--text-muted)] mt-2 leading-relaxed text-center max-w-[130px] opacity-70 group-hover:opacity-100 transition-opacity">
                  {m.explanation}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
