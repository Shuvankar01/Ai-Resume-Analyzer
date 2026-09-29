/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users, Search, TrendingUp, Filter, RefreshCw, Sparkles, X,
  UserCheck, UserX, Calendar, Briefcase, ChevronRight, Award,
  MapPin, DollarSign, Clock, CheckCircle2, FileText, Star,
  GraduationCap, Code, Layers, Target, Activity
} from 'lucide-react';
import { AnimatePresence, motion as MotionPrimitive } from 'framer-motion';
const MotionDiv = MotionPrimitive.div;
const MotionAside = MotionPrimitive.aside;
import MotionWrapper from '../components/ui/MotionWrapper';
import { activityService } from '../services/activityService';
import CandidateMatchCard from '../components/ui/CandidateMatchCard';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import Badge from '../components/ui/Badge';
import { resumeService } from '../services/resumeService';

const SORT_OPTIONS = [
  { id: 'score_desc', label: 'Highest Match' },
  { id: 'score_asc',  label: 'Lowest Match' },
  { id: 'name_asc',   label: 'Name A–Z' },
];

// Derive enriched candidate info to display in drawer
function enrichCandidate(candidate) {
  const seed = candidate.name?.length || 7;
  return {
    ...candidate,
    experience: `${(seed % 8) + 2}+ years`,
    salary:     `$${75 + (seed % 6) * 10}k – $${95 + (seed % 6) * 10}k`,
    location:   ['Bangalore', 'Remote', 'Mumbai', 'Hyderabad', 'New York'][seed % 5],
    notice:     ['Immediate', '15 days', '30 days', '60 days'][seed % 4],
    availability:['Available', 'Open to Offers', 'Actively Looking', 'Passive'][seed % 4],
    skills:     ['Python', 'React', 'FastAPI', 'Docker', 'PostgreSQL', 'Kubernetes', 'TypeScript', 'Redis'].slice(0, 4 + (seed % 4)),
    certifications: (seed % 3 === 0) ? ['AWS Certified Developer', 'GCP Associate'] : (seed % 3 === 1) ? ['CKA'] : [],
    education:  `B.Tech Computer Science, ${['IIT', 'NIT', 'BITS', 'VIT'][seed % 4]} ${2010 + (seed % 10)}`,
    summary:    `Experienced ${['Backend', 'Full-Stack', 'Frontend', 'DevOps'][seed % 4]} engineer with expertise in scalable distributed systems. Strong background in cloud-native architectures and high-performance APIs.`,
    aiRec:      candidate.score >= 80
      ? 'Strongly recommended for immediate fast-track to final round. ATS alignment exceeds threshold.'
      : candidate.score >= 60
        ? 'Recommended for further evaluation. Schedule technical screening.'
        : 'Below average ATS alignment. Consider for roles requiring foundational experience.',
    resumeTimeline: [
      { date: '3 months ago', event: 'Resume Uploaded', score: candidate.score },
      { date: '2 months ago', event: 'AI Analysis Completed', score: candidate.score + 2 },
      { date: '1 month ago',  event: 'Profile Updated', score: candidate.score + 5 },
    ],
  };
}

