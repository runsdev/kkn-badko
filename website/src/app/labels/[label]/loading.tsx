import { ViewTransition } from "react";
import PostListSkeleton from "@/components/PostListSkeleton";
import Shell from "@/components/Shell";

// WF-07a (see page/[n]/loading.tsx for why this is per-segment)
export default function Loading() {
  return (
    <ViewTransition exit="slide-down" default="none">
      <Shell className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <p role="status" className="sr-only">
            Memuat catatan…
          </p>
          <div aria-hidden className="h-10 w-64 animate-pulse rounded bg-surface" />
          {/* the pill row is part of the box the content lands in — reserving
              it keeps the switcher from shifting when results arrive */}
          <div aria-hidden className="mt-8 flex gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-surface" />
            ))}
          </div>
          <div className="mt-8">
            <PostListSkeleton count={3} />
          </div>
        </div>
      </Shell>
    </ViewTransition>
  );
}
