import { Bell, Search, User, Globe, Command } from 'lucide-react';

export default function Navbar({ user }) {
  return (
    <nav className="sticky top-0 w-full h-20 glass-panel border-b border-white/5 px-6 md:px-10 flex items-center justify-between z-[40] backdrop-blur-xl bg-[#0a0a0f]/40">
      {/* Search Bar / Command Menu */}
      <div className="relative w-full max-w-md hidden md:block group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00f3ff] transition-colors">
           <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Command + K to search..." 
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-16 focus:bg-white/[0.05] focus:border-[#00f3ff]/40 outline-none transition-all text-sm text-gray-300 placeholder:text-gray-600"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 rounded-lg bg-white/5 border border-white/10">
          <Command size={12} className="text-gray-500" />
          <span className="text-[10px] font-bold text-gray-500">K</span>
        </div>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4 md:gap-8">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-500 tracking-widest uppercase">
          <Globe size={12} className="text-green-500 animate-pulse" />
          Node: Virginia-East
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all group">
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#00f3ff] rounded-full shadow-[0_0_15px_rgba(0,243,255,1)] animate-pulse"></span>
          </button>
          
          <div className="flex items-center gap-4 pl-4 md:pl-8 border-l border-white/5">
            <div className="text-right hidden sm:block space-y-0.5">
              <p className="text-sm font-bold text-white tracking-tight leading-none">{user?.full_name || 'System Admin'}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black leading-none">{user?.role || 'Guest'}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00f3ff]/10 to-[#8b5cf6]/10 border border-white/10 flex items-center justify-center text-[#00f3ff] shadow-2xl relative group overflow-hidden">
               <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors"></div>
               <User size={24} className="relative z-10" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
