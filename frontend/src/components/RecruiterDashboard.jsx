import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { Users, TrendingUp, AlertCircle, LogOut, LayoutDashboard } from 'lucide-react';

const API_URL = 'http://localhost:8000';
const COLORS = ['#00f3ff', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'];

export default function RecruiterDashboard({ setUser }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setUser(null);
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${API_URL}/analytics/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#00f3ff]">Loading analytics...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-red-400">{error}</p>
        <button onClick={handleLogout} className="mt-4 text-gray-400 hover:text-white underline">Back to Login</button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-10 pb-4 border-b border-[#00f3ff]/20">
        <h1 className="text-3xl font-bold neon-text flex items-center gap-2">
          <LayoutDashboard className="text-[#00f3ff]" /> Recruiter Dashboard
        </h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition">
          <LogOut size={18} /> Logout
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel p-6 rounded-2xl border border-[#00f3ff]/30 flex items-center gap-4 hover:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition">
          <div className="p-4 bg-[#00f3ff]/10 rounded-xl text-[#00f3ff]">
            <Users size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Candidates</p>
            <h3 className="text-3xl font-bold text-white">{data.total_candidates}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-blue-500/30 flex items-center gap-4 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition">
          <div className="p-4 bg-blue-500/10 rounded-xl text-blue-400">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Avg. ATS Score</p>
            <h3 className="text-3xl font-bold text-white">{data.average_ats_score}</h3>
          </div>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl border border-purple-500/30">
          <h3 className="text-purple-400 text-sm font-medium mb-2">Hiring Insights</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            {data.hiring_insights}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Missing Skills Chart */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-6 text-white flex items-center gap-2">
            Top Missing Skills across Candidates
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_missing_skills} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" stroke="#888" />
                <YAxis dataKey="skill" type="category" stroke="#888" width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 15, 0.9)', borderColor: '#00f3ff', color: '#fff' }}
                  itemStyle={{ color: '#00f3ff' }}
                />
                <Bar dataKey="count" fill="#00f3ff" radius={[0, 4, 4, 0]}>
                  {data.top_missing_skills.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Candidate Ranking List */}
        <div className="glass-panel p-6 rounded-2xl">
          <h2 className="text-xl font-semibold mb-6 text-white">Top Ranked Candidates</h2>
          <div className="space-y-4">
            {data.candidate_ranking.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No candidates analyzed yet.</p>
            ) : (
              data.candidate_ranking.map((candidate, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-gray-800 hover:border-[#00f3ff]/50 transition group">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 'bg-gray-800 text-gray-400'}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-200 group-hover:text-white transition">{candidate.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-[#00f3ff]">{candidate.score}</span>
                    <span className="text-xs text-gray-500">ATS Score</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
