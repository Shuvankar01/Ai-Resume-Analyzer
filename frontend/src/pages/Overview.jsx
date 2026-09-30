/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BrainCircuit, RefreshCw, Search, Users, Briefcase
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import Table from '../components/ui/Table';
import Skeleton from '../components/ui/Skeleton';
import MotionWrapper from '../components/ui/MotionWrapper';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Toast from '../components/ui/Toast';
import useToast from '../hooks/useToast';
import useDebounce from '../hooks/useDebounce';
import { usePreferences } from '../context/PreferencesContext';
import { useNavigate } from 'react-router-dom';
import { resumeService } from '../services/resumeService';
import { recruiterService } from '../services/recruiterService';
import { activityService } from '../services/activityService';
import { STATUS_VARIANTS } from '../hooks/useCandidateActions';
import useRecruiterProfile from '../hooks/useRecruiterProfile';

import RecruiterKpiCards from '../components/recruiter/RecruiterKpiCards';
import CandidateActions from '../components/recruiter/CandidateActions';
import PipelineTracker from '../components/recruiter/PipelineTracker';
import AtsDistribution from '../components/recruiter/AtsDistribution';
import SkillDemandPanel from '../components/recruiter/SkillDemandPanel';
import CandidateSpotlight from '../components/recruiter/CandidateSpotlight';
import AiHiringInsights from '../components/recruiter/AiHiringInsights';
import HiringCalendar from '../components/recruiter/HiringCalendar';
import SourcingActivityFeed from '../components/recruiter/SourcingActivityFeed';
import RecruiterOnboarding from '../components/recruiter/RecruiterOnboarding';

/**
 * Recruiter dashboard.
 *
 * Every number on this page comes from the backend:
 *   • `/analytics/dashboard`  → ranking, ATS average, skill demand
 *   • `/recruiter/metrics`    → the four consolidated KPI cards + pipeline
 *   • `/recruiter/actions`    → hydrates the local status mirror
 * There are no seeded or minimum-clamped figures, so a new account reads a
 * genuine zero everywhere. Infrastructure telemetry lives on `/admin/system`.
 */
