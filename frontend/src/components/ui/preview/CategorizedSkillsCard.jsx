import React from 'react';
import { Code, Box, PenTool, Users, Terminal } from 'lucide-react';
import GlassCard from '../GlassCard';

export default function CategorizedSkillsCard({ skills }) {
  if (!skills || !skills.matched) return null;
  
  const categories = [
    { key: 'languages', label: 'Languages', icon: Code },
    { key: 'frameworks', label: 'Frameworks', icon: Box },
    { key: 'tools', label: 'Tools & Platforms', icon: PenTool },
    { key: 'soft_skills', label: 'Soft Skills', icon: Users },
    { key: 'domain_keywords', label: 'Domain Keywords', icon: Terminal }
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Code className="text-[var(--primary)]" size={20} />
        Categorized Skill Intelligence
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => {
          const matched = skills.matched[cat.key] || [];
          const missing = skills.missing[cat.key] || [];
          if (matched.length === 0 && missing.length === 0) return null;
          
          return (
            <div key={cat.key} className="p-4 rounded-xl bg-[var(--background)]/30 border border-[var(--border)]">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
                <cat.icon size={16} className="text-[var(--text-muted)]" />
                <h4 className="text-sm font-medium text-[var(--text)]">{cat.label}</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {matched.map((s, i) => (
                  <span key={`m-${i}`} className="px-2.5 py-1 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium border border-[var(--primary)]/20">
                    {s}
                  </span>
                ))}
                {missing.map((s, i) => (
                  <span key={`mis-${i}`} className="px-2.5 py-1 rounded-md bg-[var(--text-muted)]/10 text-[var(--text-muted)] text-xs border border-[var(--border)] border-dashed opacity-60">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
