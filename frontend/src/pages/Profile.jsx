import { Mail, Briefcase, Calendar, ShieldCheck, Zap, FileText, Download, RefreshCw, BarChart, Building2, Layers, Target, UserCog, Sparkles, Cpu, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { memo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { activityService } from '../services/activityService';
import { recruiterService } from '../services/recruiterService';
import GlassCard from '../components/ui/GlassCard';
import MotionWrapper from '../components/ui/MotionWrapper';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import RecruiterOnboarding from '../components/recruiter/RecruiterOnboarding';

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

/**
 * Real recruiter metrics pulled from `/recruiter/metrics`.
 *
 * These replace the previous hardcoded "4.2 days / hire" and "12k views"
 * figures — a new account legitimately shows zero.
 */
function RecruiterStatCards() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    let cancelled = false;
    recruiterService
      .getMetrics()
      .then((data) => {
        if (!cancelled) setMetrics(data);
      })
      .catch(() => {
        if (!cancelled) setMetrics(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <EmptyState icon={BarChart} title="Metrics unavailable" description="Recruiter metrics could not be loaded." />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <StatCard
        label="Time-to-Hire"
        value={metrics.time_to_hire_days ?? 0}
        unit="days / hire"
        isNumber
      />
      <StatCard
        label="Resumes Analyzed"
        value={metrics.resumes_analyzed ?? 0}
        unit="in the pool"
        isNumber
        colorClass="text-(--accent)"
      />
    </div>
  );
}

/** Recruiter hiring profile, driven entirely by the backend profile row. */
function RecruiterProfileCard({ profile }) {
  const rows = [
    { icon: Building2, label: 'Company', value: profile?.company_name },
    { icon: UserCog, label: 'Recruiter Role', value: profile?.designation },
    { icon: Layers, label: 'Hiring Domain', value: profile?.industry },
    { icon: Target, label: 'Experience Level', value: profile?.experience_level },
    { icon: Briefcase, label: 'Open Positions', value: profile?.company_name ? 'See dashboard metrics' : null },
    { icon: Sparkles, label: 'Tech Stack You Hire For', value: profile?.tech_stack?.join(', ') },
    { icon: Target, label: 'Hiring Focus', value: profile?.hiring_goals },
    { icon: FileText, label: 'Profile Source', value: profile?.source_filename || (profile?.onboarding_completed ? 'Manual entry' : null) },
  ];

  return (
    <GlassCard className="p-10">
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <Briefcase size={20} className="text-[#8b5cf6]" /> Recruiter Intelligence Profile
        </h3>
        {profile?.onboarding_completed ? (
          <Badge variant="success">Onboarded</Badge>
        ) : (
          <Badge variant="warning">Incomplete</Badge>
        )}
      </div>

      {profile?.bio_summary && (
        <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-(--primary)/40 pl-4 mb-8">
          {profile.bio_summary}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {rows.map((item) => (
          <div
            key={item.label}
            className="p-5 rounded-2xl bg-(--surface-elevated) border border-(--border) hover:bg-white/2 hover:border-white/10 transition-colors"
          >
            <div className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <item.icon size={11} /> {item.label}
            </div>
            {/* An unfilled field reads "Not set" rather than inventing a value. */}
            <div className="text-sm font-bold text-white truncate">{item.value || 'Not set'}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default function Profile() {
  const { user, isRecruiter } = useAuth();
  const [resumes, setResumes] = useState(() => activityService.getResumeHistory());
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const unsubResumes = activityService.subscribeToResumes((newResume, all) => setResumes(all));
    return () => {
      unsubResumes();
    };
  }, []);

  useEffect(() => {
    if (!isRecruiter) return undefined;
    let cancelled = false;
    recruiterService
      .getProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isRecruiter]);

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
                <span className="text-5xl font-black text-gray-400 group-hover:text-(--accent) transition-colors">
                  {getInitials(user.full_name)}
                </span>
              )}
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
                {profile?.designation || (isRecruiter ? 'Recruiter' : 'Candidate')}
              </p>
            </div>
            {profile?.company_name && (
              <p className="text-xs text-(--text-muted)">{profile.company_name}</p>
            )}
          </div>

          <div className="w-full mt-10 space-y-5 pt-10 border-t border-(--border) relative z-10">
            <div className="flex items-center gap-4 text-(--text-muted) group">
              <div className="w-10 h-10 rounded-xl bg-(--surface-elevated) flex items-center justify-center border border-(--border) group-hover:border-(--accent)/30 transition-colors shrink-0">
                <Mail size={18} />
              </div>
              <div className="text-left overflow-hidden">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-600">Email</span>
                <span className="text-sm font-medium truncate block">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-(--text-muted) group">
              <div className="w-10 h-10 rounded-xl bg-(--surface-elevated) flex items-center justify-center border border-(--border) group-hover:border-(--accent)/30 transition-colors shrink-0">
                <Calendar size={18} />
              </div>
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-600">Member Since</span>
                <span className="text-sm font-medium">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'Recently'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-(--text-muted) group">
              <div className="w-10 h-10 rounded-xl bg-(--surface-elevated) flex items-center justify-center border border-(--border) group-hover:border-(--accent)/30 transition-colors shrink-0">
                <Zap size={18} />
              </div>
              <div className="text-left">
                <span className="block text-[10px] uppercase tracking-widest font-bold text-gray-600">Identifier</span>
                <span className="text-sm font-medium font-mono text-(--accent)">
                  ID-{user.id?.toString().padStart(4, '0') || '0000'}
                </span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* DETAILS SECTION */}
        <MotionWrapper variant="slideUp" delay={0.2} className="flex-1 space-y-10 w-full">
          {isRecruiter ? (
            <>
              <RecruiterStatCards />
              <RecruiterProfileCard profile={profile} />
              {/* Option A manual form + Option B AI bio parse, always available
                  so the recruiter can re-verify or update at any time. */}
              <RecruiterOnboarding profile={profile} onProfileSaved={setProfile} embedded />
            </>
          ) : (
            <>
              {/* Candidate Metadata Grid */}
              <GlassCard className="p-10">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <BarChart size={20} className="text-[#8b5cf6]" /> Career Intelligence
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { icon: Target, label: 'Match Potential', value: 'See dashboard' },
                    { icon: Building2, label: 'Preferred Location', value: 'From your resume' },
                    { icon: Zap, label: 'Availability', value: 'From your resume' },
                    { icon: Calendar, label: 'Notice Period', value: 'From your resume' },
                  ].map((item) => (
                    <div key={item.label} className="p-5 rounded-2xl bg-(--surface-elevated) border border-(--border) hover:bg-white/2 hover:border-white/10 transition-colors">
                      <div className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <item.icon size={11} /> {item.label}
                      </div>
                      <div className="text-sm font-bold text-white truncate">{item.value}</div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/candidate"
                  className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-xl bg-(--primary)/10 border border-(--primary)/20 text-(--primary) text-xs font-bold hover:bg-(--primary)/20 transition-colors"
                >
                  View your live AI analysis <RefreshCw size={12} />
                </Link>
              </GlassCard>

              {/* Resume History */}
              <GlassCard className="p-10 overflow-hidden">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <FileText size={20} className="text-(--accent)" /> ATS Resume History
                </h3>
                {resumes.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No resumes yet"
                    description="Upload a resume to generate your first AI analysis."
                  />
                ) : (
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
                          <tr
                            key={i}
                            className="border-b border-(--border) hover:bg-white/2 transition-colors cursor-pointer"
                            onClick={() => { window.location.href = '/candidate'; }}
                          >
                            <td className="py-4 font-medium text-white flex flex-col gap-1">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-(--primary)/10 text-(--primary) flex items-center justify-center border border-(--primary)/20 shrink-0">
                                  <FileText size={14} />
                                </div>
                                <span>{resume.filename}</span>
                              </div>
                              <span className="text-[10px] text-gray-400 pl-11">{resume.matchedRole}</span>
                            </td>
                            <td className="py-4 text-gray-400">{new Date(resume.timestamp).toLocaleDateString()}</td>
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
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCard>
            </>
          )}

          {/* Internal telemetry lives on its own route; it is deliberately kept
              out of both the candidate and recruiter profile surfaces. */}
          {isRecruiter && (
            <Link
              to="/admin/system"
              className="flex items-center justify-between gap-3 p-5 rounded-2xl bg-(--surface-elevated) border border-(--border) hover:border-(--primary)/30 transition-colors"
            >
              <span className="flex items-center gap-3 text-sm font-bold text-gray-300">
                <Cpu size={16} className="text-(--primary)" />
                System Operations
                <span className="text-[10px] font-normal text-(--text-muted)">
                  DB, Redis, queue and AI node health — internal tooling
                </span>
              </span>
              <Activity size={16} className="text-(--text-muted)" />
            </Link>
          )}
        </MotionWrapper>
      </div>
    </MotionWrapper>
  );
}
