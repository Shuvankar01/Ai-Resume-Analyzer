import { LayoutDashboard, FileText, Users, Settings, LogOut, ChevronLeft, ChevronRight, BrainCircuit, Shield } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isRecruiter, logout, user } = useAuth();
  
  const role = isRecruiter ? 'recruiter' : 'candidate';

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/recruiter', roles: ['recruiter'], end: true },
    { id: 'candidate-dashboard', label: 'Overview', icon: LayoutDashboard, path: '/candidate', roles: ['candidate'], end: true },
    { id: 'resumes', label: 'Documents', icon: FileText, path: '/candidate/documents', roles: ['candidate'] },
    { id: 'candidates', label: 'Talent Pool', icon: Users, path: '/recruiter/talent-pool', roles: ['recruiter'] },
    { id: 'settings', label: 'Preferences', icon: Settings, path: role === 'recruiter' ? '/recruiter/preferences' : '/candidate/preferences', roles: ['candidate', 'recruiter'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  return (
    <aside className={`fixed left-0 top-0 h-screen transition-all duration-500 z-50 glass-panel border-r border-white/5 ${isCollapsed ? 'w-20' : 'w-72'}`}>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-8 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left duration-500">
              <div className="w-10 h-10 rounded-xl premium-gradient flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.3)] group cursor-pointer">
                <BrainCircuit size={24} className="text-white group-hover:rotate-[30deg] transition-transform" />
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
            <NavLink
              key={item.id}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative ${
                isActive 
                ? 'bg-[#00f3ff]/10 text-[#00f3ff] border border-[#00f3ff]/20 shadow-[0_0_20px_rgba(0,243,255,0.1)]' 
                : 'text-gray-500 hover:bg-white/[0.03] hover:text-gray-200'
              }`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 w-1.5 h-8 bg-[#00f3ff] rounded-r-full shadow-[0_0_15px_rgba(0,243,255,0.8)]"></div>
                  )}
                  <item.icon size={24} className={isActive ? 'drop-shadow-[0_0_10px_rgba(0,243,255,0.6)]' : 'group-hover:scale-110 transition-transform'} />
                  {!isCollapsed && <span className="font-bold tracking-tight">{item.label}</span>}
                  
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-2 bg-[#1a1a25] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 border border-white/10 shadow-2xl">
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Mini Profile & Logout */}
        <div className="p-6 border-t border-white/5 space-y-4">
          {!isCollapsed && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3 animate-in fade-in duration-700">
              <div className="w-10 h-10 rounded-xl bg-[#00f3ff]/10 flex items-center justify-center text-[#00f3ff] border border-[#00f3ff]/20 text-xs font-black">
                {getInitials(user?.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                <div className="flex items-center gap-1">
                  <Shield size={10} className="text-[#00f3ff]" />
                  <p className="text-[10px] text-gray-500 font-bold uppercase truncate">{isRecruiter ? 'Recruiter' : 'Candidate'}</p>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={logout}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group ${isCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={24} className="group-hover:translate-x-1 transition-transform" />
            {!isCollapsed && <span className="font-bold tracking-tight text-sm">Terminate Session</span>}
            
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-2 bg-[#1a1a25] text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 border border-red-500/10 shadow-2xl">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
