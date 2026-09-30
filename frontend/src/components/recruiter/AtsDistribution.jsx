import { useMemo } from 'react';
import { BarChart2 } from 'lucide-react';
import AnalyticsChart from '../ui/AnalyticsChart';
import GlassCard from '../ui/GlassCard';
import EmptyState from '../ui/EmptyState';

const BUCKETS = [
  { range: '0–20%', min: 0, max: 20 },
  { range: '21–40%', min: 21, max: 40 },
  { range: '41–60%', min: 41, max: 60 },
  { range: '61–80%', min: 61, max: 80 },
  { range: '81–100%', min: 81, max: 100 },
];

/**
 * ATS score distribution across the real candidate ranking.
 *
 * Buckets with no candidates are dropped so the chart never shows phantom
 * zeros; an entirely empty pool renders an explanatory empty state.
 */
export default function AtsDistribution({ candidates = [] }) {
  const data = useMemo(() => {
    const buckets = BUCKETS.map((b) => ({ ...b, count: 0 }));
    candidates.forEach((c) => {
      const bucket = buckets.find((b) => c.score >= b.min && c.score <= b.max);
      if (bucket) bucket.count += 1;
    });
    return buckets.filter((b) => b.count > 0).map(({ range, count }) => ({ skill: range, count }));
  }, [candidates]);

  if (data.length === 0) {
    return (
      <GlassCard className="p-8 flex flex-col">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <BarChart2 size={22} className="text-(--primary)" /> ATS Score Distribution
        </h3>
        <EmptyState
          icon={BarChart2}
          title="No ATS distribution yet"
          description="Upload and analyze resumes to see how candidate scores spread across your pool."
        />
      </GlassCard>
    );
  }

  return (
    <AnalyticsChart
      type="bar"
      data={data}
      dataKey="count"
      nameKey="skill"
      title="ATS Score Distribution"
      subtitle="Candidate score spread across ranges"
      height={260}
    />
  );
}
