import { redirect } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import Pagination from "@/components/Pagination";
import PostCard from "@/components/PostCard";
import { listPostsPage } from "@/lib/blogger";
import type { PostListResult } from "@/lib/types";

interface Props {
  params: Promise<{ n: string }>;
}

// WF-01: post list, page n (FEAT-002). Page 1 canonicalizes to "/".
export default async function PostListPage({ params }: Props) {
  const { n } = await params;
  const page = Number(n);
  // invalid or page 1 → canonical home; this segment streams behind a
  // loading boundary, so notFound() here could not set a real 404 status
  if (!Number.isInteger(page) || page <= 1) redirect("/");

  let result: PostListResult;
  try {
    result = await listPostsPage(page);
  } catch {
    return <ErrorState retryHref={`/page/${page}`} />;
  }
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Latest posts</h1>
      {result.posts.length === 0 ? (
        // FR-006: out-of-range page is a defined empty state
        <EmptyState message="There are no posts on this page." />
      ) : (
        <div className="space-y-4">
          {result.posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={result.totalPages} />
    </>
  );
}
