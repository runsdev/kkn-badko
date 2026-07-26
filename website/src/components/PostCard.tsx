import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { PostSummary } from "@/lib/types";

// WF-01 post card: title → detail (FR-007), date, label chips (FR-011),
// plain-text excerpt clamped to 3 lines (FR-001).
export default function PostCard({ post }: { post: PostSummary }) {
  return (
    <article className="rounded border border-foreground/20 p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-lg font-semibold">
          <Link href={`/posts/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h2>
        <time dateTime={post.published} className="shrink-0 text-sm opacity-70">
          {formatDate(post.published)}
        </time>
      </div>
      {post.labels.length > 0 && (
        <p className="mt-1 flex flex-wrap gap-2">
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
      )}
      {post.excerpt && <p className="mt-2 line-clamp-3 text-sm opacity-80">{post.excerpt}</p>}
    </article>
  );
}
