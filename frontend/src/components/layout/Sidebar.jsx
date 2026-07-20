import { LayoutDashboard, FileText, Users, Settings, LogOut, ChevronLeft, ChevronRight, BrainCircuit, Shield, User, GitCompare } from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isRecruiter, logout, user } = useAuth();
  
  const role = isRecruiter ? 'recruiter' : 'candidate';

  const menuItems = [
    { id: 'candidate-dashboard', label: 'Intelligence Hub', icon: LayoutDashboard, path: '/candidate', roles: ['candidate'], end: true },
    { id: 'candidate-compare', label: 'Resume Compare', icon: GitCompare, path: '/candidate/compare', roles: ['candidate'] },
    { id: 'candidate-profile', label: 'My Profile', icon: User, path: '/candidate/profile', roles: ['candidate'] },
    
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/recruiter', roles: ['recruiter'], end: true },
    { id: 'candidates', label: 'Talent Pool', icon: Users, path: '/recruiter/talent-pool', roles: ['recruiter'] },
    { id: 'recruiter-profile', label: 'Recruiter Profile', icon: User, path: '/recruiter/profile', roles: ['recruiter'] },
    
    { id: 'settings', label: 'Preferences', icon: Settings, path: role === 'recruiter' ? '/recruiter/preferences' : '/candidate/preferences', roles: ['candidate', 'recruiter'] },
  ];

  const filteredItems = menuItems.filter(item => item.roles.includes(role));

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 288 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-0 top-0 h-screen z-50 card-glass border-r border-[var(--border)] overflow-hidden hidden md:flex flex-col"
    >
      <div className="flex flex-col h-full w-72">
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <BrainCircuit size={24} className="text-[var(--primary)]" />
                </div>
                <span className="text-xl font-black text-white tracking-tighter">Resume<span className="text-[var(--accent)]">AI</span></span>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--accent)] border border-[var(--border)] transition-colors ${isCollapsed ? 'ml-3' : ''}`}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 mt-4 space-y-2 overflow-y-auto custom-scrollbar">
          {filteredItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group relative ${
                isActive 
                ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shadow-inner' 
                : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-white border border-transparent'
              } ${isCollapsed ? 'justify-center w-12 h-12 mx-auto' : 'w-full'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && !isCollapsed && (
                    <motion.div layoutId="active-nav-indicator" className="absolute left-0 w-1.5 h-8 bg-[var(--primary)] rounded-r-full shadow-[0_0_10px_var(--primary)]" />
                  )}
                  <item.icon size={22} className={isActive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'group-hover:scale-110 transition-transform'} />
                  
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="font-bold tracking-tight truncate whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  
                  {isCollapsed && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-[var(--surface-elevated)] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 border border-[var(--border)] shadow-xl whitespace-nowrap">
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Area */}
        <div className="p-4 border-t border-[var(--border)] space-y-3">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center gap-3 overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20 text-xs font-black shrink-0">
                  {getInitials(user?.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user?.full_name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Shield size={10} className="text-[var(--primary)] shrink-0" />
                    <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase truncate">{isRecruiter ? 'Recruiter' : 'Candidate'}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={logout}
            className={`w-full flex items-center gap-4 p-3 rounded-2xl text-[var(--text-muted)] hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all duration-300 group ${isCollapsed ? 'justify-center mx-auto w-12' : ''}`}
          >
            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-bold tracking-tight text-sm whitespace-nowrap overflow-hidden"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
