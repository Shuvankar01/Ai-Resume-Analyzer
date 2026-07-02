import { useEffect, useState } from 'react';
import { ShieldCheck, Database, Cpu, Activity, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export default function SystemStatus() {
  const [status, setStatus] = useState({
    api: 'loading',
    database: 'loading',
    ai: 'loading',
    service: 'AI Resume Analyzer'
  });
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await api.get('/health');
      const data = response.data;
      setStatus({
        api: data.status === 'ok' || data.status === 'degraded' ? 'online' : 'offline',
        database: data.database === 'ok' ? 'online' : 'offline',
        ai: data.ai_service === 'ok' ? 'online' : 'offline',
        service: data.service || 'AI Resume Analyzer'
      });
    } catch (error) {
      console.error('Health check failed:', error);
      setStatus({
        api: 'offline',
        database: 'offline',
        ai: 'offline',
        service: 'AI Resume Analyzer'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check health every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (state) => {
    if (state === 'online') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (state === 'offline') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  const getStatusText = (state, label) => {
    if (state === 'online') {
      if (label === 'Database') return 'Connected';
      if (label === 'AI Engine') return 'Ready';
      return 'Healthy';
    }
    if (state === 'offline') return 'Offline';
    return 'Pending';
  };

  const metrics = [
    { label: 'API Gateway', state: status.api, icon: ShieldCheck },
    { label: 'Database', state: status.database, icon: Database },
    { label: 'AI Engine', state: status.ai, icon: Cpu }
  ];

  return (
    <div className="card-glass rounded-2xl p-6 border border-[var(--border)] relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[var(--accent)] animate-pulse" />
          <h4 className="text-sm font-black text-white uppercase tracking-wider">System Node Status</h4>
        </div>
        <button
          onClick={checkHealth}
          disabled={loading}
          className={`p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-white/10 active:scale-95 transition-all
            ${loading ? 'animate-spin' : ''}
          `}
          title="Refresh Status"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="space-y-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                  <Icon size={16} />
                </div>
                <span className="text-xs font-bold text-gray-300">{m.label}</span>
              </div>
              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusColor(m.state)}`}>
                {getStatusText(m.state, m.label)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
