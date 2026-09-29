import { useEffect, useState } from 'react';
import { UploadCloud, CheckCircle, Activity, RefreshCw, UserCheck, UserX, Calendar, Briefcase, Send, CheckCircle2, XCircle, Sparkles, User, FileOutput } from 'lucide-react';
import { AnimatePresence, motion as MotionPrimitive } from 'framer-motion';
const MotionDiv = MotionPrimitive.div;
import { activityService } from '../../services/activityService';

export default function ActivityTimeline({ type = 'candidate' }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = activityService.getActivities();
    const mapActivities = (list) => {
      return list.map(item => {
        let icon = Activity;
        let color = 'text-gray-400 bg-white/5';
        
        switch (item.type) {
          case 'UPLOAD': icon = UploadCloud; color = 'text-blue-400 bg-blue-500/10'; break;
          case 'ANALYSIS': icon = CheckCircle; color = 'text-emerald-400 bg-emerald-500/10'; break;
          case 'SHORTLIST': icon = UserCheck; color = 'text-green-400 bg-green-500/10'; break;
          case 'REJECT': icon = UserX; color = 'text-rose-400 bg-rose-500/10'; break;
          case 'INTERVIEW': icon = Calendar; color = 'text-purple-400 bg-purple-500/10'; break;
          case 'OFFER': icon = Send; color = 'text-amber-400 bg-amber-500/10'; break;
          case 'OFFER_ACCEPTED': icon = CheckCircle2; color = 'text-emerald-400 bg-emerald-500/10'; break;
          case 'OFFER_REJECTED': icon = XCircle; color = 'text-rose-400 bg-rose-500/10'; break;
          case 'SYSTEM': icon = RefreshCw; color = 'text-(--accent) bg-(--accent)/10'; break;
          case 'CANDIDATE_UPDATED': icon = User; color = 'text-blue-400 bg-blue-500/10'; break;
          case 'JOB_PUBLISHED': icon = Briefcase; color = 'text-fuchsia-400 bg-fuchsia-500/10'; break;
          case 'AI_RECOMMENDATION': icon = Sparkles; color = 'text-yellow-400 bg-yellow-500/10'; break;
          case 'RESUME_RESCORED': icon = FileOutput; color = 'text-indigo-400 bg-indigo-500/10'; break;
        }

        return {
          id: item.id,
          title: item.title,
          desc: item.description,
          time: item.timestamp,
          metadata: item.metadata || {},
          icon,
          color
        };
      });
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActivities(mapActivities(stored));
    setLoading(false);

    // Subscribe for real-time updates
    return activityService.subscribe((newActivity, all) => {
      setActivities(mapActivities(all));
    });
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

  const fetchActivities = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 300);
  };

  return (
    <div className="card-glass rounded-2xl p-6 border border-(--border) relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-(--primary) animate-pulse" />
          <h4 className="text-sm font-black text-white uppercase tracking-wider">
            {type === 'candidate' ? 'AI Activity Stream' : 'Recruiter Audit Stream'}
          </h4>
        </div>
        <button
          onClick={fetchActivities}
          disabled={loading}
          className={`p-1.5 rounded-lg border border-(--border) text-(--text-muted) hover:text-white hover:border-white/10 active:scale-95 transition-all
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
          <p className="text-xs text-(--text-muted) font-medium">No activity log found.</p>
        </div>
      ) : (
        <div className="relative border-l border-white/5 ml-3 pl-6 space-y-6 max-h-90 overflow-y-auto pr-2">
          <AnimatePresence initial={false}>
            {activities.slice(0, 10).map((act) => {
              const Icon = act.icon;
              return (
                <MotionDiv
                  key={act.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative group"
                >
                  {/* Node indicator */}
                  <span className={`absolute -left-7.75 top-1 w-2.5 h-2.5 rounded-full bg-[#05050A] border-3 border-(--primary) group-hover:scale-125 transition-transform`} />

                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-black text-white tracking-tight">{act.title}</h5>
                        {type === 'recruiter' && act.metadata.statusBadge && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${act.color}`}>
                            {act.metadata.statusBadge}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-(--text-muted) font-bold shrink-0">{formatTime(act.time)}</span>
                    </div>
                    <p className="text-xs text-(--text-muted) font-medium">{act.desc}</p>
                    
                    {type === 'recruiter' && (act.metadata.candidateName || act.metadata.atsScore || act.metadata.recruiterName) && (
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {act.metadata.candidateName && (
                          <span className="text-[10px] text-gray-300 font-medium flex items-center gap-1">
                            <User size={10} /> {act.metadata.candidateName}
                          </span>
                        )}
                        {act.metadata.atsScore && (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            ATS: {act.metadata.atsScore}%
                          </span>
                        )}
                        {act.metadata.recruiterName && (
                          <span className="text-[10px] text-(--text-muted) flex items-center gap-1">
                            By: {act.metadata.recruiterName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </MotionDiv>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
