import { User, Mail, Briefcase, MapPin, Camera, Calendar, ShieldCheck, Zap, FileText, Download, RefreshCw, BarChart } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { memo, useState, useEffect } from 'react';
import { activityService } from '../services/activityService';
import GlassCard from '../components/ui/GlassCard';
import MotionWrapper from '../components/ui/MotionWrapper';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const StatCard = memo(({ label, value, unit, isNumber = false, colorClass = "text-white" }) => (
  <GlassCard hover className="p-8 group relative overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-white/5 to-transparent blur-2xl group-hover:opacity-100 opacity-0 transition-opacity`}></div>
    <h4 className="text-sm font-bold text-(--text-muted) uppercase tracking-widest mb-6">{label}</h4>
    <div className={`text-4xl font-black ${colorClass}`}>
      {isNumber ? <AnimatedCounter value={Number(value)} /> : value}
      <span className="text-xs text-(--text-muted) ml-2 font-medium">{unit}</span>
    </div>
  </GlassCard>
));

export default function Profile() {
  const { user, isRecruiter } = useAuth();
  const [resumes, setResumes] = useState(() => activityService.getResumeHistory());

  useEffect(() => {
    const unsubResumes = activityService.subscribeToResumes((newResume, all) => setResumes(all));
    return () => {
      unsubResumes();
    };
  }, []);

  if (!user) return null;

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
  };

  return (
    <MotionWrapper variant="page" className="p-4 md:p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* PROFILE CARD */}
        <GlassCard glow className="w-full lg:w-96 p-8 flex flex-col items-center text-center">
          <div className="absolute top-0 left-0 w-full h-40 bg-linear-to-b from-(--primary)/10 to-transparent pointer-events-none"></div>
          
          <div className="relative mt-8">
            <div className="w-40 h-40 rounded-[48px] bg-(--surface-elevated) border-2 border-(--border) flex items-center justify-center relative group hover:border-(--accent)/50 transition-all duration-500 overflow-hidden shadow-2xl">
              {user.avatar ? (
                <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl font-black text-gray-400 group-hover:text-(--accent) transition-colors">{getInitials(user.full_name)}</span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer">
                <Camera size={32} className="text-white mb-2" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">Update Core</span>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl bg-(--primary) flex items-center justify-center shadow-[0_0_25px_var(--primary)] border-4 border-(--background)">
              <ShieldCheck size={24} className="text-white" />
            </div>
          </div>
          
          <div className="mt-10 space-y-2 relative z-10">
            <h3 className="text-3xl font-black text-white tracking-tight">{user.full_name}</h3>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/3 border border-(--border)">
              <div className={`w-2 h-2 rounded-full ${isRecruiter ? 'bg-(--primary)' : 'bg-purple-500'} animate-pulse`}></div>
              <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">
                {isRecruiter ? 'Strategic Recruiter' : 'Intelligence Candidate'}
              </p>
            </div>
          </div>

          <div className="w-full mt-10 space-y-5 pt-10 border-t border-(--border) relative z-10">
            <div className="flex items-center gap-4 text-(--text-muted) hover:text-white transition-colors group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-(--surface-elevated) flex items-center justify-center border border-(--border) group-hover:border-(--accent)/30 transition-colors shrink-0">
                <Mail size={18} />
              </div>
              <div className="text-left overflow-hidden">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-600">Protocol</span>
                <span className="text-sm font-medium truncate block">{user.email}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-(--text-muted) hover:text-white transition-colors group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-(--surface-elevated) flex items-center justify-center border border-(--border) group-hover:border-(--accent)/30 transition-colors shrink-0">
                <Calendar size={18} />
              </div>
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-600">Established</span>
                <span className="text-sm font-medium">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-(--text-muted) hover:text-white transition-colors group cursor-default">
              <div className="w-10 h-10 rounded-xl bg-(--surface-elevated) flex items-center justify-center border border-(--border) group-hover:border-(--accent)/30 transition-colors shrink-0">
                <Zap size={18} />
              </div>
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-600">Identifier</span>
                <span className="text-sm font-medium font-mono text-(--accent)">ID-{user.id?.toString().padStart(4, '0') || '0000'}</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* DETAILS SECTION */}
        <MotionWrapper variant="slideUp" delay={0.2} className="flex-1 space-y-10 w-full">
          <GlassCard className="p-10 relative">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-white/1 to-transparent pointer-events-none"></div>
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
              <Briefcase size={24} className="text-[#8b5cf6]" /> Professional Matrix
            </h3>
            <p className="text-gray-400 leading-relaxed text-lg italic max-w-3xl relative z-10">
              "System credentials verified. You are currently operating as a <span className="text-(--primary)">{isRecruiter ? 'Recruiter' : 'Candidate'}</span> in the ResumeAI talent intelligence network. Your activity is being monitored for performance optimization."
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
              colorClass="text-(--accent)"
             />
          </div>

          {isRecruiter ? (
            <GlassCard className="p-10">
              <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                <Briefcase size={20} className="text-[#8b5cf6]" /> Recruiter Intelligence Profile
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {[
                  { label: 'Company', value: 'Acme AI Systems' },
                  { label: 'Recruiter Role', value: 'Senior Talent Partner' },
                  { label: 'Hiring Region', value: 'Global Remote' },
                  { label: 'Open Positions', value: '14 Active Roles' },
                  { label: 'Team Size', value: '250+ Engineers' },
                  { label: 'Hiring Focus', value: 'AI / Machine Learning' },
                  { label: 'Preferred Skills', value: 'Python, React, GCP' },
                  { label: 'Hiring Performance', value: 'Top 5% Global' },
                  { label: 'AI Usage Stats', value: '1.2k Resumes Scanned' },
                  { label: 'Recent Activity', value: 'Matched 3 Candidates Today' }
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-(--surface-elevated) border border-(--border) hover:bg-white/2 hover:border-white/10 transition-colors cursor-default">
                    <div className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mb-2">{item.label}</div>
                    <div className="text-sm font-bold text-white truncate">{item.value}</div>
                  </div>
                ))}
              </div>
            </GlassCard>
          ) : (
            <>
              {/* Candidate Metadata Grid */}
              <GlassCard className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <BarChart size={20} className="text-[#8b5cf6]" /> Career Intelligence
                  </h3>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    Profile 92% Complete
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Expected Salary', value: '$120k - $145k' },
                    { label: 'Preferred Location', value: 'San Francisco, CA' },
                    { label: 'Availability', value: 'Immediate' },
                    { label: 'Notice Period', value: '2 Weeks' },
                  ].map((item, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-(--surface-elevated) border border-(--border) hover:bg-white/2 hover:border-white/10 transition-colors cursor-default">
                      <div className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mb-2">{item.label}</div>
                      <div className="text-sm font-bold text-white truncate">{item.value}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Resume History */}
              <GlassCard className="p-10 overflow-hidden">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <FileText size={20} className="text-(--accent)" /> ATS Resume History
                </h3>
                <div className="overflow-x-auto custom-scrollbar -mx-10 px-10">
                  <table className="w-full text-left border-collapse min-w-175">
                    <thead>
                      <tr className="border-b border-(--border)">
                        <th className="py-4 text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">Resume Version</th>
                        <th className="py-4 text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">Date Uploaded</th>
                        <th className="py-4 text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">ATS Match</th>
                        <th className="py-4 text-[10px] font-bold text-(--text-muted) uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {resumes.slice(0, 5).map((resume, i) => (
                         <tr key={i} className="border-b border-(--border) hover:bg-white/2 transition-colors cursor-pointer" onClick={() => window.location.href = '/candidate'}>
                           <td className="py-4 font-medium text-white flex flex-col gap-1">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-(--primary)/10 text-(--primary) flex items-center justify-center border border-(--primary)/20 shrink-0">
                                 <FileText size={14} />
                               </div>
                               <span>{resume.filename}</span>
                             </div>
                             <span className="text-[10px] text-gray-400 pl-11">{resume.matchedRole}</span>
                           </td>
                           <td className="py-4 text-gray-400">
                             {new Date(resume.timestamp).toLocaleDateString()}
                           </td>
                           <td className="py-4">
                             <div className="flex flex-col gap-1">
                               <span className={`w-fit px-3 py-1 rounded-full text-xs font-bold ${resume.atsScore >= 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                 ATS {resume.atsScore}%
                               </span>
                               <span className="text-[10px] text-gray-500 font-medium">AI Match: {resume.aiScore}%</span>
                             </div>
                           </td>
                           <td className="py-4 text-right">
                             <div className="flex justify-end items-center gap-2">
                               <span className="text-xs text-(--text-muted) mr-4">{resume.duration}</span>
                               <button className="w-8 h-8 rounded-full bg-(--surface-elevated) border border-(--border) flex items-center justify-center text-gray-400 hover:text-white hover:border-(--primary)/50 transition-all" title="Download">
                                 <Download size={14} />
                               </button>
                               <button className="w-8 h-8 rounded-full bg-(--surface-elevated) border border-(--border) flex items-center justify-center text-gray-400 hover:text-white hover:border-(--primary)/50 transition-all" title="View Details">
                                 <RefreshCw size={14} />
                               </button>
                             </div>
                           </td>
                         </tr>
                      ))}
                      {/* Fallback Mock History */}
                      {resumes.length === 0 && (
                        <tr className="border-b border-(--border) hover:bg-white/2 transition-colors">
                           <td className="py-4 font-medium text-white flex flex-col gap-1">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-(--primary)/10 text-(--primary) flex items-center justify-center border border-(--primary)/20 shrink-0">
                                 <FileText size={14} />
                               </div>
                               <span>Resume_v1_Final.pdf</span>
                             </div>
                             <span className="text-[10px] text-gray-400 pl-11">Software Engineer</span>
                           </td>
                          <td className="py-4 text-gray-400">Oct 12, 2023</td>
                          <td className="py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              ATS 87%
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <span className="text-xs text-(--text-muted) mr-4">1.5s</span>
                              <button className="w-8 h-8 rounded-full bg-(--surface-elevated) border border-(--border) flex items-center justify-center text-gray-400 hover:text-white hover:border-(--primary)/50 transition-all">
                                <Download size={14} />
                              </button>
                              <button className="w-8 h-8 rounded-full bg-(--surface-elevated) border border-(--border) flex items-center justify-center text-gray-400 hover:text-white hover:border-(--primary)/50 transition-all">
                                <RefreshCw size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </>
          )}

          <GlassCard className="p-10">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
              <MapPin size={20} className="text-(--primary)" /> System Access Points
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {['Global Edge', 'Direct Link', 'AI Node-7'].map((node, i) => (
                <div key={i} className="p-5 rounded-2xl bg-(--surface-elevated) border border-(--border) hover:border-(--primary)/30 transition-all text-center group cursor-pointer">
                  <div className="text-xs font-bold text-(--text-muted) uppercase tracking-widest mb-1 group-hover:text-(--primary) transition-colors">{node}</div>
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
