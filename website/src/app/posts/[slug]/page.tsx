import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ErrorState from "@/components/ErrorState";
import { getPostBySlug, getPostComments } from "@/lib/blogger";
import { formatDate } from "@/lib/format";
import { SITE_NAME, siteUrl } from "@/lib/site";
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
      alternates: { canonical: `/posts/${post.slug}` },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article",
        publishedTime: post.published,
        url: `/posts/${post.slug}`,
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

  // NFR-015: JSON-LD BlogPosting
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.published,
    description: post.excerpt,
    author: post.author ? { "@type": "Person", name: post.author } : undefined,
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${siteUrl()}/posts/${post.slug}`,
  };

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{post.title}</h1>
      <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted">
        <time dateTime={post.published}>{formatDate(post.published)}</time>
        {post.author && <span>&middot; by {post.author}</span>}
        {post.labels.map((label) => (
          <Link
            key={label}
            href={`/labels/${encodeURIComponent(label)}`}
            className="rounded-full border border-border px-2.5 py-0.5 text-xs transition-colors hover:border-accent hover:text-accent"
          >
            {label}
          </Link>
        ))}
      </p>
      {/* body sanitized in the service layer before it reaches this prop — FR-008 */}
      <div
        className="prose prose-neutral mt-8 max-w-none dark:prose-invert prose-a:text-accent"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {comments !== null && (
        <section className="mt-12 border-t border-border pt-6" aria-labelledby="comments-heading">
          <h2 id="comments-heading" className="text-lg font-semibold">
            Comments ({comments.length})
          </h2>
          {comments.length === 0 ? (
            <p className="mt-2 text-sm text-muted">No comments yet.</p>
          ) : (
            <ul className="mt-4 space-y-4">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-lg border border-border bg-surface/40 p-4 text-sm"
                >
                  <p className="font-medium">
                    {comment.author}{" "}
                    <span className="font-normal text-muted">
                      &middot;{" "}
                      <time dateTime={comment.published}>{formatDate(comment.published)}</time>
                    </span>
                  </p>
                  <div
                    className="prose prose-sm prose-neutral mt-1.5 max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
                  />
                </li>
              ))}
            </ul>
          )}
          {/* WF-02 (5): deliberately no comment form (FR-017) */}
          <p className="mt-4 text-xs text-muted">Comments are managed in Blogger.</p>
        </section>
      )}

      <p className="mt-12">
        <Link href="/" className="text-accent underline underline-offset-4 hover:text-accent-hover">
          &larr; Back to all posts
        </Link>
      </p>
    </article>
  );
}
