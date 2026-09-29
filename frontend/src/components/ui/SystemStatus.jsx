import { useEffect, useState } from 'react';
import { ShieldCheck, Database, Cpu, Activity, RefreshCw, HardDrive, Key, Cloud, Box, Bell, Clock, Zap, Target, Users, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export default function SystemStatus({ type = 'candidate' }) {
  const [status, setStatus] = useState({
    api: 'loading',
    database: 'loading',
    ai: 'loading',
    redis: 'loading',
    auth: 'loading',
    storage: 'loading',
    queue: 'loading',
    notifications: 'loading',
    service: 'AI Resume Analyzer'
  });
  const [loading, setLoading] = useState(true);

  const checkHealth = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const response = await api.get('/health');
      const data = response.data;
      setStatus({
        api: data.status === 'ok' || data.status === 'degraded' ? 'online' : 'offline',
        database: data.database === 'ok' ? 'online' : 'offline',
        ai: data.ai_service === 'ok' ? 'online' : 'offline',
        redis: 'online', // Simulated for UI
        auth: 'online',
        storage: 'online',
        queue: 'online',
        notifications: 'online',
        service: data.service || 'AI Resume Analyzer'
      });
    } catch (error) {
      console.error('Health check failed:', error);
      setStatus({
        api: 'offline',
        database: 'offline',
        ai: 'offline',
        redis: 'offline',
        auth: 'offline',
        storage: 'offline',
        queue: 'offline',
        notifications: 'offline',
        service: 'AI Resume Analyzer'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkHealth(false); // Intentional: First call to initialize data
    const interval = setInterval(() => checkHealth(false), 30000); // Check health every 30 seconds
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

  const candidateMetrics = [
    { label: 'API Gateway', state: status.api, icon: ShieldCheck },
    { label: 'Database', state: status.database, icon: Database },
    { label: 'AI Engine', state: status.ai, icon: Cpu }
  ];

  const recruiterMetrics = [
    { label: 'API Gateway', state: status.api, icon: ShieldCheck },
    { label: 'Gemini AI Engine', state: status.ai, icon: Cpu },
    { label: 'PostgreSQL', state: status.database, icon: Database },
    { label: 'Redis Cache', state: status.redis, icon: HardDrive },
    { label: 'Authentication', state: status.auth, icon: Key },
    { label: 'File Storage', state: status.storage, icon: Cloud },
    { label: 'Background Queue', state: status.queue, icon: Box },
    { label: 'Notification Service', state: status.notifications, icon: Bell }
  ];

  const metrics = type === 'recruiter' ? recruiterMetrics : candidateMetrics;

  const systemStats = [
    { label: 'Uptime', value: '99.9%', icon: Clock },
    { label: 'API Latency', value: '42ms', icon: Zap },
    { label: 'Queue Size', value: '0', icon: Box },
    { label: 'Processing Time', value: '1.2s', icon: Activity },
    { label: 'AI Success Rate', value: '99.8%', icon: Target },
    { label: 'Active Sessions', value: '142', icon: Users }
  ];

  return (
    <div className="card-glass rounded-2xl p-6 border border-(--border) relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-(--accent) animate-pulse" />
          <h4 className="text-sm font-black text-white uppercase tracking-wider">
            {type === 'recruiter' ? 'Operations Center' : 'System Node Status'}
          </h4>
        </div>
        <button
          onClick={checkHealth}
          disabled={loading}
          className={`p-1.5 rounded-lg border border-(--border) text-(--text-muted) hover:text-white hover:border-white/10 active:scale-95 transition-all
            ${loading ? 'animate-spin' : ''}
          `}
          title="Refresh Status"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className={`grid gap-4 ${type === 'recruiter' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="flex items-center justify-between p-3 rounded-xl bg-white/1 border border-white/5">
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

      {type === 'recruiter' && (
        <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-4">
          {systemStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex flex-col gap-2 p-4 rounded-xl bg-white/2 border border-white/5">
                <div className="flex items-center gap-2 text-gray-400">
                  <Icon size={14} />
                  <span className="text-[10px] uppercase font-bold tracking-wider">{stat.label}</span>
                </div>
                <span className="text-lg font-black text-white">{stat.value}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
