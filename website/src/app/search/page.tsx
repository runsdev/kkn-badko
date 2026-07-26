import type { Metadata } from "next";
import Link from "next/link";
import ErrorState from "@/components/ErrorState";
import PostCard from "@/components/PostCard";
import { searchPosts } from "@/lib/blogger";
import type { PostSummary } from "@/lib/types";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export const metadata: Metadata = { title: "Search" };

// WF-04: search results (FEAT-005). Dynamic per query (route map).
export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  // FR-013 server-side guard (the client guard lives in SearchBox)
  if (!query) {
    return (
      <>
        <h1 className="mb-4 text-2xl font-bold">Search</h1>
        <p className="opacity-80">Please enter a search term in the box above.</p>
      </>
    );
  }

  let posts: PostSummary[];
  try {
    posts = await searchPosts(query);
  } catch {
    return <ErrorState retryHref={`/search?q=${encodeURIComponent(query)}`} />;
  }
  return (
    <>
      {/* query echoed via JSX → HTML-escaped (FR-014) */}
      <h1 className="mb-6 text-2xl font-bold">
        Results for: &ldquo;{query}&rdquo;{" "}
        <span className="text-base font-normal opacity-70">
          — {posts.length} post{posts.length === 1 ? "" : "s"} found
        </span>
      </h1>
      {posts.length === 0 ? (
        // FR-015: defined no-results state with a recovery action
        <div className="py-16 text-center">
          <p className="opacity-80">No posts match your search.</p>
          <p className="mt-2 opacity-80">
            Try a different keyword, or{" "}
            <Link href="/" className="underline">
              browse all posts
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
