import { User, Mail, Briefcase, MapPin, Camera, Calendar, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { memo } from 'react';

const StatCard = memo(({ label, value, unit, colorClass = "text-white" }) => (
  <div className="glass-panel p-8 rounded-[32px] border border-white/5 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent blur-2xl group-hover:opacity-100 opacity-0 transition-opacity`}></div>
    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">{label}</h4>
    <div className={`text-4xl font-black ${colorClass}`}>
      {value}<span className="text-xs text-gray-600 ml-2 font-medium">{unit}</span>
    </div>
  </div>
));

export default function Profile() {
  const { user, isRecruiter } = useAuth();

  if (!user) return null;

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* PROFILE CARD */}
        <div className="w-full lg:w-96 glass-panel p-8 rounded-[40px] border border-white/5 flex flex-col items-center text-center relative overflow-hidden group premium-glow">
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#00f3ff]/10 to-transparent"></div>
          
          <div className="relative mt-8">
            <div className="w-40 h-40 rounded-[48px] bg-white/[0.03] border-2 border-white/10 flex items-center justify-center relative group-hover:border-[#00f3ff]/50 transition-all duration-500 overflow-hidden shadow-2xl">
              {user.avatar ? (
                <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-black text-gray-700 group-hover:text-[#00f3ff] transition-colors">{getInitials(user.full_name)}</span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer">
                <Camera size={32} className="text-white mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">Update Core</span>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl bg-[#00f3ff] flex items-center justify-center shadow-[0_0_25px_rgba(0,243,255,0.4)] border-4 border-[#0a0a0f]">
              <ShieldCheck size={24} className="text-[#0a0a0f]" />
            </div>
          </div>
          
          <div className="mt-10 space-y-2">
            <h3 className="text-3xl font-black text-white tracking-tight">{user.full_name}</h3>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10">
              <div className={`w-2 h-2 rounded-full ${isRecruiter ? 'bg-[#00f3ff]' : 'bg-purple-500'} animate-pulse`}></div>
              <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">
                {isRecruiter ? 'Strategic Recruiter' : 'Intelligence Candidate'}
              </p>
            </div>
          </div>

          <div className="w-full mt-10 space-y-5 pt-10 border-t border-white/5">
            <div className="flex items-center gap-4 text-gray-500 hover:text-white transition-colors group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/5 group-hover:border-[#00f3ff]/30 transition-colors">
                <Mail size={18} />
              </div>
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-600">Protocol</span>
                <span className="text-sm font-medium">{user.email}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-gray-500 hover:text-white transition-colors group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/5 group-hover:border-[#00f3ff]/30 transition-colors">
                <Calendar size={18} />
              </div>
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-600">Established</span>
                <span className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-500 hover:text-white transition-colors group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/5 group-hover:border-[#00f3ff]/30 transition-colors">
                <Zap size={18} />
              </div>
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-600">Identifier</span>
                <span className="text-sm font-medium font-mono text-[#00f3ff]">RESUME-ID-{user.id.toString().padStart(4, '0')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="flex-1 space-y-10 w-full">
          <div className="glass-panel p-10 rounded-[40px] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/[0.01] to-transparent"></div>
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <Briefcase size={24} className="text-[#8b5cf6]" /> Professional Matrix
            </h3>
            <p className="text-gray-400 leading-relaxed text-lg italic max-w-3xl">
              "System credentials verified. You are currently operating as a <span className="text-[#00f3ff]">{isRecruiter ? 'Recruiter' : 'Candidate'}</span> in the ResumeAI talent intelligence network. Your activity is being monitored for performance optimization."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <StatCard 
              label={isRecruiter ? "Hiring Velocity" : "Match Potential"} 
              value={isRecruiter ? "4.2" : "94.8"} 
              unit={isRecruiter ? "days / hire" : "score"} 
             />
             <StatCard 
              label={isRecruiter ? "Accuracy Rating" : "Market Value"} 
              value={isRecruiter ? "98.5" : "$142k"} 
              unit={isRecruiter ? "matching" : "avg base"} 
              colorClass="text-[#00f3ff]"
             />
          </div>

          <div className="glass-panel p-10 rounded-[40px] border border-white/5">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <MapPin size={20} className="text-[#00f3ff]" /> System Access Points
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {['Global Edge', 'Direct Link', 'AI Node-7'].map((node, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#00f3ff]/20 transition-all text-center group cursor-pointer">
                  <div className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-1 group-hover:text-[#00f3ff] transition-colors">{node}</div>
                  <div className="text-[10px] text-gray-700 font-mono">STATUS: OPTIMAL</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