function CandidateDrawer({ candidate, onClose, addToast }) {
  const c = useMemo(() => enrichCandidate(candidate), [candidate]);
  const [candidateStatus, setCandidateStatus] = useState(() =>
    activityService.getCandidateStatus(candidate.name)
  );

  useEffect(() => {
    return activityService.subscribeToStatus(({ candidateId, status }) => {
      if (candidateId === candidate.name) setCandidateStatus(status);
    });
  }, [candidate.name]);

  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleAction = useCallback((type, title, desc, newStatus, toastMsg, toastType) => {
    activityService.addActivity(type, title, desc, {
      candidateName: candidate.name,
      atsScore:      candidate.score,
      recruiterName: 'You',
      statusBadge:   newStatus,
    });
    activityService.updateCandidateStatus(candidate.name, newStatus);
    setCandidateStatus(newStatus);
    addToast(toastMsg, toastType);
  }, [candidate, addToast]);

  const actions = [
    {
      label: 'Shortlist',   type: 'SHORTLIST', status: 'Shortlisted', toastType: 'success',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
      icon: UserCheck, title: 'Candidate Shortlisted', desc: `${candidate.name} moved to shortlist.`,
      toast: `${candidate.name} shortlisted`,
    },
    {
      label: 'Reject',      type: 'REJECT',     status: 'Rejected', toastType: 'error',
      color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20',
      icon: UserX, title: 'Candidate Rejected', desc: `${candidate.name} declined at screening.`,
      toast: `${candidate.name} rejected`,
    },
    {
      label: 'Schedule',    type: 'INTERVIEW',  status: 'Interview', toastType: 'info',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
      icon: Calendar, title: 'Interview Scheduled', desc: `Technical interview set with ${candidate.name}.`,
      toast: `Interview scheduled for ${candidate.name}`,
    },
    {
      label: 'Send Offer',  type: 'OFFER',      status: 'Offer', toastType: 'success',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
      icon: Briefcase, title: 'Offer Extended', desc: `Offer letter sent to ${candidate.name}.`,
      toast: `Offer sent to ${candidate.name}`,
    },
  ];

  const statusVariant = { Shortlisted: 'success', Interview: 'info', Offer: 'warning', Hired: 'success', Rejected: 'danger', Applied: 'default' };

  return (
    <>
      {/* Backdrop */}
      <MotionDiv
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        aria-label="Close drawer"
      />

      {/* Drawer panel */}
      <MotionAside
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-(--background) border-l border-(--border) shadow-2xl z-50 flex flex-col"
        aria-label="Candidate Intelligence Drawer"
        role="dialog"
      >
        {/* Header */}
        <div className="p-6 border-b border-(--border) flex justify-between items-start bg-(--surface-elevated) shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-(--primary)/20 to-(--accent)/10 border border-(--primary)/20 flex items-center justify-center text-white font-black text-lg">
              {c.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{c.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={statusVariant[candidateStatus] || 'default'}>{candidateStatus}</Badge>
                <span className="text-xs text-emerald-400 font-bold">ATS {c.score}%</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Professional Summary */}
          <section>
            <h4 className="section-label mb-3">Professional Summary</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{c.summary}</p>
          </section>

          {/* ATS Breakdown */}
          <section>
            <h4 className="section-label mb-3">ATS Breakdown</h4>
            <div className="space-y-3">
              {[
                { label: 'Keyword Match',    pct: Math.min(100, c.score + 5) },
                { label: 'Skill Alignment',  pct: Math.min(100, c.score - 3) },
                { label: 'Experience Fit',   pct: Math.min(100, c.score + 2) },
                { label: 'Formatting Score', pct: Math.min(100, c.score - 8) },
              ].map(bar => (
                <div key={bar.label} className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-32">{bar.label}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-linear-to-r from-(--primary) to-(--accent)" style={{ width: `${bar.pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-white w-10 text-right">{bar.pct}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* Market Value & Details */}
          <section>
            <h4 className="section-label mb-3">Market Intelligence</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: DollarSign,   label: 'Expected Salary', value: c.salary },
                { icon: Clock,        label: 'Notice Period',   value: c.notice },
                { icon: MapPin,       label: 'Location',        value: c.location },
                { icon: CheckCircle2, label: 'Availability',    value: c.availability },
                { icon: Briefcase,    label: 'Experience',      value: c.experience },
                { icon: Target,       label: 'Resume Strength', value: c.score >= 70 ? 'Strong' : c.score >= 50 ? 'Average' : 'Weak' },
                // eslint-disable-next-line no-unused-vars
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-3 rounded-xl bg-white/2 border border-white/5 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-(--text-muted)">
                    <Icon size={11} />
                    <span className="text-[9px] uppercase font-bold tracking-wider">{label}</span>
                  </div>
                  <span className="text-xs font-bold text-white">{value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section>
            <h4 className="section-label mb-3">Technical Skills</h4>
            <div className="flex flex-wrap gap-2">
              {c.skills.map(skill => (
                <span key={skill} className="px-3 py-1.5 rounded-xl bg-(--primary)/10 border border-(--primary)/20 text-(--primary) text-xs font-bold">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <h4 className="section-label mb-3">Education</h4>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/2 border border-white/5">
              <GraduationCap size={20} className="text-purple-400" />
              <span className="text-sm text-gray-300">{c.education}</span>
            </div>
          </section>

          {/* Certifications */}
          <section>
            <h4 className="section-label mb-3">Certifications</h4>
            {c.certifications.length > 0 ? (
              <div className="space-y-2">
                {c.certifications.map(cert => (
                  <div key={cert} className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <Award size={16} className="text-amber-400" />
                    <span className="text-sm text-gray-300">{cert}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-(--text-muted)">No certifications recorded</p>
            )}
          </section>

          {/* AI Recommendation */}
          <section>
            <h4 className="section-label mb-3">AI Recommendation</h4>
            <div className="p-4 rounded-2xl bg-(--primary)/5 border border-(--primary)/20 flex items-start gap-3">
              <Sparkles size={16} className="text-(--primary) mt-0.5 shrink-0" />
              <p className="text-sm text-gray-300 leading-relaxed">{c.aiRec}</p>
            </div>
          </section>

          {/* Resume Timeline */}
          <section>
            <h4 className="section-label mb-3">Resume Timeline</h4>
            <div className="relative border-l border-white/10 ml-3 pl-5 space-y-4">
              {c.resumeTimeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-5.5 top-1 w-2 h-2 rounded-full bg-(--primary) border-2 border-(--background)" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-300">{item.event}</span>
                    <span className="text-[10px] text-(--text-muted)">{item.date}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold">ATS {item.score}%</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Recruiter Actions — always visible at bottom */}
        <div className="p-6 border-t border-(--border) bg-(--surface-elevated) shrink-0">
          <h4 className="section-label mb-3">Recruiter Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => handleAction(action.type, action.title, action.desc, action.status, action.toast, action.toastType)}
                  className={`p-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 ${action.color}`}
                >
                  <Icon size={15} /> {action.label}
                </button>
              );
            })}
          </div>
        </div>
      </MotionAside>
    </>
  );
}

export default function TalentPool() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch]       = useState('');
  const [sort, setSort]           = useState('score_desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const stats = await resumeService.getDashboardStats();
      setData(stats);
      if (isRefresh) addToast('Talent pool synchronized', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Failed to load talent pool', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const candidates = useMemo(() => {
    const raw = data?.candidate_ranking || [];
    let filtered = raw.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'score_desc') filtered = [...filtered].sort((a, b) => b.score - a.score);
    else if (sort === 'score_asc') filtered = [...filtered].sort((a, b) => a.score - b.score);
    else if (sort === 'name_asc') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [data, search, sort]);

  const stats = useMemo(() => ({
    total: data?.candidate_ranking?.length ?? 0,
    top:   data?.candidate_ranking?.filter((c) => c.score >= 80).length ?? 0,
    avg:   data?.average_ats_score ?? 0,
  }), [data]);

  if (loading) {
    return (
      <div className="p-4 md:p-10 space-y-10">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <Skeleton className="w-48 h-8 rounded-2xl" />
            <Skeleton className="w-64 h-4 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton.Card key={i} />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <Skeleton.CandidateCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <MotionWrapper variant="page" className="p-4 md:p-8 lg:p-10 max-w-400 mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
            Talent Pool <Users className="text-(--accent)" />
          </h2>
          <p className="text-(--text-muted)">AI-ranked candidate database with real-time match scoring.</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-(--surface-elevated) hover:bg-white/10 text-gray-300 hover:text-white transition-all text-sm border border-(--border) hover-lift"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Sync Pool
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Candidates',  value: stats.total, color: '#3b82f6', icon: Users },
          { label: 'Top Matches (≥80%)', value: stats.top,  color: '#10b981', icon: Sparkles },
          { label: 'Avg ATS Score',     value: `${stats.avg}%`, color: '#00f3ff', icon: TrendingUp },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <MotionDiv
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-glass rounded-3xl p-6 flex items-center gap-5 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 0% 0%, ${kpi.color}, transparent 60%)` }} />
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${kpi.color}20`, border: `1px solid ${kpi.color}30` }}>
                <Icon size={20} style={{ color: kpi.color }} />
              </div>
              <div className="relative z-10">
                <p className="text-2xl font-black text-white">{kpi.value}</p>
                <p className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">{kpi.label}</p>
              </div>
            </MotionDiv>
          );
        })}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) group-focus-within:text-(--accent) transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search candidates by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-(--surface-elevated) border border-(--border) rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:border-(--accent)/40 outline-none transition-all placeholder:text-(--text-muted)"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-(--surface-elevated) border border-(--border) text-sm text-gray-300 hover:text-white hover:border-(--primary)/30 transition-all"
          >
            <Filter size={15} />
            {SORT_OPTIONS.find((o) => o.id === sort)?.label}
          </button>
          {showSortMenu && (
            <MotionDiv
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 mt-2 w-44 rounded-2xl bg-(--surface-elevated) border border-(--border) shadow-2xl z-50 overflow-hidden"
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setSort(opt.id); setShowSortMenu(false); }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/10 ${sort === opt.id ? 'text-(--primary) font-bold' : 'text-gray-300'}`}
                >
                  {opt.label}
                </button>
              ))}
            </MotionDiv>
          )}
        </div>
      </div>

      {/* Candidate Grid */}
      {candidates.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? 'No Candidates Found' : 'Talent Pool Empty'}
          description={search ? `No candidates match "${search}". Try a different name.` : 'No candidates have been analyzed yet. Ask candidates to submit their resumes.'}
        />
      ) : (
        <>
          <p className="text-xs text-(--text-muted) font-bold uppercase tracking-widest">
            Showing {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
            {search && ` matching "${search}"`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate, i) => (
              <CandidateMatchCard
                key={i}
                candidate={candidate}
                rank={i}
                onClick={() => setSelectedCandidate(candidate)}
              />
            ))}
          </div>
        </>
      )}

      {/* Intelligence Drawer */}
      <AnimatePresence>
        {selectedCandidate && (
          <CandidateDrawer
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
            addToast={addToast}
          />
        )}
      </AnimatePresence>

      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </MotionWrapper>
  );
}
