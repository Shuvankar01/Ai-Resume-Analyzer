import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';
import { Users, TrendingUp, BrainCircuit, RefreshCw, Search, Sparkles } from 'lucide-react';

import MetricCard from '../components/ui/MetricCard';
import Table from '../components/ui/Table';
import Skeleton from '../components/ui/Skeleton';
import { resumeService } from '../services/resumeService';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import useDebounce from '../hooks/useDebounce';

const COLORS = ['#00f3ff', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'];

const MemoizedBarChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data} layout="vertical">
      <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} vertical={false} />
      <XAxis type="number" hide />
      <YAxis dataKey="skill" type="category" stroke="#888" width={100} axisLine={false} tickLine={false} fontSize={12} />
      <Tooltip
        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
        contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.95)', borderColor: '#00f3ff', borderRadius: '16px', border: '1px solid rgba(0, 243, 255, 0.1)' }}
        itemStyle={{ color: '#00f3ff' }}
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
          <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-xs font-bold text-gray-500 border border-white/5">
            #{data.candidate_ranking.indexOf(row) + 1}
          </span>
        </div>
      )
    },
    {
      header: 'Candidate Name',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-200">{row.name}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
        </div>
      )
    },
    {
      header: 'ATS Score',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex-1 w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.5)] transition-all duration-1000"
              style={{ width: `${row.score}%` }}
            ></div>
          </div>
          <span className={`font-bold w-10 text-right ${row.score >= 80 ? 'text-[#00f3ff]' : row.score >= 50 ? 'text-yellow-400' : 'text-red-400'
            }`}>
            {row.score}%
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] border ${row.score >= 80 ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-white/10'
          }`}>
          {row.score >= 80 ? 'Top Pick' : 'Under Review'}
        </span>
      )
    }
  ], [data]);

  if (loading) {
    return (
      <div className="p-10 space-y-10 animate-pulse">
        <Skeleton className="w-1/3 h-12 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
            Recruiter Intelligence <BrainCircuit className="text-[#8b5cf6]" />
          </h2>
          <p className="text-gray-500">Real-time talent analytics and candidate benchmarking.</p>
        </div>
        <button
          onClick={() => fetchAnalytics(true)}
          disabled={refreshing}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all text-sm border border-white/5 glass-panel-hover"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} /> Sync Intelligence
        </button>
      </div>

      {/* KPI RIBBON */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MetricCard title="Talent Pool" value={data.total_candidates} icon={Users} trend="up" trendValue={14} />
        <MetricCard title="Average Match" value={`${data.average_ats_score}%`} icon={TrendingUp} />
        <MetricCard title="System Status" value="Online" icon={Sparkles} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Market Skills Gap */}
        <div className="lg:col-span-7 glass-panel p-8 rounded-[32px] premium-glow relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f3ff]/5 blur-[80px] rounded-full"></div>
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
            Strategic Skill Demand
          </h3>
          <div className="h-80">
            <MemoizedBarChart data={data.top_missing_skills} />
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="lg:col-span-5 glass-panel p-8 rounded-[32px] border border-white/5 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/5 blur-[80px] rounded-full"></div>
          <h3 className="text-xl font-bold text-[#8b5cf6] mb-6 flex items-center gap-3">
            <BrainCircuit size={24} /> Talent Insights
          </h3>
          <div className="flex-1 p-8 rounded-3xl bg-white/[0.02] border border-white/5 italic text-gray-300 leading-relaxed text-base md:text-lg font-serif">
            "{data.hiring_insights}"
          </div>
          <div className="mt-8 flex items-center justify-between text-[10px] text-gray-600 font-mono tracking-widest uppercase border-t border-white/5 pt-6">
            <span>ENGINE: GEMINI-2.0-FLASH</span>
            <span>DATA: ENCRYPTED SYNC</span>
          </div>
        </div>
      </div>

      {/* Qualified Candidates Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-end px-4 gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">Talent Benchmarking</h3>
            <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-bold">Top Match Detected: {data.candidate_ranking[0]?.score}%</p>
          </div>
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00f3ff] transition-colors" size={18} />
            <input
              type="text"
              placeholder="Filter by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-sm text-white focus:border-[#00f3ff]/40 outline-none transition-all shadow-2xl placeholder:text-gray-600"
            />
          </div>
        </div>
        <div className="glass-panel rounded-[40px] overflow-hidden border border-white/5">
          <Table columns={tableColumns} data={filteredCandidates} />
        </div>
      </div>

      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
