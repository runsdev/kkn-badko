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
            Memuat hasil pencarian…
          </p>
          <div aria-hidden className="h-10 w-56 animate-pulse rounded bg-surface" />
          <div className="mt-10">
            <PostListSkeleton count={3} />
          </div>
        </div>
      </Shell>
    </ViewTransition>
  );
}
