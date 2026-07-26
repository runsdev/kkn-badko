import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import Pagination from "@/components/Pagination";
import PostCard from "@/components/PostCard";
import { listPostsPage } from "@/lib/blogger";
import type { PostListResult } from "@/lib/types";

// WF-01: home / post list, page 1 (FEAT-001/002), ISR via the service layer.
export default async function HomePage() {
  let result: PostListResult;
  try {
    result = await listPostsPage(1);
  } catch {
    return <ErrorState retryHref="/" />;
  }
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Latest posts</h1>
      {result.posts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {result.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      <Pagination page={1} totalPages={result.totalPages} />
    </>
  );
}
