import { User, Mail, Briefcase, MapPin, Camera, Calendar, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { memo } from 'react';
import GlassCard from '../components/ui/GlassCard';
import MotionWrapper from '../components/ui/MotionWrapper';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const StatCard = memo(({ label, value, unit, isNumber = false, colorClass = "text-white" }) => (
  <GlassCard hover className="p-8 group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent blur-2xl group-hover:opacity-100 opacity-0 transition-opacity`}></div>
    <h4 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">{label}</h4>
    <div className={`text-4xl font-black ${colorClass}`}>
      {isNumber ? <AnimatedCounter value={Number(value)} /> : value}
      <span className="text-xs text-[var(--text-muted)] ml-2 font-medium">{unit}</span>
    </div>
  </GlassCard>
));

export default function Profile() {
  const { user, isRecruiter } = useAuth();

  if (!user) return null;

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  return (
    <MotionWrapper variant="page" className="p-4 md:p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* PROFILE CARD */}
        <GlassCard glow className="w-full lg:w-96 p-8 flex flex-col items-center text-center">
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[var(--primary)]/10 to-transparent pointer-events-none"></div>
          
          <div className="relative mt-8">
            <div className="w-40 h-40 rounded-[48px] bg-[var(--surface-elevated)] border-2 border-[var(--border)] flex items-center justify-center relative group hover:border-[var(--accent)]/50 transition-all duration-500 overflow-hidden shadow-2xl">
              {user.avatar ? (
                <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-black text-gray-400 group-hover:text-[var(--accent)] transition-colors">{getInitials(user.full_name)}</span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer">
                <Camera size={32} className="text-white mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">Update Core</span>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-[0_0_25px_var(--primary)] border-4 border-[var(--background)]">
              <ShieldCheck size={24} className="text-white" />
            </div>
          </div>
          
          <div className="mt-10 space-y-2 relative z-10">
            <h3 className="text-3xl font-black text-white tracking-tight">{user.full_name}</h3>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-[var(--border)]">
              <div className={`w-2 h-2 rounded-full ${isRecruiter ? 'bg-[var(--primary)]' : 'bg-purple-500'} animate-pulse`}></div>
              <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">
                {isRecruiter ? 'Strategic Recruiter' : 'Intelligence Candidate'}
              </p>
            </div>
          </div>

          <div className="w-full mt-10 space-y-5 pt-10 border-t border-[var(--border)] relative z-10">
            <div className="flex items-center gap-4 text-[var(--text-muted)] hover:text-white transition-colors group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-colors shrink-0">
                <Mail size={18} />
              </div>
              <div className="text-left overflow-hidden">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-600">Protocol</span>
                <span className="text-sm font-medium truncate block">{user.email}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-[var(--text-muted)] hover:text-white transition-colors group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-colors shrink-0">
                <Calendar size={18} />
              </div>
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-600">Established</span>
                <span className="text-sm font-medium">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[var(--text-muted)] hover:text-white transition-colors group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] flex items-center justify-center border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-colors shrink-0">
                <Zap size={18} />
              </div>
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-600">Identifier</span>
                <span className="text-sm font-medium font-mono text-[var(--accent)]">ID-{user.id?.toString().padStart(4, '0') || '0000'}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* DETAILS SECTION */}
        <MotionWrapper variant="slideUp" delay={0.2} className="flex-1 space-y-10 w-full">
          <GlassCard className="p-10 relative">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/[0.01] to-transparent pointer-events-none"></div>
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
              <Briefcase size={24} className="text-[#8b5cf6]" /> Professional Matrix
            </h3>
            <p className="text-gray-400 leading-relaxed text-lg italic max-w-3xl relative z-10">
              "System credentials verified. You are currently operating as a <span className="text-[var(--primary)]">{isRecruiter ? 'Recruiter' : 'Candidate'}</span> in the ResumeAI talent intelligence network. Your activity is being monitored for performance optimization."
            </p>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <StatCard 
              label={isRecruiter ? "Hiring Velocity" : "Match Potential"} 
              value={isRecruiter ? "4.2" : "94"} 
              unit={isRecruiter ? "days / hire" : "% max score"} 
              isNumber={true}
             />
             <StatCard 
              label={isRecruiter ? "Candidate Reach" : "Market Value"} 
              value={isRecruiter ? "12k" : "142"} 
              unit={isRecruiter ? "views" : "k avg base"} 
              isNumber={isRecruiter ? false : true}
              colorClass="text-[var(--accent)]"
             />
          </div>

          <GlassCard className="p-10">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <MapPin size={20} className="text-[var(--primary)]" /> System Access Points
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {['Global Edge', 'Direct Link', 'AI Node-7'].map((node, i) => (
                <div key={i} className="p-5 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all text-center group cursor-pointer">
                  <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1 group-hover:text-[var(--primary)] transition-colors">{node}</div>
                  <div className="text-[10px] text-emerald-500/70 font-mono">STATUS: OPTIMAL</div>
                </div>
              ))}
            </div>
          </GlassCard>
        </MotionWrapper>
      </div>
    </MotionWrapper>
  );
}
