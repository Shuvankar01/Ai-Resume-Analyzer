import { TrendingUp, TrendingDown } from 'lucide-react';
import GlassCard from './GlassCard';
import AnimatedCounter from './AnimatedCounter';

export default function MetricCard({ title, value, icon, trendValue, suffix = '', trend = 'up' }) {
  // `icon` is passed as a component reference (e.g. icon={Target}), so alias it to a
  // capitalized local for the <Icon /> call site below. Keeping the alias (instead of
  // destructuring straight to `Icon`) means `icon` reads as used here, so the
  // JSX-only usage is not misreported by no-unused-vars.
  const Icon = icon;
  const isNumber = typeof value === 'number' || !isNaN(Number(value));
  const numericValue = isNumber ? Number(value) : value;

  return (
    <GlassCard hover className="p-8 group relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/1 rounded-full -mr-8 -mt-8 transition-all group-hover:bg-(--accent)/5"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="p-4 rounded-2xl bg-white/3 border border-white/5 text-(--text-muted) group-hover:text-(--accent) group-hover:border-(--accent)/20 transition-all duration-500">
          <Icon size={24} className="group-hover:scale-110 transition-transform" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
            trend === 'up' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' : 'bg-rose-500/10 text-rose-400 border border-rose-500/10'
          }`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}%
          </div>
        )}
      </div>
      
      <div className="mt-8 relative z-10">
        <p className="text-[10px] text-(--text-muted) font-black uppercase tracking-[0.2em]">{title}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <h3 className="text-4xl font-black text-(--text) tracking-tighter group-hover:text-(--accent) transition-colors duration-500">
            {isNumber ? (
              <AnimatedCounter value={numericValue} suffix={suffix} />
            ) : (
              value
            )}
          </h3>
          <div className="w-1.5 h-1.5 rounded-full bg-(--accent)/40 shadow-[0_0_8px_var(--accent)]"></div>
        </div>
      </div>
    </GlassCard>
  );
}
