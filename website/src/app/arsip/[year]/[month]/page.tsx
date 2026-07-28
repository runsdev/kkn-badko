import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import PostCard from "@/components/PostCard";
import Shell from "@/components/Shell";
import Transition from "@/components/Transition";
import { monthsByYear, postsInMonth } from "@/lib/archive";
import { listArchiveIndex } from "@/lib/blogger";
import { monthLong } from "@/lib/format";
import type { PostSummary } from "@/lib/types";

interface Props {
  params: Promise<{ year: string; month: string }>;
}

/**
 * Strict, zero-padded params only.
 *
 * Same lesson as `/page/[n]`: a loose `Number()` check let `0x2` and `1e1`
 * through as real page numbers. Here the canonical form is `/arsip/2010/11`,
 * so `2010/1` and `2010/013` are rejected rather than silently accepted as
 * duplicates of a valid month.
 */
function parseMonth(year: string, month: string): { year: number; month: number } | null {
  if (!/^(?:19|20)\d{2}$/.test(year)) return null;
  if (!/^(?:0[1-9]|1[0-2])$/.test(month)) return null;
  return { year: Number(year), month: Number(month) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { year, month } = await params;
  const parsed = parseMonth(year, month);
  if (!parsed) return { title: "Arsip tidak ditemukan", robots: { index: false, follow: true } };
  const label = monthLong(parsed.year, parsed.month);
  return {
    title: `Arsip ${label}`,
    description: `Catatan Badko TPA Moyudan yang diterbitkan pada ${label}.`,
    alternates: { canonical: `/arsip/${year}/${month}` },
  };
}

// WF-10 (D-07): the native equivalent of Blogger's BlogArchive gadget — one
// month of the archive, linkable, the way the sidebar gadget's links behave.
export default async function MonthArchivePage({ params }: Props) {
  const { year: rawYear, month: rawMonth } = await params;
  const parsed = parseMonth(rawYear, rawMonth);
  if (!parsed) notFound();

  let index: PostSummary[];
  try {
    // Same cached walk the home page uses — a month costs no extra API call.
    index = await listArchiveIndex();
  } catch {
    return (
      <Shell className="py-24">
        <ErrorState level={1} retryHref={`/arsip/${rawYear}/${rawMonth}`} />
      </Shell>
    );
  }

  const posts = postsInMonth(index, parsed.year, parsed.month);
  const label = monthLong(parsed.year, parsed.month);

  // Adjacent months that actually have posts, so prev/next never lands on an
  // empty page. Ordered sequence, so the slides are directional.
  const all = monthsByYear(index).flatMap((g) => g.months);
  const at = all.findIndex((m) => m.year === rawYear && m.month === parsed.month);
  const newer = at > 0 ? all[at - 1] : undefined;
  const older = at >= 0 && at < all.length - 1 ? all[at + 1] : undefined;

  return (
    <Transition>
      <Shell className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[1px] text-slate">Arsip</p>
            <h1 className="mt-2 flex flex-wrap items-baseline gap-x-3 text-3xl font-semibold tracking-[-0.5px] text-ink sm:text-[42px]">
              {label}
              <span className="tabular text-lg font-normal text-slate">{posts.length} catatan</span>
            </h1>
          </header>

          <div className="mt-10">
            {posts.length === 0 ? (
              // A valid month with nothing in it is an empty state, not a 404 —
              // the same rule FR-012 sets for an empty label.
              <EmptyState message={`Tidak ada catatan yang diterbitkan pada ${label}.`} />
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

          <nav
            aria-label="Bulan lain"
            className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6 text-sm"
          >
            {newer ? (
              <Link
                href={newer.href}
                transitionTypes={["nav-back"]}
                className="rounded-md border border-hairline-strong px-3 py-2 font-medium text-ink transition-colors duration-150 hover:border-primary hover:text-primary"
              >
                &larr; {monthLong(newer.year, newer.month)}
              </Link>
            ) : (
              <span className="rounded-md border border-dashed border-hairline-strong px-3 py-2 text-slate">
                Bulan terbaru
              </span>
            )}

            <Link
              href="/arsip#bentuk-arsip"
              className="font-medium text-link-pressed underline decoration-1 underline-offset-2 transition-colors duration-150 hover:text-ink"
            >
              Semua bulan
            </Link>

            {older ? (
              <Link
                href={older.href}
                transitionTypes={["nav-forward"]}
                className="rounded-md border border-hairline-strong px-3 py-2 font-medium text-ink transition-colors duration-150 hover:border-primary hover:text-primary"
              >
                {monthLong(older.year, older.month)} &rarr;
              </Link>
            ) : (
              <span className="rounded-md border border-dashed border-hairline-strong px-3 py-2 text-slate">
                Bulan terlama
              </span>
            )}
          </nav>
        </div>
      </Shell>
    </Transition>
  );
}
