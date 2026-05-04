import { Sparkles, Target } from 'lucide-react';

export default function ATSScoreCard({ score, label = "AI Compatibility Index" }) {
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getStatus = () => {
    if (score >= 80) return { label: 'Strategic Alignment', color: 'text-green-400', border: 'border-green-500/20', bg: 'bg-green-500/10' };
    if (score >= 50) return { label: 'Potential Match', color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/10' };
    return { label: 'Structural Gap', color: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/10' };
  };

  const status = getStatus();

  return (
    <div className="glass-panel p-10 md:p-14 rounded-[48px] relative overflow-hidden flex flex-col md:flex-row items-center gap-10 md:gap-16 premium-glow border-white/[0.05]">
      {/* BACKGROUND DECORATIONS */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f3ff]/5 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#8b5cf6]/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative w-56 h-56 flex items-center justify-center shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background Circle */}
          <circle 
            cx="112" cy="112" r={radius} 
            className="stroke-white/[0.03]" 
            strokeWidth="14" fill="none" 
          />
          {/* Outer Glow Path */}
          <circle 
            cx="112" cy="112" r={radius} 
            className="stroke-[#00f3ff]/20 blur-sm" 
            strokeWidth="16" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            strokeLinecap="round" 
            fill="none"
          />
          {/* Main Progress Circle */}
          <circle 
            cx="112" cy="112" r={radius} 
            className="stroke-[#00f3ff] transition-all duration-[1500ms] ease-out" 
            strokeWidth="14" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset} 
            strokeLinecap="round" 
            fill="none"
            style={{ filter: 'drop-shadow(0 0 15px rgba(0, 243, 255, 0.8))' }}
          />
        </svg>
        
        <div className="absolute flex flex-col items-center">
          <span className="text-6xl font-black text-white tracking-tighter drop-shadow-2xl">{score}<span className="text-2xl text-[#00f3ff] ml-0.5">%</span></span>
          <span className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-black mt-1">Score</span>
        </div>
      </div>

      <div className="flex-1 space-y-6 text-center md:text-left relative z-10">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Target size={12} className="text-[#00f3ff]" /> System Evaluation
          </div>
          <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Resume Match <br className="hidden md:block" /> Integrity
          </h3>
        </div>

        <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto md:mx-0">
          Based on our deep neural analysis of the job description and your professional profile.
        </p>

        <div className="flex flex-wrap justify-center md:justify-start gap-4">
           <div className={`px-6 py-2.5 rounded-2xl border ${status.border} ${status.bg} ${status.color} text-sm font-bold tracking-tight flex items-center gap-3`}>
              <div className={`w-2 h-2 rounded-full ${status.color.replace('text', 'bg')} animate-pulse shadow-[0_0_8px_currentColor]`}></div>
              {status.label}
           </div>
           <div className="px-6 py-2.5 rounded-2xl border border-white/5 bg-white/[0.03] text-gray-400 text-sm font-bold tracking-tight flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-500/50" /> Premium Analysis
           </div>
        </div>
      </div>
    </div>
  );
}