export default function Overview() {
  const [data, setData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionToken, setActionToken] = useState(0);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { toasts, addToast, removeToast } = useToast();
  const { preferences } = usePreferences();
  const offlineCache = preferences.pref_offline_cache;
  const navigate = useNavigate();
  const {
    profile,
    loading: profileLoading,
    showOnboarding,
    dismissOnboarding,
    openOnboarding,
    setProfile,
  } = useRecruiterProfile();

  const fetchAnalytics = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setMetricsLoading(true);
      try {
        const [stats, recruiterMetrics, actions] = await Promise.all([
          resumeService.getDashboardStats(),
          recruiterService.getMetrics(),
          recruiterService.listActions(),
        ]);
        setData(stats);
        setMetrics(recruiterMetrics);
        resumeService.setCached(resumeService.CACHE_KEYS.dashboardStats, stats);
        // Mirror the server's decisions into the local status bus so badges
        // reflect decisions made on another device or before a reload.
        activityService.hydrateStatusesFromServer(actions);
        setActionToken((t) => t + 1);
        if (isRefresh) addToast('Intelligence synchronized', 'success');
      } catch (err) {
        // Fall back to the last good snapshot when the user opted into caching.
        const cached = offlineCache ? resumeService.getCached(resumeService.CACHE_KEYS.dashboardStats) : null;
        if (cached) {
          setData(cached.data);
          addToast('Offline — showing the last synced snapshot.', 'warning');
        } else {
          addToast(err.response?.data?.detail || 'Synchronization failed', 'error');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setMetricsLoading(false);
      }
    },
    [addToast, offlineCache]
  );

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const ranking = useMemo(() => data?.candidate_ranking || [], [data]);

  const filteredCandidates = useMemo(
    () => ranking.filter((c) => (c.name || '').toLowerCase().includes(debouncedSearchTerm.toLowerCase())),
    [ranking, debouncedSearchTerm]
  );

  const tableColumns = useMemo(
    () => [
      {
        header: 'Rank',
        render: (row) => (
          <span className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-xs font-bold text-(--text-muted) border border-white/5">
            #{ranking.indexOf(row) + 1}
          </span>
        ),
      },
      {
        header: 'Candidate Identity',
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-bold text-gray-200">{row.name}</span>
            <span className="text-[10px] text-(--text-muted) uppercase tracking-widest font-mono">
              ATS · {row.score}%
            </span>
          </div>
        ),
      },
      {
        header: 'ATS Integrity',
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex-1 w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  row.score >= 80
                    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                    : row.score >= 50
                      ? 'bg-yellow-500'
                      : 'bg-rose-500'
                }`}
                style={{ width: `${row.score}%` }}
              />
            </div>
            <span
              className={`font-bold w-10 text-right ${
                row.score >= 80 ? 'text-emerald-400' : row.score >= 50 ? 'text-yellow-400' : 'text-rose-400'
              }`}
            >
              {row.score}%
            </span>
          </div>
        ),
      },
      {
        header: 'Status',
        render: (row) => {
          const status = activityService.getCandidateStatus(row.id ?? row.name);
          return <Badge variant={STATUS_VARIANTS[status] || 'default'}>{status}</Badge>;
        },
      },
      {
        header: 'Decision',
        render: (row) => (
          // Full decision set on every dashboard section, not just the spotlight.
          <div onClick={(e) => e.stopPropagation()} role="presentation">
            <CandidateActions candidate={row} size="sm" />
          </div>
        ),
      },
    ],
    [ranking]
  );

  if (loading) {
    return (
      <div className="p-10">
        <Skeleton.Dashboard />
      </div>
    );
  }

  const topCandidate = ranking[0];
  const pipeline = metrics?.pipeline || data?.pipeline || {};
  const candidatesCount = data?.total_candidates ?? 0;
  const analysesCount = metrics?.resumes_analyzed ?? 0;
  const isEmptyAccount = candidatesCount === 0 && analysesCount === 0 && (metrics?.open_jobs ?? 0) === 0;

  return (
    <MotionWrapper variant="page" className="p-4 md:p-8 lg:p-10 max-w-400 mx-auto space-y-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
            Recruiter Intelligence <BrainCircuit className="text-(--primary)" />
          </h2>
          <p className="text-(--text-muted)">
            {profile?.company_name
              ? `${profile.company_name} · ${profile.designation || 'Recruiter'}`
              : 'Set up your hiring profile to unlock real pipeline metrics.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openOnboarding}
            className="px-5 py-3 rounded-2xl bg-(--surface-elevated) hover:bg-white/10 text-gray-300 hover:text-white transition-all text-sm border border-(--border) hover-lift"
          >
            <span className="flex items-center gap-2">
              <Briefcase size={16} /> Hiring Profile
            </span>
          </button>
          <button
            type="button"
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-(--surface-elevated) hover:bg-white/10 text-gray-300 hover:text-white transition-all text-sm border border-(--border) hover-lift"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} /> Sync Intelligence
          </button>
        </div>
      </div>

      {/* ── Consolidated KPI cards (was 10 cards) ── */}
      <RecruiterKpiCards metrics={metrics} loading={metricsLoading} />

      {/* ── Main two-column workspace ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* LEFT: pipeline, ATS distribution, skill demand */}
        <div className="xl:col-span-7 space-y-8">
          <PipelineTracker pipeline={pipeline} candidates={candidatesCount} />
          <AtsDistribution candidates={ranking} />
          <SkillDemandPanel
            topMissingSkills={data?.top_missing_skills || []}
            trendingSkills={data?.trending_skills || []}
          />
        </div>

        {/* RIGHT: spotlight, insights, calendar */}
        <div className="xl:col-span-5 space-y-8">
          <CandidateSpotlight
            candidate={topCandidate}
            onViewProfile={() => navigate('/recruiter/talent-pool')}
          />
          <AiHiringInsights
            metrics={metrics}
            topMissingSkills={data?.top_missing_skills || []}
            trendingSkills={data?.trending_skills || []}
            candidates={candidatesCount}
            analyses={analysesCount}
          />
          <HiringCalendar refreshToken={actionToken} />
        </div>
      </div>

      {/* ── Sourcing activity ── */}
      <SourcingActivityFeed refreshToken={actionToken} />

      {/* ── Talent Benchmarking ── */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white tracking-tight">Talent Benchmarking</h3>
            <p className="text-xs text-(--text-muted) uppercase tracking-[0.2em] font-bold">
              Top Match: {topCandidate?.score ?? 0}%
            </p>
          </div>
          <div className="relative w-full sm:w-80 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-(--text-muted) group-focus-within:text-(--accent) transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Filter by name…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-(--surface-elevated) border border-(--border) rounded-2xl py-3 pl-12 pr-6 text-sm text-white focus:border-(--accent)/40 outline-none transition-all shadow-xl placeholder:text-(--text-muted)"
            />
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <EmptyState
            icon={isEmptyAccount ? Briefcase : Users}
            title={isEmptyAccount ? 'Welcome — nothing here yet' : 'No Candidates Found'}
            description={
              searchTerm
                ? `No candidates match "${searchTerm}".`
                : isEmptyAccount
                  ? 'Your dashboard is at zero because no work has happened yet. Publish a job description, then candidates appear here as they are analyzed.'
                  : 'No candidate data available yet.'
            }
            action={
              isEmptyAccount ? (
                <button
                  type="button"
                  onClick={openOnboarding}
                  className="px-6 py-2.5 bg-(--primary) text-white rounded-xl font-bold hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(0,243,255,0.3)]"
                >
                  Complete Hiring Profile
                </button>
              ) : null
            }
          />
        ) : (
          <Table columns={tableColumns} data={filteredCandidates} />
        )}
      </div>

      {/* ── Onboarding (new accounts) ── */}
      <AnimatePresence>
        {showOnboarding && !profileLoading && (
          <RecruiterOnboarding
            profile={profile}
            onProfileSaved={setProfile}
            onSkip={dismissOnboarding}
          />
        )}
      </AnimatePresence>

      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </MotionWrapper>
  );
}
