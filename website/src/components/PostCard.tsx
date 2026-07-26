import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { PostSummary } from "@/lib/types";

// WF-01 post card: title → detail (FR-007), date, label chips (FR-011),
// plain-text excerpt clamped to 3 lines (FR-001).
export default function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="rounded-lg border border-border bg-surface/40 p-5 transition-colors hover:border-accent/60">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-semibold leading-snug">
          <Link href={`/posts/${post.slug}`} className="hover:text-accent">
            {post.title}
          </Link>
        </h2>
        <time dateTime={post.published} className="shrink-0 text-sm text-muted">
          {formatDate(post.published)}
        </time>
      </div>
      {post.labels.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-1.5">
          {post.labels.map((label) => (
            <Link
              key={label}
              href={`/labels/${encodeURIComponent(label)}`}
              className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {label}
            </Link>
          ))}
        </p>
      )}
      {post.excerpt && (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
      )}
    </article>
  );
}
