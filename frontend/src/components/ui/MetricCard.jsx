import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MetricCard({ title, value, icon: Icon, trend, trendValue }) {
  return (
    <div className="glass-panel p-8 rounded-[32px] border border-white/5 group hover:border-[#00f3ff]/20 transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-full -mr-8 -mt-8 transition-all group-hover:bg-[#00f3ff]/5"></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-gray-500 group-hover:text-[#00f3ff] group-hover:border-[#00f3ff]/20 transition-all duration-500">
          <Icon size={24} className="group-hover:scale-110 transition-transform" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
            trend === 'up' ? 'bg-green-500/10 text-green-400 border border-green-500/10' : 'bg-red-500/10 text-red-400 border border-red-500/10'
          }`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}%
          </div>
        )}
      </div>
      
      <div className="mt-8 relative z-10">
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{title}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <h3 className="text-4xl font-black text-white tracking-tighter group-hover:text-[#00f3ff] transition-colors duration-500">{value}</h3>
          <div className="w-1.5 h-1.5 rounded-full bg-[#00f3ff]/40 shadow-[0_0_8px_rgba(0,243,255,0.4)]"></div>
        </div>
      </div>
    </div>
  );
}
