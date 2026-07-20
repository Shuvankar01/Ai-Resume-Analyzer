import React from 'react';
import { Sparkles } from 'lucide-react';
import GlassCard from '../GlassCard';

export default function ExecutiveSummaryCard({ summary }) {
  if (!summary) return null;
  return (
    <GlassCard className="p-6 relative overflow-hidden">
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--primary)]/10 blur-[40px] rounded-full pointer-events-none" />
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <Sparkles className="text-[var(--primary)]" size={20} />
        AI Executive Summary
      </h3>
      <p className="text-[var(--text)] leading-relaxed text-sm bg-[var(--background)]/30 p-4 rounded-xl border border-[var(--border)]">
        {summary}
      </p>
    </GlassCard>
  );
}
