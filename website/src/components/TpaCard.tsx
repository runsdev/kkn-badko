import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { labelStyle } from "@/lib/labels";
import type { TpaEntry } from "@/lib/tpa";

/**
 * One TPA in the directory (WF-09). Village as a presentational eyebrow, the
 * centre's full name as the title.
 *
 * The eyebrow is `aria-hidden` and the link carries the full title as its
 * accessible name, because the village is derived from the title by a
 * heuristic that deliberately gives up when unsure (see lib/tpa.ts) — it is a
 * visual aid, never the record.
 *
 * `morph` is on by default here: the photo travelling from tile to detail hero
 * is the archive's signature interaction. The home page's board and /tpa are
 * different pages, so the shared name is never mounted twice.
 */
export default function TpaCard({
  entry,
  morph = true,
  level = 2,
  eager = false,
}: {
  entry: TpaEntry;
  morph?: boolean;
  /** h3 when the card sits under a section heading, h2 when under a page h1. */
  level?: 2 | 3;
  /**
   * These photos are the LCP candidate on both the home board and /tpa, so the
   * first row must not be lazy. Only the first few entries should set this.
   */
  eager?: boolean;
}) {
  const { post, name, village } = entry;
  const tint = labelStyle("FOTO").tint;
  const Heading = level === 2 ? "h2" : "h3";

  const photo = post.image && (
    <Image
      src={post.image}
      alt=""
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
    />
  );

  return (
    <Link
      href={`/posts/${post.slug}`}
      aria-label={name}
      transitionTypes={["nav-forward"]}
      className="lift block overflow-hidden rounded-lg border border-hairline bg-canvas"
    >
      <article>
        <div className="relative aspect-4/3 w-full overflow-hidden" style={{ background: tint }}>
          {morph && post.image ? (
            <ViewTransition name={`post-img-${post.id}`} share="morph" default="none">
              {photo}
            </ViewTransition>
          ) : (
            photo
          )}
          {!post.image && (
            <span className="absolute inset-0 grid place-items-center text-[13px] font-medium text-teal-deep">
              Tanpa foto
            </span>
          )}
        </div>
        <div className="p-4">
          {village && (
            <p
              aria-hidden="true"
              className="text-[11px] font-semibold uppercase tracking-[1px] text-teal-deep"
            >
              {village}
            </p>
          )}
          <Heading className="mt-1 text-[15px] font-semibold leading-snug text-ink">{name}</Heading>
        </div>
      </article>
    </Link>
  );
}
