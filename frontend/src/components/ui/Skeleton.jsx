export default function Skeleton({ className, count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className={`bg-white/5 animate-pulse rounded-md ${className}`}
        ></div>
      ))}
    </>
  );
}

// Preset skeletons
Skeleton.Card = () => (
  <div className="card-glass p-8 rounded-3xl space-y-4">
    <Skeleton className="w-12 h-12 rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="w-1/2 h-4" />
      <Skeleton className="w-3/4 h-8" />
    </div>
  </div>
);

Skeleton.Table = () => (
  <div className="space-y-4">
    <Skeleton className="w-full h-10 rounded-lg" />
    <Skeleton className="w-full h-16 rounded-xl" count={5} />
  </div>
);
