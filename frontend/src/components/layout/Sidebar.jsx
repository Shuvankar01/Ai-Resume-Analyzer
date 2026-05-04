import { LayoutDashboard, FileText, Users, Settings, LogOut, ChevronLeft, ChevronRight, BrainCircuit } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar({ role, activeTab, setActiveTab, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, roles: ['candidate', 'recruiter'] },
    { id: 'resumes', label: 'Documents', icon: FileText, roles: ['candidate'] },
    { id: 'candidates', label: 'Talent Pool', icon: Users, roles: ['recruiter'] },
    { id: 'settings', label: 'Preferences', icon: Settings, roles: ['candidate', 'recruiter'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className={`fixed left-0 top-0 h-screen transition-all duration-500 z-50 glass-panel border-r border-white/5 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-8 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left duration-500">
              <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                <BrainCircuit size={24} className="text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter">Resume<span className="text-[#00f3ff]">AI</span></span>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-gray-400 hover:text-[#00f3ff] border border-white/5 ${isCollapsed ? 'mx-auto' : ''}`}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-3 mt-8">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative ${
                activeTab === item.id 
                ? 'bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20 shadow-[0_0_20px_rgba(0,243,255,0.1)]' 
                : 'text-gray-500 hover:bg-white/[0.03] hover:text-gray-200'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 w-1.5 h-8 bg-[#00f3ff] rounded-r-full shadow-[0_0_15px_rgba(0,243,255,0.8)]"></div>
              )}
              <item.icon size={24} className={activeTab === item.id ? 'drop-shadow-[0_0_10px_rgba(0,243,255,0.6)]' : 'group-hover:scale-110 transition-transform'} />
              {!isCollapsed && <span className="font-bold tracking-tight">{item.label}</span>}
              
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-2 bg-[#1a1a25] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 border border-white/10 shadow-2xl">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User / Logout Section */}
        <div className="p-6 border-t border-white/5 space-y-4">
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={24} className="group-hover:translate-x-1 transition-transform" />
            {!isCollapsed && <span className="font-bold tracking-tight">Terminate Session</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
