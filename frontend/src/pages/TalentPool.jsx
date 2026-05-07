import { Users, Search, Filter } from 'lucide-react';

export default function TalentPool() {
  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10">
      <div className="space-y-1">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
          Talent Pool <Users className="text-[#00f3ff]" />
        </h2>
        <p className="text-gray-500">Explore and manage your global candidate database.</p>
      </div>

      <div className="glass-panel p-8 rounded-[32px] border border-white/5 flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <Search size={32} className="text-gray-600" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold text-white">Full Database Access</h3>
          <p className="text-gray-500 max-w-md">The complete talent pool management module is initializing. Soon you will be able to filter by expertise, location, and seniority.</p>
        </div>
        <button className="px-8 py-3 rounded-2xl bg-[#00f3ff] text-black font-bold hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all">
          Enable Advanced Search
        </button>
      </div>
    </div>
  );
}
