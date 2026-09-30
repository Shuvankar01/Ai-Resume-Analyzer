/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users, Search, TrendingUp, Filter, RefreshCw, X, Award,
  MapPin, DollarSign, Clock, CheckCircle2, Briefcase, Code2,
  Sparkles, AlertTriangle, FileText, Download, Loader2
} from 'lucide-react';
import { AnimatePresence, motion as MotionPrimitive } from 'framer-motion';
const MotionDiv = MotionPrimitive.div;
const MotionAside = MotionPrimitive.aside;
import MotionWrapper from '../components/ui/MotionWrapper';
import { activityService } from '../services/activityService';
import { recruiterService } from '../services/recruiterService';
import CandidateMatchCard from '../components/ui/CandidateMatchCard';
import CandidateActions from '../components/recruiter/CandidateActions';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import Badge from '../components/ui/Badge';
import { resumeService } from '../services/resumeService';
import { STATUS_VARIANTS } from '../hooks/useCandidateActions';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SORT_OPTIONS = [
  { id: 'score_desc', label: 'Highest Match' },
  { id: 'score_asc',  label: 'Lowest Match' },
  { id: 'name_asc',   label: 'Name A–Z' },
];

// eslint-disable-next-line no-unused-vars
const Detail = ({ icon: Icon, label, value }) => (
  <div className="p-3 rounded-xl bg-white/2 border border-white/5 flex flex-col gap-1">
    <div className="flex items-center gap-1.5 text-(--text-muted)">
      <Icon size={11} />
      <span className="text-[9px] uppercase font-bold tracking-wider">{label}</span>
    </div>
    {/* An unparsed field reads as an em-dash, never a fabricated value. */}
    <span className="text-xs font-bold text-white truncate">{value || '—'}</span>
  </div>
);

/**
 * Candidate intelligence drawer.
 *
 * Previously every field here (salary, location, notice, skills, education,
 * certifications, AI recommendation, timeline) was generated client-side by
 * `enrichCandidate()` from a name-length seed. It is now fetched from
 * `GET /recruiter/candidates/{id}/intelligence`, which combines the ATS analysis
 * row with the AI resume-preview payload.
 */
