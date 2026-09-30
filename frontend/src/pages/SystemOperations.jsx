import { Cpu, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MotionWrapper from '../components/ui/MotionWrapper';
import GlassCard from '../components/ui/GlassCard';
import SystemStatus from '../components/ui/SystemStatus';
import ActivityTimeline from '../components/ui/ActivityTimeline';

/**
 * Internal operations view.
 *
 * Infrastructure telemetry (DB/Redis health, queue depth, node status, raw
 * audit log) used to sit on the recruiter dashboard and the profile page. It is
 * not hiring information, so it is consolidated here behind its own route and
 * linked from the recruiter profile rather than shown in-line.
 */
export default function SystemOperations() {
  const navigate = useNavigate();

  return (
    <MotionWrapper variant="page" className="p-4 md:p-8 lg:p-10 max-w-400 mx-auto space-y-8">
      <div className="space-y-1">
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-4">
          System Operations <Cpu className="text-(--primary)" />
        </h2>
        <p className="text-(--text-muted)">
          Internal platform telemetry. Not part of the recruiter or candidate experience.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate('/recruiter')}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--surface-elevated) border border-(--border) text-sm text-gray-300 hover:text-white transition-all"
      >
        <ArrowLeft size={15} /> Back to dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <SystemStatus type="recruiter" />
        </div>
        <div className="lg:col-span-7">
          <ActivityTimeline type="recruiter" />
        </div>
      </div>

      <GlassCard className="p-8">
        <h3 className="text-lg font-bold text-white mb-4">Scope</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          The recruiter dashboard now shows only hiring information: four consolidated KPI cards, the
          pipeline tracker, ATS distribution, skill demand, the candidate spotlight, hiring insights,
          the hiring calendar and the sourcing activity feed. Queue depth, node status and the raw
          audit log stay on this page.
        </p>
      </GlassCard>
    </MotionWrapper>
  );
}
