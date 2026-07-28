import { ViewTransition } from "react";
import PostListSkeleton from "@/components/PostListSkeleton";
import Shell from "@/components/Shell";

// WF-07a. Scoped to list segments only: a root-level loading boundary would
// make Next.js stream a 200 shell for every route, turning the 404s of
// /posts/[slug] and /about into soft 404s (FR-010 requires a real status).
//
// loading.tsx is an implicit <Suspense> boundary, so wrapping the skeleton in
// an exiting ViewTransition pairs it with the page's `enter="slide-up"`: the
// placeholder yields downward, the real content arrives upward.
export default function Loading() {
  return (
    <ViewTransition exit="slide-down" default="none">
      <Shell className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <p role="status" className="sr-only">
            Memuat catatan…
          </p>
          <div aria-hidden className="h-10 w-72 animate-pulse rounded bg-surface" />
          <div className="mt-10">
            <PostListSkeleton count={4} />
          </div>
        </div>
      </Shell>
    </ViewTransition>
  );
}
