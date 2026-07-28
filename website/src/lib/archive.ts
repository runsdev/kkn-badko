// Derived views over the archive index — everything WF-08 needs, computed in
// memory from one cached API call (blogger.listArchiveIndex).
//
// The numbers on the home page are the archive describing itself, so they are
// always derived, never hardcoded. If a post is published in Blogger tomorrow
// the hero counts and the timeline move with it.

import { monthOf, yearOf } from "@/lib/format";
import { LABEL_ORDER } from "@/lib/labels";
import type { PostSummary } from "@/lib/types";

export interface MonthCount {
  year: string;
  /** 1–12. */
  month: number;
  count: number;
  /** Zero-padded, so `/arsip/2009/07` rather than `/arsip/2009/7`. */
  href: string;
}

/** One year's months, newest year first, months newest first within it. */
export interface YearGroup {
  year: string;
  count: number;
  months: MonthCount[];
}

export interface Contributor {
  name: string;
  count: number;
}

export interface LabelCount {
  label: string;
  count: number;
}

export interface YearCount {
  year: string;
  count: number;
}

export interface ArchiveShape {
  total: number;
  labels: LabelCount[];
  years: YearCount[];
  /** Inclusive span of the archive, e.g. "2009–2011". Empty when no posts. */
  span: string;
}

function hasLabel(post: PostSummary, label: string): boolean {
  return post.labels.some((l) => l.toUpperCase() === label.toUpperCase());
}

/** Posts carrying a label, newest-first (the index already is). */
export function byLabel(posts: PostSummary[], ...labels: string[]): PostSummary[] {
  return posts.filter((p) => labels.some((l) => hasLabel(p, l)));
}

/**
 * Counts for the six hero dots. Taxonomy order first (so the legend is stable
 * and reads largest-first), then any label an editor added later, so a new
 * Blogger label still shows up instead of vanishing.
 */
export function labelCounts(posts: PostSummary[]): LabelCount[] {
  const tally = new Map<string, number>();
  for (const post of posts) {
    for (const raw of post.labels) {
      const label = raw.trim().toUpperCase();
      tally.set(label, (tally.get(label) ?? 0) + 1);
    }
  }

  const known = LABEL_ORDER.filter((l) => tally.has(l)).map((l) => ({
    label: l as string,
    count: tally.get(l)!,
  }));
  const extra = [...tally.keys()]
    .filter((l) => !LABEL_ORDER.includes(l as (typeof LABEL_ORDER)[number]))
    .sort()
    .map((label) => ({ label, count: tally.get(label)! }));

  return [...known, ...extra];
}

/**
 * Posts per year, oldest-first, with no gaps — a year in the middle of the
 * span with nothing published still gets a zero bar, because a gap is part of
 * what the timeline is saying.
 */
export function yearCounts(posts: PostSummary[]): YearCount[] {
  if (posts.length === 0) return [];

  const tally = new Map<number, number>();
  for (const post of posts) {
    // same timezone the year is displayed in, so buckets and labels agree
    const year = yearOf(post.published);
    if (Number.isNaN(year)) continue;
    tally.set(year, (tally.get(year) ?? 0) + 1);
  }
  if (tally.size === 0) return [];

  const years = [...tally.keys()];
  const from = Math.min(...years);
  const to = Math.max(...years);

  const out: YearCount[] = [];
  for (let y = from; y <= to; y++) {
    out.push({ year: String(y), count: tally.get(y) ?? 0 });
  }
  return out;
}

/**
 * Months that actually have posts, grouped under their year — the native
 * equivalent of Blogger's BlogArchive gadget.
 *
 * Unlike `yearCounts`, empty months are **omitted** rather than shown as zero
 * rows. A silent year inside the span says something ("the archive went quiet");
 * eleven empty months inside a year say nothing and would bury the one month
 * that holds 21 posts. Years are still gap-preserved by `yearCounts`.
 */
export function monthsByYear(posts: PostSummary[]): YearGroup[] {
  const tally = new Map<string, number>();
  for (const post of posts) {
    const year = yearOf(post.published);
    const month = monthOf(post.published);
    if (Number.isNaN(year) || Number.isNaN(month)) continue;
    const key = `${year}-${String(month).padStart(2, "0")}`;
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }

  const groups = new Map<string, YearGroup>();
  // sort descending so both years and months read newest-first
  for (const key of [...tally.keys()].sort().reverse()) {
    const [year, mm] = key.split("-");
    const group = groups.get(year) ?? { year, count: 0, months: [] };
    const count = tally.get(key)!;
    group.months.push({ year, month: Number(mm), count, href: `/arsip/${year}/${mm}` });
    group.count += count;
    groups.set(year, group);
  }
  return [...groups.values()];
}

/** Posts published in a given year and month, newest first. */
export function postsInMonth(posts: PostSummary[], year: number, month: number): PostSummary[] {
  return posts.filter((p) => yearOf(p.published) === year && monthOf(p.published) === month);
}

/**
 * Distinct post authors with counts — the native equivalent of Blogger's
 * Profile / "Kontributor" gadget.
 *
 * Derived from post authorship rather than from the blog's member list, which
 * is the truthful source: Blogger lists everyone with access, including
 * accounts that have never published. Blank authors are dropped rather than
 * shown as an empty row.
 */
export function contributors(posts: PostSummary[]): Contributor[] {
  const tally = new Map<string, number>();
  for (const post of posts) {
    const name = (post.author ?? "").trim();
    if (!name) continue;
    tally.set(name, (tally.get(name) ?? 0) + 1);
  }
  return [...tally.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function archiveShape(posts: PostSummary[]): ArchiveShape {
  const years = yearCounts(posts);
  const span =
    years.length === 0
      ? ""
      : years.length === 1
        ? years[0].year
        : `${years[0].year}–${years[years.length - 1].year}`;

  return { total: posts.length, labels: labelCounts(posts), years, span };
}
