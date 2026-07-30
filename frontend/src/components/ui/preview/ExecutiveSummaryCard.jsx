import React, { useState } from 'react';
import { Sparkles, MessageSquare, Map, TrendingUp, ChevronDown } from 'lucide-react';
import GlassCard from '../GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

function CollapsibleSection({ icon: Icon, title, items, defaultOpen = true, iconColorClass = "text-[var(--primary)]" }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  if (!items || items.length === 0) return null;
  
  return (
    <div className="pt-4 border-t border-[var(--border)]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
        aria-expanded={isOpen}
        aria-label={`Toggle ${title}`}
      >
        <h4 className="text-sm font-bold text-white flex items-center gap-2 group-hover:text-gray-300 transition-colors">
          <Icon className={iconColorClass} size={16} /> {title}
        </h4>
        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="space-y-2 mt-4">
              {items.map((item, i) => (
                <li key={`item-${i}`} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className={`${iconColorClass} font-bold mt-0.5`}>•</span> {item}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExecutiveSummaryCard({ summary, interviewQuestions, learningRoadmap, careerGrowth }) {
  if (!summary) return null;
  return (
    <GlassCard className="p-6 relative overflow-hidden flex flex-col gap-6">
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[var(--primary)]/10 blur-[40px] rounded-full pointer-events-none" />
      
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="text-[var(--primary)]" size={20} />
          AI Executive Summary
        </h3>
        <p className="text-[var(--text)] leading-relaxed text-sm bg-[var(--background)]/30 p-4 rounded-xl border border-[var(--border)]">
          {summary}
        </p>
      </div>

      <CollapsibleSection 
        icon={MessageSquare} 
        title="Suggested Technical Questions" 
        items={interviewQuestions} 
        iconColorClass="text-blue-400" 
      />
      
      <CollapsibleSection 
        icon={Map} 
        title="Learning Roadmap" 
        items={learningRoadmap} 
        iconColorClass="text-emerald-400" 
      />
      
      <CollapsibleSection 
        icon={TrendingUp} 
        title="Career Growth Suggestions" 
        items={careerGrowth} 
        iconColorClass="text-purple-400" 
      />
    </GlassCard>
  );
}
