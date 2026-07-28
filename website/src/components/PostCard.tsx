import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import LabelChip from "@/components/LabelChip";
import { formatDate } from "@/lib/format";
import { labelStyle, primaryLabel } from "@/lib/labels";
import type { PostSummary } from "@/lib/types";

/**
 * The archive's repeated unit — home feed, /page/[n], /labels, /search.
 *
 * WF-01 requires all four FR-001 slots (title, date, primary label, excerpt)
 * and, per WF-00 (1), that the **whole card is one link target / one tab
 * stop**. That is why the label is a static chip here rather than a link: a
 * chip per label would add a tab stop per label, and a link inside a link is
 * invalid markup anyway. Labels stay navigable from the detail page and the
 * label switcher.
 *
 * The link carries an explicit `aria-label` so its accessible name is the post
 * title rather than the card's entire text content, which is what a bare
 * wrapping link would produce.
 *
 * `morph` opts the card into the shared-element transition into the detail
 * page. It defaults to off because only one view transition with a given name
 * may be mounted at a time, and on the home page the same post can appear in
 * both a curated section and the Terbaru feed. Exactly one surface per page
 * may enable it.
 */
export default function PostCard({
  post,
  level = 2,
  morph = false,
  tint = false,
}: {
  post: PostSummary;
  level?: 2 | 3;
  morph?: boolean;
  /** Fill the card with its label's pastel tint (DESIGN.md card-feature-*). */
  tint?: boolean;
}) {
  const label = primaryLabel(post.labels);
  const style = label ? labelStyle(label) : undefined;
  const accent = style?.accent ?? "var(--hairline-strong)";
  const Heading = level === 2 ? "h2" : "h3";

  const title = (
    <Heading className="text-[17px] font-semibold leading-snug text-ink">{post.title}</Heading>
  );

  const thumb = post.image && (
    <Image src={post.image} alt="" fill sizes="128px" className="object-cover" loading="lazy" />
  );

  return (
    <Link
      href={`/posts/${post.slug}`}
      aria-label={post.title}
      transitionTypes={["nav-forward"]}
      className={`lift block rounded-lg border p-4 sm:p-5 ${
        tint ? "border-transparent" : "border-hairline bg-canvas"
      }`}
      style={tint ? { background: style?.tint ?? "var(--tint-gray)" } : undefined}
    >
      <article className="flex gap-4">
        {post.image && (
          <div
            className="relative hidden aspect-4/3 w-32 shrink-0 overflow-hidden rounded-md border border-black/5 sm:block"
            style={{ background: tint ? "var(--canvas)" : (style?.tint ?? "var(--tint-gray)") }}
          >
            {morph ? (
              <ViewTransition name={`post-img-${post.id}`} share="morph" default="none">
                {thumb}
              </ViewTransition>
            ) : (
              thumb
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {/* On a tinted card the chip would be tint-on-tint, so the label
                becomes an eyebrow in the label's own text tone instead — the
                card's colour is already carrying the label. */}
            {label &&
              (tint ? (
                <span
                  className="text-[11px] font-semibold uppercase tracking-[1px]"
                  style={{ color: style?.deep }}
                >
                  {style?.display}
                </span>
              ) : (
                <LabelChip label={label} />
              ))}
            <time
              dateTime={post.published}
              className="tabular text-[13px]"
              style={tint ? { color: style?.deep } : undefined}
            >
              {formatDate(post.published)}
            </time>
          </div>

          <div className="mt-2">
            {morph ? (
              <ViewTransition name={`post-title-${post.id}`} share="text-morph" default="none">
                {title}
              </ViewTransition>
            ) : (
              title
            )}
          </div>

          {post.excerpt && (
            <p
              className="mt-2 line-clamp-3 text-sm leading-relaxed"
              style={{ color: tint ? "var(--charcoal)" : "var(--slate)" }}
            >
              {post.excerpt}
            </p>
          )}

          <span
            aria-hidden="true"
            className="mt-3 inline-block h-0.5 w-8 rounded-full"
            style={{ background: accent }}
          />
        </div>
      </article>
    </Link>
  );
}
