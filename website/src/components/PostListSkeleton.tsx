// WF-07a: card-shaped placeholders sized like real PostCards so content
// arrival causes no layout shift (CLS ≤ 0.1, NFR-001).
export default function PostListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-border bg-surface/40 p-5">
          <div className="h-5 w-2/3 rounded bg-border" />
          <div className="mt-3 h-3 w-1/3 rounded bg-border" />
          <div className="mt-4 h-3 w-full rounded bg-border" />
          <div className="mt-1.5 h-3 w-5/6 rounded bg-border" />
        </div>
      ))}
    </div>
  );
}
