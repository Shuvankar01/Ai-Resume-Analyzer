import React from 'react';
import { FileText, Clock, User, Briefcase, Zap, AlertCircle } from 'lucide-react';
import GlassCard from '../GlassCard';

export default function PreviewHeader({ snapshot, metadata, actions, onAction }) {
  const formatTime = (ts) => new Date(ts).toLocaleDateString();

  return (
    <GlassCard className="p-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--primary)]/10 blur-[60px] rounded-full pointer-events-none" />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
              <User className="text-[var(--primary)]" size={24} />
            </div>
            {snapshot.name || 'Candidate Preview'}
          </h2>
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5"><Briefcase size={14}/> {snapshot.estimated_experience || 'Experience Unknown'}</span>
            <span className="flex items-center gap-1.5"><FileText size={14}/> {metadata.filename}</span>
            <span className="flex items-center gap-1.5"><Clock size={14}/> Uploaded {formatTime(metadata.upload_timestamp)}</span>
          </div>
          {snapshot.target_roles?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {snapshot.target_roles.map((r, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium border border-[var(--primary)]/20">
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {actions && actions.length > 0 && (
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            {actions.map(action => (
              <button 
                key={action.id}
                onClick={() => onAction && onAction(action.action_type)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  action.action_type === 'analyze' 
                  ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:scale-105'
                  : 'bg-[var(--surface-elevated)] text-[var(--text)] hover:bg-[var(--border)] border border-[var(--border)]'
                }`}
              >
                {action.action_type === 'analyze' ? <Zap size={16} /> : null}
                {action.action_type === 'compare' ? <AlertCircle size={16} className="text-[var(--text-muted)]" /> : null}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
