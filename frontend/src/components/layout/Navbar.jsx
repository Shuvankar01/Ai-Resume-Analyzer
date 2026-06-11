import { Link } from 'react-router-dom';
import { Bell, Search, Globe, Command, LogOut, BrainCircuit, Moon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { memo } from 'react';
import { motion } from 'framer-motion';
import MotionWrapper from '../ui/MotionWrapper';

const Navbar = memo(() => {
  const { user, logout, isRecruiter } = useAuth();
  
  const profilePath = isRecruiter ? '/recruiter/profile' : '/candidate/profile';

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  return (
    <nav className="sticky top-0 w-full h-20 card-glass border-b border-[var(--border)] px-6 md:px-10 flex items-center justify-between z-[40]">
      {/* Left: Mobile Logo (Desktop is in Sidebar) */}
      <div className="flex items-center md:hidden gap-3">
        <motion.div 
          whileHover={{ rotate: 30 }}
          className="w-10 h-10 rounded-xl premium-gradient-bg flex items-center justify-center border border-[var(--accent)]/20"
        >
          <BrainCircuit size={24} className="text-[var(--primary)]" />
        </motion.div>
      </div>

      {/* Center: Search Bar */}
      <MotionWrapper variant="slideUp" delay={0.1} className="relative w-full max-w-md hidden md:block group mx-auto md:ml-0">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors">
           <Search size={18} />
        </div>
        <input 
          type="text" 
          placeholder="Command + K to search..." 
          className="w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl py-2.5 pl-12 pr-16 focus:bg-[var(--glass-bg)] focus:border-[var(--accent)]/40 outline-none transition-all text-sm text-[var(--text)] placeholder:text-[var(--text-muted)]"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 rounded-lg bg-white/5 border border-white/10">
          <Command size={12} className="text-[var(--text-muted)]" />
          <span className="text-[10px] font-bold text-[var(--text-muted)]">K</span>
        </div>
      </MotionWrapper>

      {/* Right: Actions & User */}
      <MotionWrapper variant="fade" delay={0.2} className="flex items-center gap-4 md:gap-6 ml-auto">
        {/* Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-[var(--text-muted)] tracking-widest uppercase cursor-default">
          <Globe size={12} className="text-emerald-500 animate-pulse" />
          System: Online
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Placeholder */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[var(--text-muted)] hover:text-white transition-colors">
            <Moon size={20} />
          </motion.button>
          
          {/* Notification */}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[var(--text-muted)] hover:text-white transition-colors group">
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--accent)] rounded-full shadow-[0_0_10px_var(--accent)] animate-pulse"></span>
          </motion.button>
          
          <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block"></div>

          {/* User Profile Area */}
          <Link to={profilePath} className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            <div className="text-right hidden sm:block space-y-0.5">
              <p className="text-sm font-bold text-white tracking-tight leading-none group-hover:text-[var(--accent)] transition-colors">
                {user?.full_name || 'Loading...'}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-black leading-none">
                {isRecruiter ? 'Recruiter' : 'Candidate'}
              </p>
            </div>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-xl overflow-hidden group-hover:border-[var(--accent)]/40 transition-all">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-black">{getInitials(user?.full_name)}</span>
                )}
              </div>
              {/* Online indicator dot */}
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[var(--background)]"></div>
            </div>
          </Link>

          {/* Logout */}
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="hidden sm:flex ml-2 p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500 hover:bg-rose-500/10 transition-all"
            title="Sign Out"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </MotionWrapper>
    </nav>
  );
});

Navbar.displayName = 'Navbar';
export default Navbar;
