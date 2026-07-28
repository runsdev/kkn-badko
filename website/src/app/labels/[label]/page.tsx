import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LabelSwitcher from "@/components/LabelSwitcher";
import PostCard from "@/components/PostCard";
import Shell from "@/components/Shell";
import Transition from "@/components/Transition";
import { getPostsByLabel } from "@/lib/blogger";
import { canonicalLabel, labelStyle } from "@/lib/labels";
import type { PostSummary } from "@/lib/types";

interface Props {
  params: Promise<{ label: string }>;
}

/**
 * `decodeURIComponent` throws `URIError` on a malformed escape, and Next does
 * not pre-decode the segment — so `/labels/%` reached it raw and crashed the
 * route with a 500. A malformed label is a bad URL, which is a 404.
 */
function decodeLabel(raw: string): string | null {
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { label } = await params;
  const decoded = decodeLabel(label);
  if (!decoded) return { title: "Label tidak ditemukan" };
  return {
    title: `Label: ${labelStyle(decoded).display}`,
    alternates: { canonical: `/labels/${encodeURIComponent(canonicalLabel(decoded))}` },
  };
}

// WF-03: label-filtered list (FEAT-004).
export default async function LabelPage({ params }: Props) {
  const { label: rawLabel } = await params;
  const decoded = decodeLabel(rawLabel); // FR-011 / P-5
  if (decoded === null || decoded.trim() === "") notFound();

  // Blogger's labels= filter is case-sensitive, so query the taxonomy's own
  // casing rather than whatever casing the URL happened to carry.
  const label = canonicalLabel(decoded);
  const style = labelStyle(label);

  let posts: PostSummary[];
  try {
    posts = await getPostsByLabel(label);
  } catch {
    return (
      <Shell className="py-24">
        <ErrorState level={1} retryHref={`/labels/${rawLabel}`} />
      </Shell>
    );
  }

  return (
    <Transition>
      <Shell className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <header>
            <h1 className="flex flex-wrap items-center gap-x-3 gap-y-2 text-3xl font-semibold tracking-[-0.5px] text-ink sm:text-[42px]">
              <span
                aria-hidden="true"
                className="size-3.5 shrink-0 rounded-full"
                style={{ background: style.accent }}
              />
              {style.display}
              <span className="tabular text-lg font-normal text-slate">{posts.length} catatan</span>
            </h1>
            <p className="mt-3 text-[15px] text-slate">{style.blurb}</p>
          </header>

          <div className="mt-8">
            <LabelSwitcher active={label} />
          </div>

          {/* Switching between sibling labels is a same-route param change, so
              the page stays mounted and the page-level Transition never fires.
              `key` + `name` + `share` is the pattern that works here: the key
              forces a remount, and the shared name pairs the outgoing and
              incoming lists so they crossfade — "same place, different
              content". An `enter` alone does not pair, so the outgoing list
              would simply vanish.

              No per-item ViewTransition inside: each label is a different set
              of posts rather than a reordering of one, so there is no list
              identity to communicate. */}
          <ViewTransition key={label} name="label-results" share="auto" default="none">
            <div className="mt-8">
              {posts.length === 0 ? (
                // FR-012: zero posts is an empty state, not an error
                <EmptyState message={`Belum ada catatan berlabel ${style.display}.`} />
              ) : (
                <ul className="space-y-4">
                  {posts.map((post) => (
                    <li key={post.id}>
                      <PostCard post={post} morph />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </ViewTransition>
        </div>
      </Shell>
    </Transition>
  );
}
