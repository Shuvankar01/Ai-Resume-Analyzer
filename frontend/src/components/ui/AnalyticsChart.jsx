import { memo, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, LineChart, Line, PieChart, Pie, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';
import { BarChart2 } from 'lucide-react';

const PALETTE = ['#00f3ff', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#f43f5e'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0a0a0f]/95 border border-[var(--border)] rounded-2xl px-4 py-3 shadow-2xl text-sm">
        <p className="text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-widest mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color || p.stroke || PALETTE[0] }} className="font-bold">
            {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Bar Chart ────────────────────────────────────────────────────
const AnalyticsBar = memo(function AnalyticsBar({ data, dataKey = 'count', nameKey = 'skill' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          dataKey={nameKey}
          type="category"
          stroke="var(--text-muted)"
          width={110}
          axisLine={false}
          tickLine={false}
          fontSize={11}
          fontWeight={700}
          tick={{ fill: 'rgba(255,255,255,0.5)' }}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
        <Bar dataKey={dataKey} radius={[0, 6, 6, 0]} barSize={20}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});

// ─── Area Chart ────────────────────────────────────────────────────
const AnalyticsArea = memo(function AnalyticsArea({ data, dataKey = 'value', nameKey = 'name', color = '#00f3ff' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey={nameKey}
          stroke="rgba(255,255,255,0.2)"
          fontSize={10}
          axisLine={false}
          tickLine={false}
        />
        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          fill="url(#areaGrad)"
          dot={{ fill: color, strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: color }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

// ─── Line Chart ────────────────────────────────────────────────────
const AnalyticsLine = memo(function AnalyticsLine({ data, dataKey = 'value', nameKey = 'name', color = '#3b82f6' }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey={nameKey}
          stroke="rgba(255,255,255,0.2)"
          fontSize={10}
          axisLine={false}
          tickLine={false}
        />
        <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          dot={{ fill: color, strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

// ─── Main Export ────────────────────────────────────────────────────
const AnalyticsChart = memo(function AnalyticsChart({
  type = 'bar',       // 'bar' | 'area' | 'line'
  data = [],
  dataKey = 'count',
  nameKey = 'skill',
  color = '#00f3ff',
  title,
  subtitle,
  height = 280,
  loading = false,
  className = '',
}) {
  if (loading) return <Skeleton.Chart height={height} />;

  const isEmpty = !data || data.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`card-glass rounded-3xl p-6 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
          {subtitle && <p className="text-xs text-[var(--text-muted)] mt-0.5">{subtitle}</p>}
        </div>
      )}

      {isEmpty ? (
        <EmptyState
          icon={BarChart2}
          title="No Data Available"
          description="Data will appear here once candidates are analyzed."
        />
      ) : (
        <div style={{ height }}>
          {type === 'bar' && <AnalyticsBar data={data} dataKey={dataKey} nameKey={nameKey} />}
          {type === 'area' && <AnalyticsArea data={data} dataKey={dataKey} nameKey={nameKey} color={color} />}
          {type === 'line' && <AnalyticsLine data={data} dataKey={dataKey} nameKey={nameKey} color={color} />}
        </div>
      )}
    </motion.div>
  );
});

export default AnalyticsChart;
