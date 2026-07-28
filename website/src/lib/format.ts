// Human-readable date per wireframes ("12 Jul 2026"). Fixed locale keeps
// server output deterministic and avoids a hydration mismatch; `id-ID` matches
// the Indonesian interface adopted in D-06.
//
// Four months differ from en-GB — Mei, Agu, Okt, Des — so this is a visible
// change even though the shape is identical.
//
// The timezone is pinned too. Without it `formatDate` rendered in whatever
// timezone the server happened to run in while `formatYear` read UTC, so the
// two could disagree by a day — and a post published late evening WIB would
// show the previous day's date on a UTC runtime. The archive is Moyudan's, so
// Asia/Jakarta is the timezone its dates mean.
const TZ = "Asia/Jakarta";

const DATE = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: TZ,
});

const YEAR = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone: TZ });

export function formatDate(iso: string): string {
  return DATE.format(new Date(iso));
}

/**
 * Year alone, for the archive timeline and section eyebrows.
 * `en-US` deliberately: `id-ID` NumberFormat would render 2011 as "2.011".
 */
export function formatYear(iso: string): string {
  return YEAR.format(new Date(iso));
}

/** Numeric year in the archive's timezone — used to bucket the timeline. */
export function yearOf(iso: string): number {
  return Number(YEAR.format(new Date(iso)));
}

const MONTH_NUM = new Intl.DateTimeFormat("en-US", { month: "numeric", timeZone: TZ });

/** Numeric month, 1–12, in the archive's timezone. */
export function monthOf(iso: string): number {
  return Number(MONTH_NUM.format(new Date(iso)));
}

// Indonesian month names, indexed 1–12. Written out rather than derived from
// Intl because the archive band needs the short form and the month page needs
// the long one, and Intl would need a Date round-trip for each.
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

const MONTHS_LONG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

/** "Nov" — for the archive band's dense month rows. */
export function monthShort(month: number): string {
  return MONTHS_SHORT[month - 1] ?? String(month);
}

/** "November 2010" — for a month page's heading and title. */
export function monthLong(year: number | string, month: number): string {
  return `${MONTHS_LONG[month - 1] ?? month} ${year}`;
}

/**
 * Indonesian has no plural inflection, so a count and its noun just
 * concatenate — but keep it in one place so "3 catatan" is never assembled
 * ad hoc in markup, and so the numeral stays a numeral (guideline: numerals
 * for counts).
 */
export function countLabel(n: number, noun: string): string {
  return `${n} ${noun}`;
}
