import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Users, TrendingUp, BrainCircuit, RefreshCw, Search, Sparkles, Briefcase, BarChart2, Target } from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import Table from '../components/ui/Table';
import Skeleton from '../components/ui/Skeleton';
import GlassCard from '../components/ui/GlassCard';
import MotionWrapper from '../components/ui/MotionWrapper';
import Badge from '../components/ui/Badge';
import AnalyticsChart from '../components/ui/AnalyticsChart';
import EmptyState from '../components/ui/EmptyState';
import { resumeService } from '../services/resumeService';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import useDebounce from '../hooks/useDebounce';

// Build ATS distribution data from candidate_ranking
function buildATSDistribution(candidates = []) {
  const buckets = [
    { range: '0–20%', min: 0, max: 20, count: 0 },
    { range: '21–40%', min: 21, max: 40, count: 0 },
    { range: '41–60%', min: 41, max: 60, count: 0 },
    { range: '61–80%', min: 61, max: 80, count: 0 },
    { range: '81–100%', min: 81, max: 100, count: 0 },
  ];
  candidates.forEach((c) => {
    const b = buckets.find((b) => c.score >= b.min && c.score <= b.max);
    if (b) b.count++;
  });
  return buckets.map(({ range, count }) => ({ skill: range, count }));
}

export default function Overview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toasts, addToast, removeToast } = useToast();

  const fetchAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const stats = await resumeService.getDashboardStats();
      setData(stats);
      if (isRefresh) addToast('Intelligence synchronized', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Synchronization failed', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [addToast]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const filteredCandidates = useMemo(() => {
    if (!data?.candidate_ranking) return [];
    return data.candidate_ranking.filter((c) =>
      c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [data, debouncedSearchTerm]);

  const atsDistribution = useMemo(() => buildATSDistribution(data?.candidate_ranking), [data]);

  const tableColumns = useMemo(() => [
    {
      header: 'Rank',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-xs font-bold text-[var(--text-muted)] border border-white/5">
            #{data.candidate_ranking.indexOf(row) + 1}
          </span>
        </div>
      ),
    },
    {
      header: 'Candidate Identity',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-200">{row.name}</span>
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono">
            ATS · {row.score}%
          </span>
        </div>
      ),
    },
    {
      header: 'ATS Integrity',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex-1 w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${row.score >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : row.score >= 50 ? 'bg-yellow-500' : 'bg-rose-500'}`}
              style={{ width: `${row.score}%` }}
            />
          </div>
          <span className={`font-bold w-10 text-right ${row.score >= 80 ? 'text-emerald-400' : row.score >= 50 ? 'text-yellow-400' : 'text-rose-400'}`}>
            {row.score}%
          </span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.score >= 80 ? 'success' : row.score >= 50 ? 'warning' : 'danger'}>
          {row.score >= 80 ? 'Top Pick' : 'Under Review'}
        </Badge>
      ),
    },
  ], [data]);

  if (loading) {
    return (
      <div className="p-10">
        <Skeleton.Dashboard />
      </div>
    );
  }

  const topCandidate = data?.candidate_ranking?.[0];

  return (
    <MotionWrapper variant="page" className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
            Recruiter Intelligence <BrainCircuit className="text-[var(--primary)]" />
          </h2>
          <p className="text-[var(--text-muted)]">Real-time talent analytics and candidate benchmarking.</p>
        </div>
        <button
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-[var(--surface-elevated)] hover:bg-white/10 text-gray-300 hover:text-white transition-all text-sm border border-[var(--border)] hover-lift"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} /> Sync Intelligence
        </button>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Candidates" value={data.total_candidates} icon={Users} trend="up" trendValue={14} />
        <MetricCard title="Active Jobs" value={24} icon={Briefcase} trend="up" trendValue={5} />
        <MetricCard title="Average Match" value={data.average_ats_score} suffix="%" icon={TrendingUp} />
        <MetricCard title="System Status" value="Online" icon={Sparkles} />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ATS Distribution Chart */}
        <div className="lg:col-span-7">
          <AnalyticsChart
            type="bar"
            data={atsDistribution}
            dataKey="count"
            nameKey="skill"
            title="ATS Score Distribution"
            subtitle="Candidate score distribution across ranges"
            height={280}
          />
        </div>

        {/* Top Skills Gap Chart */}
        <div className="lg:col-span-5">
          <AnalyticsChart
            type="bar"
            data={data.top_missing_skills || []}
            dataKey="count"
            nameKey="skill"
            title="Strategic Skill Demand"
            subtitle="Most requested but missing skills"
            height={280}
            color="#8b5cf6"
          />
        </div>
      </div>

      {/* AI Insights + Top Candidate */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* AI Insights */}
        <GlassCard className="lg:col-span-8 p-8 flex flex-col">
          <h3 className="text-xl font-bold text-[var(--primary)] mb-6 flex items-center gap-3">
            <BrainCircuit size={24} /> Talent Insights
          </h3>
          <div className="flex-1 p-8 rounded-3xl bg-white/[0.02] border border-[var(--border)] italic text-gray-300 leading-relaxed text-base md:text-lg font-serif">
            "{data.hiring_insights}"
          </div>
          <div className="mt-6 flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono tracking-widest uppercase border-t border-[var(--border)] pt-6">
            <span>ENGINE: GEMINI-2.0-FLASH</span>
            <span>DATA: ENCRYPTED SYNC</span>
          </div>
        </GlassCard>

        {/* Top Candidate Spotlight */}
        <GlassCard glow className="lg:col-span-4 p-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Target size={18} className="text-[var(--accent)]" /> Top Candidate
          </h3>
          {topCandidate ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-white font-black text-xl">
                  {topCandidate.name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{topCandidate.name}</p>
                  <Badge variant="success">Top Pick</Badge>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">ATS Score</span>
                  <span className="text-lg font-black text-emerald-400">{topCandidate.score}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    style={{ width: `${topCandidate.score}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] italic">Highest ATS match in current talent pool.</p>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No Candidates Yet"
              description="Candidates will appear here after analysis."
            />
          )}
        </GlassCard>
      </div>

      {/* Candidate Table */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">Talent Benchmarking</h3>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold">
              Top Match: {topCandidate?.score ?? 0}%
            </p>
          </div>
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:border-[var(--accent)]/40 outline-none transition-all shadow-xl placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Candidates Found"
            description={searchTerm ? `No candidates match "${searchTerm}".` : 'No candidate data available yet.'}
          />
        ) : (
          <Table columns={tableColumns} data={filteredCandidates} />
        )}
      </div>

      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </MotionWrapper>
  );
}
