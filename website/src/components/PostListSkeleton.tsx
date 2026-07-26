// WF-07a: card-shaped placeholders sized like real PostCards so content
// arrival causes no layout shift (CLS ≤ 0.1, NFR-001).
export default function PostListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse rounded border border-foreground/10 p-4">
          <div className="h-5 w-2/3 rounded bg-foreground/10" />
          <div className="mt-2 h-3 w-1/3 rounded bg-foreground/10" />
          <div className="mt-3 h-3 w-full rounded bg-foreground/10" />
          <div className="mt-1 h-3 w-5/6 rounded bg-foreground/10" />
        </div>
      ))}
    </div>
  );
}
