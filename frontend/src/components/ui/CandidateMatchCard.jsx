import { memo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Zap } from 'lucide-react';
import ProgressRing from './ProgressRing';

const CandidateMatchCard = memo(function CandidateMatchCard({ candidate, rank }) {
  const { name, score } = candidate;

  const getInitials = (n) =>
    n?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '??';

  const scoreColor =
    score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e';

  const scoreBg =
    score >= 80 ? 'from-emerald-500/20 to-emerald-500/5' :
    score >= 50 ? 'from-amber-500/20 to-amber-500/5' :
    'from-rose-500/20 to-rose-500/5';

  const scoreLabel =
    score >= 80 ? 'Top Match' : score >= 50 ? 'Potential' : 'Under Review';

  const scoreLabelColor =
    score >= 80 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
    score >= 50 ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
    'text-rose-400 bg-rose-500/10 border-rose-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: rank * 0.07, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card-glass rounded-3xl p-6 cursor-pointer group relative overflow-hidden border border-white/5 hover:border-[var(--primary)]/20 transition-all"
    >
      {/* Rank badge */}
      <div className="absolute top-4 left-4 w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-[var(--text-muted)] border border-white/5">
        #{rank + 1}
      </div>

      {/* Ambient glow on hover */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${scoreBg} blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

      <div className="flex items-center gap-4 mt-4">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shrink-0"
          style={{
            background: `linear-gradient(135deg, ${scoreColor}40, ${scoreColor}20)`,
            border: `1px solid ${scoreColor}30`,
          }}
        >
          {getInitials(name)}
        </div>

        {/* Name & Label */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-white truncate">{name}</h4>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${scoreLabelColor} mt-1`}
          >
            <Star size={9} /> {scoreLabel}
          </span>
        </div>

        {/* Score Ring */}
        <div className="relative shrink-0">
          <ProgressRing score={score} size={68} strokeWidth={5} color={scoreColor} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-black text-white">{score}%</span>
          </div>
        </div>
      </div>

      {/* Score Bar */}
      <div className="mt-5">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1">
            <TrendingUp size={9} /> ATS Integrity Score
          </span>
          <span className="text-[10px] font-black" style={{ color: scoreColor }}>
            {score >= 80 ? 'Excellent' : score >= 50 ? 'Moderate' : 'Low'}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: rank * 0.07 + 0.3 }}
            className="h-full rounded-full"
            style={{ background: scoreColor, boxShadow: `0 0 8px ${scoreColor}80` }}
          />
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-mono uppercase">
          <Zap size={9} className="text-[var(--accent)]" /> AI Ranked
        </div>
        <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
          View Profile →
        </div>
      </div>
    </motion.div>
  );
});

export default CandidateMatchCard;
