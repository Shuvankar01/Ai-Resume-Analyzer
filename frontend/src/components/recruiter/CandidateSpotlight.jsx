import { useEffect, useState } from 'react';
import {
  Target, Sparkles, Briefcase, DollarSign, MapPin, Clock, CheckCircle2,
  FileText, Download, Loader2, Users, Code2, Award
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import CandidateActions from './CandidateActions';
import { STATUS_VARIANTS } from '../../hooks/useCandidateActions';
import { recruiterService } from '../../services/recruiterService';
import { activityService } from '../../services/activityService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// eslint-disable-next-line no-unused-vars
const Detail = ({ icon: Icon, label, value }) => (
  <div className="flex flex-col gap-0.5 p-2.5 rounded-xl bg-white/2 border border-white/5">
    <div className="flex items-center gap-1 text-(--text-muted)">
      <Icon size={10} />
      <span className="text-[9px] uppercase tracking-wider font-bold">{label}</span>
    </div>
    {/* Rendered as em-dash rather than a fabricated placeholder when the AI
        pass has not produced the field for this candidate. */}
    <span className="font-bold text-white text-[11px] truncate">{value || '—'}</span>
  </div>
);

/**
 * Top candidate spotlight.
 *
 * Shows the complete AI-parsed dataset (ATS + keyword match, tech stack,
 * experience, salary/location/availability/notice, PDF link and AI briefing)
 * plus the four recruiter actions. The `candidate` prop only carries the
 * summary from the dashboard ranking; the full dataset is fetched per
 * candidate from the intelligence endpoint.
 */
export default function CandidateSpotlight({ candidate, onViewProfile }) {
  // `intel` is stored against the id it was fetched for, so switching candidates
  // never renders the previous candidate's dataset and the pending state is
  // derived (`loadedFor !== candidate.id`) instead of being set inside the effect.
  const [intel, setIntel] = useState({ loadedFor: null, data: null });

  useEffect(() => {
    if (!candidate?.id) return;
    let cancelled = false;
    recruiterService
      .getCandidateIntelligence(candidate.id)
      .then((data) => {
        if (!cancelled) setIntel({ loadedFor: candidate.id, data });
      })
      .catch(() => {
        // The summary card still renders without the detail payload.
        if (!cancelled) setIntel({ loadedFor: candidate.id, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [candidate?.id]);

  const data = intel.loadedFor === candidate?.id ? intel.data : null;
  const loading = Boolean(candidate?.id) && intel.loadedFor !== candidate?.id;

  if (!candidate) {
    return (
      <GlassCard glow className="p-8">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <Target size={18} className="text-(--accent)" /> Top Candidate
        </h3>
        <EmptyState
          icon={Users}
          title="No candidates yet"
          description="Candidates appear here once resumes have been analyzed."
        />
      </GlassCard>
    );
  }

  const status = activityService.getCandidateStatus(candidate.id ?? candidate.name);
  const ats = data?.ats_score ?? candidate.score;
  const initials = (candidate.name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <GlassCard glow className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Target size={18} className="text-(--accent)" /> Top Candidate
        </h3>
        {loading && <Loader2 size={15} className="animate-spin text-(--text-muted)" />}
      </div>

      <div className="space-y-5">
        {/* Identity */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-500/30 to-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-white font-black text-xl shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold text-white truncate">{data?.contact?.name || candidate.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={STATUS_VARIANTS[status] || 'default'}>{status}</Badge>
              {data?.contact?.email && (
                <span className="text-[10px] text-(--text-muted) truncate">{data.contact.email}</span>
              )}
            </div>
          </div>
        </div>

        {/* ATS + keyword match */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-(--text-muted) uppercase tracking-widest">ATS Score</span>
            <span className="text-lg font-black text-emerald-400">
              {ats != null ? `${Math.round(ats)}%` : '—'}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-700"
              style={{ width: `${Math.max(0, Math.min(100, ats ?? 0))}%` }}
            />
          </div>
          {data?.keyword_match_percent != null && (
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-(--text-muted) uppercase tracking-widest font-bold">Keyword Match</span>
              <span className="font-black text-(--accent)">{data.keyword_match_percent}%</span>
            </div>
          )}
        </div>

        {/* Primary tech stack */}
        {data?.primary_tech_stack?.length > 0 && (
          <div>
            <h4 className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Code2 size={11} /> Primary Tech Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {data.primary_tech_stack.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-lg bg-(--primary)/10 border border-(--primary)/20 text-(--primary) text-[10px] font-bold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience / salary / logistics */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {[
            { icon: Briefcase, label: 'Experience', value: data?.experience },
            { icon: DollarSign, label: 'Expected', value: data?.expected_salary },
            { icon: MapPin, label: 'Location', value: data?.location },
            { icon: Clock, label: 'Notice', value: data?.notice_period },
            { icon: CheckCircle2, label: 'Availability', value: data?.availability },
            { icon: Award, label: 'Career Stage', value: data?.career_stage },
          ].map(({ icon: Icon, label, value }) => (
            <Detail key={label} icon={Icon} label={label} value={value} />
          ))}
        </div>

        {/* AI briefing */}
        {(data?.ai_briefing || data?.summary) && (
          <div className="p-4 rounded-2xl bg-(--primary)/5 border border-(--primary)/20 flex items-start gap-3">
            <Sparkles size={15} className="text-(--primary) mt-0.5 shrink-0" />
            <p className="text-xs text-gray-300 leading-relaxed">
              {data.ai_briefing || data.summary}
            </p>
          </div>
        )}

        {/* Recruiter actions — always available on the card itself */}
        <div>
          <h4 className="text-[10px] font-bold text-(--text-muted) uppercase tracking-widest mb-2">
            Recruiter Actions
          </h4>
          <CandidateActions candidate={candidate} size="sm" />
        </div>

        {/* Resume PDF + full profile */}
        <div className="flex flex-col gap-2">
          {data?.report_url && (
            <a
              href={`${API_URL}${data.report_url}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/3 border border-(--border) text-gray-300 font-bold text-xs hover:text-white hover:border-(--primary)/30 transition-colors"
            >
              <Download size={14} /> View Resume Report (PDF)
            </a>
          )}
          {data?.contact?.filename && (
            <p className="text-[10px] text-(--text-muted) text-center truncate">
              <FileText size={10} className="inline mr-1" />
              {data.contact.filename}
            </p>
          )}
          <button
            type="button"
            onClick={onViewProfile}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-(--primary)/10 border border-(--primary)/20 text-(--primary) font-bold text-sm hover:bg-(--primary)/20 transition-all"
          >
            Open Full Profile
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
