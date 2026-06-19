export default function Skeleton({ className, count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`bg-white/5 animate-pulse rounded-md ${className}`}
        />
      ))}
    </>
  );
}

// ── Preset: Generic Card ─────────────────────────────────────────
Skeleton.Card = () => (
  <div className="card-glass p-8 rounded-3xl space-y-4">
    <Skeleton className="w-12 h-12 rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="w-1/2 h-4" />
      <Skeleton className="w-3/4 h-8" />
    </div>
  </div>
);

// ── Preset: Table ────────────────────────────────────────────────
Skeleton.Table = () => (
  <div className="space-y-4">
    <Skeleton className="w-full h-10 rounded-lg" />
    <Skeleton className="w-full h-16 rounded-xl" count={5} />
  </div>
);

// ── Preset: Chart ────────────────────────────────────────────────
Skeleton.Chart = ({ height = 280 }) => (
  <div className="card-glass rounded-3xl p-6 space-y-4">
    <div className="space-y-2">
      <Skeleton className="w-40 h-5 rounded-lg" />
      <Skeleton className="w-64 h-3 rounded-md" />
    </div>
    <Skeleton className="w-full rounded-2xl" style={{ height }} />
  </div>
);

// ── Preset: Candidate Card ────────────────────────────────────────
Skeleton.CandidateCard = () => (
  <div className="card-glass rounded-3xl p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-14 h-14 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-3/4 h-4 rounded-lg" />
        <Skeleton className="w-1/2 h-3 rounded-md" />
      </div>
      <Skeleton className="w-16 h-16 rounded-full shrink-0" />
    </div>
    <Skeleton className="w-full h-2 rounded-full" />
    <div className="flex justify-between">
      <Skeleton className="w-20 h-3 rounded-md" />
      <Skeleton className="w-16 h-3 rounded-md" />
    </div>
  </div>
);

// ── Preset: Radar ────────────────────────────────────────────────
Skeleton.Radar = () => (
  <div className="card-glass rounded-3xl p-8 space-y-6">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="w-32 h-5 rounded-lg" />
        <Skeleton className="w-56 h-3 rounded-md" />
      </div>
      <div className="flex gap-6">
        <Skeleton className="w-12 h-10 rounded-xl" />
        <Skeleton className="w-12 h-10 rounded-xl" />
        <Skeleton className="w-12 h-10 rounded-xl" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-8">
      <Skeleton className="w-full h-72 rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="w-full h-24 rounded-2xl" />
        <Skeleton className="w-full h-24 rounded-2xl" />
        <Skeleton className="w-full h-12 rounded-xl" />
      </div>
    </div>
  </div>
);

// ── Preset: Analysis Dashboard ────────────────────────────────────
Skeleton.Dashboard = () => (
  <div className="space-y-8">
    <div className="flex justify-between">
      <div className="space-y-2">
        <Skeleton className="w-64 h-8 rounded-2xl" />
        <Skeleton className="w-96 h-4 rounded-lg" />
      </div>
    </div>
    <div className="grid grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => <Skeleton.Card key={i} />)}
    </div>
    <Skeleton className="w-full h-80 rounded-3xl" />
    <Skeleton.Table />
  </div>
);
