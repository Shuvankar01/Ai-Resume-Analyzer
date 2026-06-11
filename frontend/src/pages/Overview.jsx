import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, TrendingUp, BrainCircuit, RefreshCw, Search, Sparkles, Briefcase } from 'lucide-react';
import MetricCard from '../components/ui/MetricCard';
import Table from '../components/ui/Table';
import Skeleton from '../components/ui/Skeleton';
import GlassCard from '../components/ui/GlassCard';
import MotionWrapper from '../components/ui/MotionWrapper';
import Badge from '../components/ui/Badge';
import { resumeService } from '../services/resumeService';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import useDebounce from '../hooks/useDebounce';

const COLORS = ['#00f3ff', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

const MemoizedBarChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} layout="vertical" margin={{ left: -20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} vertical={false} />
      <XAxis type="number" hide />
      <YAxis dataKey="skill" type="category" stroke="var(--text-muted)" width={100} axisLine={false} tickLine={false} fontSize={12} />
      <Tooltip
        cursor={{ fill: 'rgba(255, 255, 255, 0.02)' }}
        contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.95)', borderColor: 'var(--border)', borderRadius: '16px', color: '#fff' }}
        itemStyle={{ color: 'var(--accent)' }}
      />
      <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
));

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

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const filteredCandidates = useMemo(() => {
    if (!data?.candidate_ranking) return [];
    return data.candidate_ranking.filter(c =>
      c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [data, debouncedSearchTerm]);

  const tableColumns = useMemo(() => [
    {
      header: 'Rank',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-xs font-bold text-[var(--text-muted)] border border-white/5">
            #{data.candidate_ranking.indexOf(row) + 1}
          </span>
        </div>
      )
    },
    {
      header: 'Candidate Identity',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-200">{row.name}</span>
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-mono">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
        </div>
      )
    },
    {
      header: 'ATS Integrity',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex-1 w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${row.score >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : row.score >= 50 ? 'bg-yellow-500' : 'bg-rose-500'}`}
              style={{ width: `${row.score}%` }}
            ></div>
          </div>
          <span className={`font-bold w-10 text-right ${row.score >= 80 ? 'text-emerald-400' : row.score >= 50 ? 'text-yellow-400' : 'text-rose-400'}`}>
            {row.score}%
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <Badge variant={row.score >= 80 ? 'success' : row.score >= 50 ? 'warning' : 'danger'}>
          {row.score >= 80 ? 'Top Pick' : 'Under Review'}
        </Badge>
      )
    }
  ], [data]);

  if (loading) {
    return (
      <div className="p-10 space-y-10">
        <Skeleton className="w-1/3 h-12 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton.Card />
          <Skeleton.Card />
          <Skeleton.Card />
          <Skeleton.Card />
        </div>
        <Skeleton className="w-full h-80 rounded-3xl" />
        <Skeleton.Table />
      </div>
    );
  }

  return (
    <MotionWrapper variant="page" className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto space-y-10">
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

      {/* KPI RIBBON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Candidates" value={data.total_candidates} icon={Users} trend="up" trendValue={14} />
        <MetricCard title="Active Jobs" value={24} icon={Briefcase} trend="up" trendValue={5} />
        <MetricCard title="Average Match" value={data.average_ats_score} suffix="%" icon={TrendingUp} />
        <MetricCard title="System Status" value="Online" icon={Sparkles} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Market Skills Gap */}
        <GlassCard glow className="lg:col-span-7 p-8">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            Strategic Skill Demand
          </h3>
          <div className="h-80">
            <MemoizedBarChart data={data.top_missing_skills} />
          </div>
        </GlassCard>

        {/* AI Insights Card */}
        <GlassCard className="lg:col-span-5 p-8 flex flex-col">
          <h3 className="text-xl font-bold text-[var(--primary)] mb-6 flex items-center gap-3">
            <BrainCircuit size={24} /> Talent Insights
          </h3>
          <div className="flex-1 p-8 rounded-3xl bg-white/[0.02] border border-[var(--border)] italic text-gray-300 leading-relaxed text-base md:text-lg font-serif">
            "{data.hiring_insights}"
          </div>
          <div className="mt-8 flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono tracking-widest uppercase border-t border-[var(--border)] pt-6">
            <span>ENGINE: GEMINI-2.0-FLASH</span>
            <span>DATA: ENCRYPTED SYNC</span>
          </div>
        </GlassCard>
      </div>

      {/* Qualified Candidates Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">Talent Benchmarking</h3>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-[0.2em] font-bold">Top Match Detected: {data.candidate_ranking[0]?.score}%</p>
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
        
        <Table columns={tableColumns} data={filteredCandidates} />
      </div>

      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </MotionWrapper>
  );
}
