import { useEffect, useState } from 'react';
import { UploadCloud, CheckCircle, FileText, Activity, RefreshCw } from 'lucide-react';
import { resumeService } from '../../services/resumeService';

export default function ActivityTimeline({ type = 'candidate' }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      if (type === 'candidate') {
        const data = await resumeService.getHistory();
        // Convert history entries to linear timeline events
        const events = [];
        data.forEach((item) => {
          // Event 1: Upload
          events.push({
            id: `upload-${item.id}`,
            title: 'Resume Document Uploaded',
            desc: `Uploaded file: ${item.filename}`,
            time: item.created_at,
            icon: UploadCloud,
            color: 'text-blue-400 bg-blue-500/10'
          });

          // Event 2: Analysis if complete
          if (item.analyzed) {
            events.push({
              id: `analysis-${item.id}`,
              title: 'AI Career Analysis Complete',
              desc: `Calculated ATS Match Score of ${item.ats_score}%`,
              time: item.created_at,
              icon: CheckCircle,
              color: 'text-emerald-400 bg-emerald-500/10'
            });

            events.push({
              id: `report-${item.id}`,
              title: 'PDF Intelligence Report Generated',
              desc: `Ready for offline sharing and reviews`,
              time: item.created_at,
              icon: FileText,
              color: 'text-purple-400 bg-purple-500/10'
            });
          }
        });
        setActivities(events);
      } else {
        const data = await resumeService.getRecruiterActivities();
        const events = [];
        data.forEach((item) => {
          events.push({
            id: `match-${item.id}`,
            title: 'Candidate Fit Processed',
            desc: `${item.candidate_name} scored ${item.ats_score}% matching index`,
            time: item.created_at,
            icon: CheckCircle,
            color: 'text-[var(--accent)] bg-[var(--accent)]/10'
          });
          events.push({
            id: `review-${item.id}`,
            title: 'Profile Document Checked',
            desc: `Evaluated ${item.filename} matching metrics`,
            time: item.created_at,
            icon: FileText,
            color: 'text-gray-400 bg-white/5'
          });
        });
        setActivities(events);
      }
    } catch (err) {
      console.error('Failed to load activity log:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [type]);

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card-glass rounded-2xl p-6 border border-[var(--border)] relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[var(--primary)] animate-pulse" />
          <h4 className="text-sm font-black text-white uppercase tracking-wider">
            {type === 'candidate' ? 'AI Activity Stream' : 'Recruiter Audit Stream'}
          </h4>
        </div>
        <button
          onClick={fetchActivities}
          disabled={loading}
          className={`p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-white hover:border-white/10 active:scale-95 transition-all
            ${loading ? 'animate-spin' : ''}
          `}
          title="Reload Log"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 py-4">
          <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
        </div>
      ) : activities.length === 0 ? (
        <div className="p-8 text-center space-y-2">
          <Activity size={24} className="mx-auto text-white/10" />
          <p className="text-xs text-[var(--text-muted)] font-medium">No activity log found.</p>
        </div>
      ) : (
        <div className="relative border-l border-white/5 ml-3 pl-6 space-y-6 max-h-[360px] overflow-y-auto pr-2">
          {activities.slice(0, 10).map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="relative group">
                {/* Node indicator */}
                <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-[#05050A] border-[3px] border-[var(--primary)] group-hover:scale-125 transition-transform" />

                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-4">
                    <h5 className="text-xs font-black text-white tracking-tight">{act.title}</h5>
                    <span className="text-[10px] text-[var(--text-muted)] font-bold shrink-0">{formatTime(act.time)}</span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] font-medium">{act.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
