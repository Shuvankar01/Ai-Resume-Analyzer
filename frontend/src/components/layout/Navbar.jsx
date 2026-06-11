import { Bell, Search, BrainCircuit, ChevronDown, User, LogOut, LayoutDashboard, FileText, BarChart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user, isRecruiter, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  const basePath = isRecruiter ? '/recruiter' : '/candidate';

  return (
    <nav className="h-20 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 lg:px-10">
      
      {/* Left side */}
      <div className="flex items-center gap-10">
        <Link to={basePath} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20 shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:scale-105 transition-transform">
            <BrainCircuit size={24} className="text-[var(--primary)] group-hover:text-white transition-colors" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter">Resume<span className="text-[var(--accent)]">AI</span></span>
        </Link>
        
        {/* Quick Links (Hidden on small screens) */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/5">
          <Link to={basePath} className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all">
            <LayoutDashboard size={14} /> Dashboard
          </Link>
          {!isRecruiter && (
            <Link to={`${basePath}/profile`} className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all">
              <FileText size={14} /> Resume
            </Link>
          )}
          {isRecruiter && (
            <Link to={`${basePath}/talent-pool`} className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold text-gray-300 hover:text-white hover:bg-white/10 transition-all">
              <BarChart size={14} /> Analytics
            </Link>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center relative group">
          <Search size={18} className="absolute left-4 text-gray-500 group-focus-within:text-[var(--primary)] transition-colors" />
          <input 
            type="text" 
            placeholder="Search intelligence database..." 
            className="w-64 pl-11 pr-4 py-2.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] focus:border-[var(--primary)]/50 focus:w-80 outline-none transition-all text-sm text-white placeholder:text-gray-600"
          />
          <div className="absolute right-4 px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--background)] text-[10px] font-mono text-gray-500 hidden xl:block">
            ⌘K
          </div>
        </div>

        <button className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--surface-elevated)] text-gray-400 hover:text-white transition-colors border border-transparent hover:border-[var(--border)]">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-[var(--background)] animate-pulse"></span>
        </button>

        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-[var(--surface-elevated)] border border-transparent hover:border-[var(--border)] transition-all"
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(user?.full_name)
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[var(--background)]"></div>
            </div>
            
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-white max-w-[100px] truncate">{user?.full_name || 'User'}</p>
              <p className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-widest">{isRecruiter ? 'Recruiter' : 'Candidate'}</p>
            </div>
            <ChevronDown size={14} className="text-gray-500 ml-1" />
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-3 w-56 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-2xl overflow-hidden backdrop-blur-xl z-[100]"
              >
                <div className="p-4 border-b border-[var(--border)] bg-white/5">
                  <p className="text-sm font-bold text-white truncate">{user?.full_name}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => { setShowProfileMenu(false); navigate(`${basePath}/profile`); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <User size={16} /> Identity Profile
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors"
                  >
                    <LogOut size={16} /> Terminate Session
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
