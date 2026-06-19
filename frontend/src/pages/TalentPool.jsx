import { useState, useEffect, useMemo, useCallback } from 'react';
import { Users, Search, TrendingUp, Filter, RefreshCw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import MotionWrapper from '../components/ui/MotionWrapper';
import CandidateMatchCard from '../components/ui/CandidateMatchCard';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import { resumeService } from '../services/resumeService';

const SORT_OPTIONS = [
  { id: 'score_desc', label: 'Highest Match' },
  { id: 'score_asc', label: 'Lowest Match' },
  { id: 'name_asc', label: 'Name A–Z' },
];

export default function TalentPool() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('score_desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
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
    let filtered = raw.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === 'score_desc') filtered = [...filtered].sort((a, b) => b.score - a.score);
    else if (sort === 'score_asc') filtered = [...filtered].sort((a, b) => a.score - b.score);
    else if (sort === 'name_asc') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [data, search, sort]);

  const stats = useMemo(() => ({
    total: data?.candidate_ranking?.length ?? 0,
    top: data?.candidate_ranking?.filter((c) => c.score >= 80).length ?? 0,
    avg: data?.average_ats_score ?? 0,
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
    <MotionWrapper variant="page" className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
            Talent Pool <Users className="text-[var(--accent)]" />
          </h2>
          <p className="text-[var(--text-muted)]">AI-ranked candidate database with real-time match scoring.</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--surface-elevated)] hover:bg-white/10 text-gray-300 hover:text-white transition-all text-sm border border-[var(--border)] hover-lift"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Sync Pool
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Candidates', value: stats.total, color: '#3b82f6', icon: Users },
          { label: 'Top Matches (≥80%)', value: stats.top, color: '#10b981', icon: Sparkles },
          { label: 'Avg ATS Score', value: `${stats.avg}%`, color: '#00f3ff', icon: TrendingUp },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-glass rounded-3xl p-6 flex items-center gap-5 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 0% 0%, ${kpi.color}, transparent 60%)` }} />
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `${kpi.color}20`, border: `1px solid ${kpi.color}30` }}
              >
                <Icon size={20} style={{ color: kpi.color }} />
              </div>
              <div className="relative z-10">
                <p className="text-2xl font-black text-white">{kpi.value}</p>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{kpi.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search candidates by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:border-[var(--accent)]/40 outline-none transition-all placeholder:text-[var(--text-muted)]"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-sm text-gray-300 hover:text-white hover:border-[var(--primary)]/30 transition-all"
          >
            <Filter size={15} />
            {SORT_OPTIONS.find((o) => o.id === sort)?.label}
          </button>
          {showSortMenu && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 mt-2 w-44 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-2xl z-50 overflow-hidden"
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => { setSort(opt.id); setShowSortMenu(false); }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/10 ${sort === opt.id ? 'text-[var(--primary)] font-bold' : 'text-gray-300'}`}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
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
          <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">
            Showing {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
            {search && ` matching "${search}"`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate, i) => (
              <CandidateMatchCard key={i} candidate={candidate} rank={i} />
            ))}
          </div>
        </>
      )}

      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </MotionWrapper>
  );
}
