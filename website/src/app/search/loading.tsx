import PostListSkeleton from "@/components/PostListSkeleton";

// WF-07a (see page/[n]/loading.tsx for why this is per-segment)
export default function Loading() {
  return <PostListSkeleton count={3} />;
}
