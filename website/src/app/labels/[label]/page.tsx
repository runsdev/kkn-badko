import type { Metadata } from "next";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import PostCard from "@/components/PostCard";
import { getPostsByLabel } from "@/lib/blogger";
import type { PostSummary } from "@/lib/types";

interface Props {
  params: Promise<{ label: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { label } = await params;
  return { title: `Posts labeled: ${decodeURIComponent(label)}` };
}

// WF-03: label-filtered list (FEAT-004).
export default async function LabelPage({ params }: Props) {
  const { label: rawLabel } = await params;
  const label = decodeURIComponent(rawLabel); // FR-011 / P-5

  let posts: PostSummary[];
  try {
    posts = await getPostsByLabel(label);
  } catch {
    return <ErrorState retryHref={`/labels/${rawLabel}`} />;
  }
  return (
    <>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold">Posts labeled: &ldquo;{label}&rdquo;</h1>
        <Link href="/" className="text-sm underline">
          All posts
        </Link>
      </div>
      {posts.length === 0 ? (
        // FR-012: zero posts is an empty state, not an error
        <EmptyState message={`No posts with the label "${label}" yet.`} />
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
