import { CheckSquare, ArrowRight, Zap, Target, BookOpen } from 'lucide-react';

export default function ImprovementRoadmap({ analysis }) {
  if (!analysis) return null;

  const missing = analysis.missing_keywords || [];
  const score = analysis.ats_score ?? 0;

  // Generate dynamic steps based on analysis data
  const steps = [
    {
      title: 'Integrate Core Skills',
      icon: Target,
      color: 'text-[var(--accent)] bg-[var(--accent)]/10 border-[var(--accent)]/20',
      desc: missing.length > 0
        ? `Incorporate missing keywords: ${missing.slice(0, 3).join(', ')} in your project descriptions.`
        : 'Align resume keywords to job requirements.'
    },
    {
      title: 'Implement AI Recommendations',
      icon: Zap,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      desc: analysis.recommendations ? analysis.recommendations.split('.')[0] + '.' : 'Revise bullet points with action verbs and quantifiable results.'
    },
    {
      title: 'Continuous Skill Upskilling',
      icon: BookOpen,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      desc: missing.length > 3
        ? `Upskill in additional topics: ${missing.slice(3, 5).join(', ')} via online courses.`
        : 'Prepare talking points on related stack technologies.'
    }
  ];

  return (
    <div className="card-glass rounded-2xl p-6 border border-[var(--border)] relative overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <CheckSquare size={18} className="text-[var(--accent)]" />
        <h4 className="text-sm font-black text-white uppercase tracking-wider">AI Resume Improvement Roadmap</h4>
      </div>

      <div className="relative border-l border-white/5 ml-3 pl-6 space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="relative group">
              {/* Node indicator */}
              <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-[#05050A] border-[3px] border-[var(--primary)] group-hover:scale-125 transition-transform" />

              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded ${step.color} border`}>
                    <Icon size={12} />
                  </div>
                  <h5 className="text-xs font-black text-white tracking-tight">{step.title}</h5>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
