import React from 'react';
import { FileText, Clock, User, Briefcase, Zap, AlertCircle, MapPin } from 'lucide-react';
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
            {snapshot.preferred_location && <span className="flex items-center gap-1.5"><MapPin size={14}/> {snapshot.preferred_location}</span>}
            {snapshot.employment_type && <span className="flex items-center gap-1.5"><Briefcase size={14}/> {snapshot.employment_type}</span>}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {snapshot.target_roles?.map((r, i) => (
              <span key={`role-${i}`} className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-medium border border-[var(--primary)]/20">
                {r}
              </span>
            ))}
            {snapshot.career_stage && (
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium border border-purple-500/20">
                {snapshot.career_stage}
              </span>
            )}
            {snapshot.expected_salary && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                {snapshot.expected_salary}
              </span>
            )}
            {snapshot.availability && (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                {snapshot.availability}
              </span>
            )}
            {snapshot.notice_period && (
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                {snapshot.notice_period}
              </span>
            )}
          </div>
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

      {/* Candidate Snapshot Extension */}
      {(snapshot.resume_strength || snapshot.interview_readiness || snapshot.role_match_confidence || snapshot.market_value) && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
          {snapshot.resume_strength && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-[var(--border)] hover:bg-white/[0.04] transition-colors group cursor-default">
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 group-hover:text-[var(--primary)] transition-colors">Resume Strength</div>
              <div className="text-xl font-black text-white">{snapshot.resume_strength}</div>
            </div>
          )}
          {snapshot.interview_readiness && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-[var(--border)] hover:bg-white/[0.04] transition-colors group cursor-default">
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 group-hover:text-emerald-400 transition-colors">Interview Readiness</div>
              <div className="text-xl font-black text-emerald-400">{snapshot.interview_readiness}</div>
            </div>
          )}
          {snapshot.role_match_confidence && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-[var(--border)] hover:bg-white/[0.04] transition-colors group cursor-default">
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 group-hover:text-[var(--primary)] transition-colors">Role Match</div>
              <div className="text-xl font-black text-[var(--primary)]">{snapshot.role_match_confidence}%</div>
            </div>
          )}
          {snapshot.market_value && (
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-[var(--border)] hover:bg-white/[0.04] transition-colors group cursor-default">
              <div className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2 group-hover:text-purple-400 transition-colors">Market Value</div>
              <div className="text-xl font-black text-purple-400">{snapshot.market_value}</div>
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
