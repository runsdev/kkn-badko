import PostListSkeleton from "@/components/PostListSkeleton";

// WF-07a. Scoped to list segments only: a root-level loading boundary would
// make Next.js stream a 200 shell for every route, turning the 404s of
// /posts/[slug] and /about into soft 404s (FR-010 requires a real status).
export default function Loading() {
  return <PostListSkeleton count={3} />;
}