function CandidateDrawer({ candidate, onClose }) {
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(() =>
    activityService.getCandidateStatus(candidate.id ?? candidate.name)
  );

  useEffect(() => {
    return activityService.subscribeToStatus((detail) => {
      if (!detail) return;
      setStatus(activityService.getCandidateStatus(candidate.id ?? candidate.name));
    });
  }, [candidate.id, candidate.name]);

  useEffect(() => {
    if (!candidate.id) {
      setLoading(false);
      setError('This candidate has no stored user id, so the full AI dataset is unavailable.');
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    recruiterService
      .getCandidateIntelligence(candidate.id)
      .then((data) => {
        if (!cancelled) setIntel(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setIntel(null);
          setError(err.response?.data?.detail || 'Could not load the candidate intelligence dataset.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [candidate.id]);

  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const keywordMax = Math.max(1, ...(intel?.matched_keywords?.length ? [intel.matched_keywords.length, intel.missing_keywords?.length || 0] : [1]));

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
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-(--primary)/20 to-(--accent)/10 border border-(--primary)/20 flex items-center justify-center text-white font-black text-lg shrink-0">
              {candidate.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-white truncate">{candidate.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant={STATUS_VARIANTS[status] || 'default'}>{status}</Badge>
                <span className="text-xs text-emerald-400 font-bold">ATS {candidate.score}%</span>
                {intel?.keyword_match_percent != null && (
                  <span className="text-xs text-(--accent) font-bold">KW {intel.keyword_match_percent}%</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading && (
            <div className="flex items-center justify-center gap-3 py-16 text-(--text-muted)">
              <Loader2 size={18} className="animate-spin" /> Loading AI dataset…
            </div>
          )}

          {!loading && error && (
            <EmptyState
              icon={AlertTriangle}
              title="Dataset unavailable"
              description={error}
            />
          )}

          {!loading && intel && (
            <>
              {/* Professional Summary */}
              {(intel.summary || intel.ai_briefing) && (
                <section>
                  <h4 className="section-label mb-3">Professional Summary</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{intel.summary || intel.ai_briefing}</p>
                </section>
              )}

              {/* ATS Breakdown */}
              <section>
                <h4 className="section-label mb-3">ATS Breakdown</h4>
                {intel.has_analysis ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 w-32">ATS Score</span>
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-(--primary) to-(--accent)"
                          style={{ width: `${Math.max(0, Math.min(100, intel.ats_score ?? 0))}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-white w-10 text-right">
                        {intel.ats_score != null ? `${Math.round(intel.ats_score)}%` : '—'}
                      </span>
                    </div>
                    {intel.keyword_match_percent != null && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-32">Keyword Match</span>
                        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${intel.keyword_match_percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-emerald-400 w-10 text-right">
                          {intel.keyword_match_percent}%
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-(--text-muted)">No ATS analysis has been run for this candidate yet.</p>
                )}
              </section>

              {/* Keyword coverage */}
              {(intel.matched_keywords?.length > 0 || intel.missing_keywords?.length > 0) && (
                <section>
                  <h4 className="section-label mb-3">Keyword Coverage</h4>
                  <div className="space-y-3">
                    {[
                      { label: 'Matched', items: intel.matched_keywords, cls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
                      { label: 'Missing', items: intel.missing_keywords, cls: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
                    ].filter((row) => row.items?.length > 0).map((row) => (
                      <div key={row.label}>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-(--text-muted)">
                          {row.label} ({row.items.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {row.items.slice(0, 20).map((k) => (
                            <span key={k} className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${row.cls}`}>{k}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <span className="sr-only">{keywordMax}</span>
                </section>
              )}

              {/* Market Intelligence */}
              <section>
                <h4 className="section-label mb-3">Market Intelligence</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Detail icon={DollarSign} label="Expected Salary" value={intel.expected_salary} />
                  <Detail icon={Clock} label="Notice Period" value={intel.notice_period} />
                  <Detail icon={MapPin} label="Location" value={intel.location} />
                  <Detail icon={CheckCircle2} label="Availability" value={intel.availability} />
                  <Detail icon={Briefcase} label="Experience" value={intel.experience} />
                  <Detail icon={Award} label="Career Stage" value={intel.career_stage} />
                </div>
              </section>

              {/* Primary tech stack */}
              <section>
                <h4 className="section-label mb-3 flex items-center gap-2">
                  <Code2 size={12} /> Primary Tech Stack
                </h4>
                {intel.primary_tech_stack?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {intel.primary_tech_stack.map((skill) => (
                      <span key={skill} className="px-3 py-1.5 rounded-xl bg-(--primary)/10 border border-(--primary)/20 text-(--primary) text-xs font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-(--text-muted)">No skills extracted yet — the AI preview has not been generated for this resume.</p>
                )}
              </section>

              {/* Strengths / weaknesses */}
              {(intel.strengths?.length > 0 || intel.weaknesses?.length > 0) && (
                <section>
                  <h4 className="section-label mb-3">AI Assessment</h4>
                  <div className="space-y-2">
                    {intel.strengths?.slice(0, 5).map((s) => (
                      <div key={s} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-xs text-gray-300">{s}</span>
                      </div>
                    ))}
                    {intel.weaknesses?.slice(0, 5).map((w) => (
                      <div key={w} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
                        <span className="text-xs text-gray-300">{w}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Executive AI briefing */}
              {intel.ai_briefing && (
                <section>
                  <h4 className="section-label mb-3">Executive AI Briefing</h4>
                  <div className="p-4 rounded-2xl bg-(--primary)/5 border border-(--primary)/20 flex items-start gap-3">
                    <Sparkles size={16} className="text-(--primary) mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-300 leading-relaxed">{intel.ai_briefing}</p>
                  </div>
                </section>
              )}

              {intel.recommendations && (
                <section>
                  <h4 className="section-label mb-3">Recommendations</h4>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{intel.recommendations}</p>
                </section>
              )}

              {/* Resume PDF */}
              <section>
                <h4 className="section-label mb-3 flex items-center gap-2">
                  <FileText size={12} /> Source Resume
                </h4>
                {intel.report_url ? (
                  <a
                    href={`${API_URL}${intel.report_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/3 border border-(--border) text-gray-300 font-bold text-xs hover:text-white hover:border-(--primary)/30 transition-colors"
                  >
                    <Download size={14} /> Open Resume Report (PDF)
                  </a>
                ) : (
                  <p className="text-xs text-(--text-muted)">No analyzed resume to download for this candidate.</p>
                )}
                {intel.contact?.filename && (
                  <p className="text-[10px] text-(--text-muted) mt-2 truncate">{intel.contact.filename}</p>
                )}
              </section>
            </>
          )}
        </div>

        {/* Recruiter Actions — always visible at bottom */}
        <div className="p-6 border-t border-(--border) bg-(--surface-elevated) shrink-0">
          <h4 className="section-label mb-3">Recruiter Actions</h4>
          <CandidateActions candidate={candidate} />
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
      // Hydrate the local status mirror from the server so decisions made on
      // another device (or before a reload) are reflected on the cards.
      const [stats, actions] = await Promise.all([
        resumeService.getDashboardStats(),
        recruiterService.listActions(),
      ]);
      setData(stats);
      activityService.hydrateStatusesFromServer(actions);
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
    let filtered = raw.filter((c) => (c.name || '').toLowerCase().includes(search.toLowerCase()));
    if (sort === 'score_desc') filtered = [...filtered].sort((a, b) => b.score - a.score);
    else if (sort === 'score_asc') filtered = [...filtered].sort((a, b) => a.score - b.score);
    else if (sort === 'name_asc') filtered = [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
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
                key={candidate.id ?? candidate.name}
                candidate={candidate}
                rank={i}
                showActions
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
          />
        )}
      </AnimatePresence>

      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </MotionWrapper>
  );
}
