import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ErrorState from "@/components/ErrorState";
import { getPostBySlug, getPostComments } from "@/lib/blogger";
import { formatDate } from "@/lib/format";
import type { Post } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

// FR-009 / NFR-015: title, description, Open Graph from the post itself.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    if (!post) return {};
    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article",
        publishedTime: post.published,
      },
    };
  } catch {
    return {};
  }
}

// WF-02: post detail + read-only native comments (FEAT-003/006).
export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  let post: Post | null;
  try {
    post = await getPostBySlug(slug);
  } catch {
    return <ErrorState retryHref={`/posts/${slug}`} />;
  }
  if (!post) notFound(); // FR-010: unknown slug is a real 404

  const comments = await getPostComments(post.id); // null → hide block (§3.2.6)

  return (
    <article>
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm opacity-70">
        <time dateTime={post.published}>{formatDate(post.published)}</time>
        {post.author && <span>&middot; by {post.author}</span>}
        {post.labels.map((label) => (
          <Link
            key={label}
            href={`/labels/${encodeURIComponent(label)}`}
            className="rounded border border-foreground/30 px-2 py-0.5 text-xs hover:underline"
          >
            {label}
          </Link>
        ))}
      </p>
      {/* body sanitized in the service layer before it reaches this prop — FR-008 */}
      <div className="post-content mt-6" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

      {comments !== null && (
        <section
          className="mt-10 border-t border-foreground/20 pt-6"
          aria-labelledby="comments-heading"
        >
          <h2 id="comments-heading" className="text-lg font-semibold">
            Comments ({comments.length})
          </h2>
          {comments.length === 0 ? (
            <p className="mt-2 text-sm opacity-70">No comments yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {comments.map((comment) => (
                <li key={comment.id} className="rounded border border-foreground/20 p-3 text-sm">
                  <p className="font-medium">
                    {comment.author}{" "}
                    <span className="font-normal opacity-70">
                      &middot;{" "}
                      <time dateTime={comment.published}>{formatDate(comment.published)}</time>
                    </span>
                  </p>
                  <div className="mt-1" dangerouslySetInnerHTML={{ __html: comment.contentHtml }} />
                </li>
              ))}
            </ul>
          )}
          {/* WF-02 (5): deliberately no comment form (FR-017) */}
          <p className="mt-4 text-xs opacity-70">Comments are managed in Blogger.</p>
        </section>
      )}

      <p className="mt-10">
        <Link href="/" className="underline">
          &larr; Back to all posts
        </Link>
      </p>
    </article>
  );
}
