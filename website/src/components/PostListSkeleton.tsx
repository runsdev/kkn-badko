// WF-07a: card-shaped placeholders sized like real PostCards so content
// arrival causes no layout shift (CLS ≤ 0.1, NFR-001). The box mirrors
// PostCard's border, radius, padding and thumbnail rail exactly.
export default function PostListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-hairline bg-canvas p-4 sm:p-5"
        >
          <div className="flex gap-4">
            <div className="hidden aspect-4/3 w-32 shrink-0 rounded-md bg-surface sm:block" />
            <div className="min-w-0 flex-1">
              <div className="flex gap-3">
                <div className="h-4 w-16 rounded-sm bg-surface" />
                <div className="h-4 w-24 rounded-sm bg-surface" />
              </div>
              <div className="mt-2.5 h-5 w-2/3 rounded bg-surface" />
              <div className="mt-3 h-3 w-full rounded bg-surface" />
              <div className="mt-1.5 h-3 w-5/6 rounded bg-surface" />
              <div className="mt-3 h-0.5 w-8 rounded-full bg-surface" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
