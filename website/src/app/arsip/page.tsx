import type { Metadata } from "next";
import ArchiveBoard from "@/components/ArchiveBoard";
import ArchiveStats from "@/components/ArchiveStats";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import Hero from "@/components/Hero";
import Pagination from "@/components/Pagination";
import PostCard from "@/components/PostCard";
import SectionHeader from "@/components/SectionHeader";
import Shell from "@/components/Shell";
import TeachingBand from "@/components/TeachingBand";
import Transition from "@/components/Transition";
import { archiveShape, byLabel, monthsByYear } from "@/lib/archive";
import { listArchiveIndex, listPostsPage } from "@/lib/blogger";
import { labelStyle } from "@/lib/labels";
import { tpaDirectory } from "@/lib/tpa";
import type { PostListResult, PostSummary } from "@/lib/types";

export const metadata: Metadata = {
  title: "Arsip",
  description:
    "Seluruh catatan Badko TPA Moyudan, 2009–2011 — per bulan, per label, dan urut dari yang terbaru.",
  alternates: { canonical: "/arsip" },
};

// WF-08: the archive front door (D-06), moved here from `/` by D-08.
//
// The newest post is from October 2011 and 17 of the 35 are a directory of TPA
// centres, so a bare reverse-chronological list buries the useful part. This
// page leads with what the archive IS, then surfaces the directory, the events,
// and the teaching material — and carries the FR-001…006 feed with its
// pagination rooted here, so `/page/2`'s "newer" link returns to `/arsip`.
export default async function ArchivePage() {
  let index: PostSummary[];
  let listing: PostListResult;
  try {
    // Two cached calls. The index is one request at this size and everything
    // above the feed is derived from it in memory rather than as six separate
    // label queries; the listing is kept so home and /page/[n] compute
    // totalPages from the same source (BR-003, NFR-002).
    [index, listing] = await Promise.all([listArchiveIndex(), listPostsPage(1)]);
  } catch {
    // FR-003 — a defined error state, never a stack trace. Sole content here,
    // so it owns the page's single h1.
    return (
      <Shell className="py-24">
        <ErrorState level={1} retryHref="/arsip" />
      </Shell>
    );
  }

  const shape = archiveShape(index);
  const months = monthsByYear(index);
  const directory = tpaDirectory(index);
  const berita = byLabel(index, "BERITA");
  const teaching = byLabel(index, "TIPS", "BCM");

  return (
    <Transition>
      <div>
        <Hero
          labels={shape.labels}
          span={shape.span}
          total={shape.total}
          tpaCount={directory.length}
        />

        {/* Breaks out of the navy band — Hero carries the matching bottom pad. */}
        {directory.length > 0 && <ArchiveBoard entries={directory} total={directory.length} />}

        <ArchiveStats shape={shape} months={months} />

        {berita.length > 0 && (
          <Shell className="mt-20">
            <section aria-labelledby="kabar">
              <SectionHeader
                id="kabar"
                title="Kabar & kegiatan"
                count={berita.length}
                blurb={labelStyle("BERITA").blurb}
                accent={labelStyle("BERITA").accent}
                href="/labels/BERITA"
                hrefLabel="Semua berita"
              />
              <ul className="grid gap-4 lg:grid-cols-2">
                {berita.slice(0, 4).map((post) => (
                  <li key={post.id}>
                    <PostCard post={post} level={3} tint />
                  </li>
                ))}
              </ul>
            </section>
          </Shell>
        )}

        <TeachingBand posts={teaching} />

        <Shell className="mt-20">
          {/* id here is the hero's "Telusuri arsip" scroll target; the heading
              owns a separate id so the two never collide */}
          <section aria-labelledby="terbaru-heading" id="terbaru">
            <SectionHeader
              id="terbaru-heading"
              title="Seluruh catatan"
              count={shape.total}
              blurb="Urut dari yang terbaru."
            />
            {listing.posts.length === 0 ? (
              <EmptyState />
            ) : (
              <ul className="space-y-4">
                {listing.posts.map((post) => (
                  <li key={post.id}>
                    {/* no `morph`: several of these also appear in the board
                        above, and two mounted transitions may not share a name */}
                    <PostCard post={post} level={3} />
                  </li>
                ))}
              </ul>
            )}
            <Pagination page={1} totalPages={listing.totalPages} />
          </section>
        </Shell>
      </div>
    </Transition>
  );
}
