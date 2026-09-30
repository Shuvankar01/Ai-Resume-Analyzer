import React, { useState, memo } from 'react';
import { Sparkles, MessageSquare, Map, TrendingUp, ChevronDown } from 'lucide-react';
import GlassCard from '../GlassCard';

function CollapsibleSection({ title, items, defaultOpen = true, iconColorClass = "text-(--primary)" }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  if (!items || items.length === 0) return null;
  
  return (
    <div className="pt-4 border-t border-(--border)">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
        aria-expanded={isOpen}
        aria-label={`Toggle ${title}`}
      >
        <h4 className="text-sm font-bold text-white flex items-center gap-2 group-hover:text-gray-300 transition-colors">
          <span className={iconColorClass}></span> {title}
        </h4>
        <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <ul className="space-y-2 mt-4">
          {items.map((item, i) => (
            <li key={`item-${i}`} className="text-sm text-gray-300 flex items-start gap-2">
              <span className={`${iconColorClass} font-bold mt-0.5`}>•</span> {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default memo(function ExecutiveSummaryCard({ summary, interviewQuestions, learningRoadmap, careerGrowth, detailed = true }) {
  if (!summary) return null;
  return (
    <GlassCard className="p-6 relative overflow-hidden flex flex-col gap-6">
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-(--primary)/10 blur-[40px] rounded-full pointer-events-none" />
      
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="text-(--primary)" size={20} />
          AI Executive Summary
        </h3>
        <p className="text-(--text) leading-relaxed text-sm bg-(--background)/30 p-4 rounded-xl border border-(--border)">
          {summary}
        </p>
      </div>

      {/* Detailed AI Summaries preference — off keeps only the summary above. */}
      {detailed ? (
        <>
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
        </>
      ) : (
        <p className="text-xs text-(--text-muted) italic">
          Detailed breakdowns are hidden. Enable “Detailed AI Summaries” in Preferences → AI to restore them.
        </p>
      )}
    </GlassCard>
  );
});
