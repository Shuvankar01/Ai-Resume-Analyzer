import React from 'react';
import { Briefcase, ChevronRight } from 'lucide-react';
import GlassCard from '../GlassCard';

export default function SuggestedRolesCard({ roles }) {
  if (!roles || roles.length === 0) return null;

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
        <Briefcase className="text-[var(--primary)]" size={20} />
        Suggested Roles
      </h3>
      <div className="space-y-3">
        {roles.map((role, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--primary)]/50 transition-colors cursor-pointer group">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{role.title}</span>
              <span className="text-xs text-[var(--text-muted)] mt-1">Confidence: {role.confidence}%</span>
            </div>
            <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
