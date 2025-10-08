export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-40 w-full animate-pulse rounded-xl border border-slate-200 bg-white p-4"
          aria-hidden="true"
        >
          <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-slate-200" />
          <div className="mx-auto h-4 w-24 rounded bg-slate-200" />
          <div className="mx-auto mt-2 h-3 w-32 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
