import { useState } from 'react';
import { Target, Flame, Layers } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';
import { AnimatePresence, motion as MotionPrimitive } from 'framer-motion';
const MotionDiv = MotionPrimitive.div;

const TABS = [
  { id: 'missing', label: 'Top Skills', icon: Target, empty: 'No skill gaps detected yet', description: 'Skills most often missing across analyzed resumes — your sourcing priorities.' },
  { id: 'trending', label: 'Trending Technologies', icon: Flame, empty: 'No trending technologies yet', description: 'Technologies most frequently matched across analyzed resumes.' },
];

/**
 * Strategic skill demand, split into two tabs.
 *
 * `missing` comes from `top_missing_skills` and `trending` from
 * `trending_skills`, both aggregated server-side from real `Analysis` rows.
 * Empty arrays render an explanatory empty state rather than a fabricated
 * placeholder list.
 */
export default function SkillDemandPanel({ topMissingSkills = [], trendingSkills = [] }) {
  const [tab, setTab] = useState('missing');
  const active = TABS.find((t) => t.id === tab) || TABS[0];
  const rows = tab === 'missing' ? topMissingSkills : trendingSkills;

  return (
    <GlassCard className="p-8 flex flex-col">
      <div className="flex items-center justify-between mb-1 gap-4 flex-wrap">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <Layers size={22} className="text-purple-400" /> Strategic Skill Demand
        </h3>
      </div>
      <p className="text-xs text-(--text-muted) mb-5">{active.description}</p>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/3 border border-(--border) mb-6 self-start">
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={isActive}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-(--primary)/15 text-(--primary) border border-(--primary)/25'
                  : 'text-(--text-muted) hover:text-white border border-transparent'
              }`}
            >
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <MotionDiv
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {rows.length === 0 ? (
            <EmptyState
              icon={active.icon}
              title={active.empty}
              description="This view fills in automatically as resumes are analyzed."
            />
          ) : (
            <div className="space-y-3">
              {rows.map((row, idx) => {
                const max = Math.max(...rows.map((r) => r.count), 1);
                return (
                  <div key={row.skill} className="flex items-center gap-3">
                    <span className="text-xs font-black text-(--text-muted) w-5">{idx + 1}</span>
                    <span className="text-xs text-gray-300 w-28 truncate">{row.skill}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-(--primary) to-(--accent) transition-all duration-700"
                        style={{ width: `${(row.count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white w-8 text-right">{row.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </MotionDiv>
      </AnimatePresence>
    </GlassCard>
  );
}
