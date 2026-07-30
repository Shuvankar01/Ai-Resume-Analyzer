import React from 'react';
import { Code, Box, Database, Cloud, Terminal, Users, AlertTriangle, BrainCircuit, CheckSquare, GitBranch, Lightbulb } from 'lucide-react';
import GlassCard from '../GlassCard';

export default function CategorizedSkillsCard({ skills }) {
  if (!skills || !skills.matched) return null;
  
  const categories = [
    { key: 'languages', label: 'Languages', icon: Code },
    { key: 'frameworks', label: 'Frameworks', icon: Box },
    { key: 'databases', label: 'Databases', icon: Database },
    { key: 'cloud', label: 'Cloud', icon: Cloud },
    { key: 'devops', label: 'DevOps & Tooling', icon: Terminal },
    { key: 'soft_skills', label: 'Soft Skills', icon: Users },
    { key: 'ai_ml', label: 'AI / ML', icon: BrainCircuit },
    { key: 'testing', label: 'Testing', icon: CheckSquare },
    { key: 'version_control', label: 'Version Control', icon: GitBranch }
  ];

  const missing = skills.missing || [];
  const highPriority = missing.filter(m => m.priority === 'high');
  const medPriority = missing.filter(m => m.priority === 'medium');
  const lowPriority = missing.filter(m => m.priority === 'low');

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Code className="text-[var(--primary)]" size={20} />
          Matched Intelligence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const matched = skills.matched[cat.key] || [];
            if (matched.length === 0) return null;
            return (
              <div key={cat.key} className="p-4 rounded-xl bg-[var(--background)]/30 border border-[var(--border)]">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
                  <cat.icon size={16} className="text-[var(--text-muted)]" />
                  <h4 className="text-sm font-medium text-[var(--text)]">{cat.label}</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {matched.map((s, i) => (
                    <span key={`m-${i}`} className="px-2.5 py-1 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium border border-[var(--primary)]/20 shadow-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {missing.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="text-amber-400" size={20} />
            Strategic Skill Gaps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {highPriority.length > 0 && (
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">High Priority</h4>
                <div className="flex flex-wrap gap-2">
                  {highPriority.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-300 text-xs border border-red-500/20 font-medium">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {medPriority.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3">Medium Priority</h4>
                <div className="flex flex-wrap gap-2">
                  {medPriority.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 text-xs border border-amber-500/20 font-medium">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {lowPriority.length > 0 && (
              <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">Low Priority</h4>
                <div className="flex flex-wrap gap-2">
                  {lowPriority.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 text-[var(--text-muted)] text-xs border border-white/10">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {skills.recommended && skills.recommended.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[var(--border)]">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="text-yellow-400" size={16} /> Recommended Focus
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.recommended.map((s, i) => (
                  <span key={`rec-${i}`} className="px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-300 text-xs border border-yellow-500/20 font-bold shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}
