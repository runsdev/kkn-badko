import Link from "next/link";

// WF-01 (6): rendered only when more than one page exists (FR-004).
//
// The list's page 1 is `/arsip`, not `/` — D-08 moved the feed off the landing
// page. Page 2's "newer" link therefore returns to /arsip.
//
// Disabled ends stay non-links and keep the dashed border. That border is not
// decoration: it carries the disabled state non-chromatically, because the
// previous version signalled it with text-muted/50 at 1.96:1 and that was a
// logged accessibility defect (QA_Report.md:37). Text uses `slate` (6.80:1) —
// never an alpha-dimmed token.
//
// Pagination is ordered, so the slides are directional: "older" is forward
// through the archive, "newer" is back.
//
// The disabled ends are deliberately NOT aria-hidden. Hiding them would remove
// the very affordance the dashed border exists to convey, leaving a screen
// reader user unaware the control exists at all; a non-interactive span with
// visible text is the honest representation.
export default function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const newerHref = page === 2 ? "/arsip" : `/page/${page - 1}`;

  const linkClass =
    "rounded-md border border-hairline-strong px-3 py-2 font-medium text-ink transition-colors duration-150 hover:border-primary hover:text-primary";
  const disabledClass =
    "rounded-md border border-dashed border-hairline-strong px-3 py-2 text-slate";

  // The dashed border says "unavailable" to a sighted reader; this says it to
  // everyone else. A bare aria-disabled on a span carries no role and would do
  // nothing.
  const unavailable = <span className="sr-only"> (tidak tersedia)</span>;

  return (
    <nav
      aria-label="Navigasi halaman"
      className="mt-12 flex items-center justify-center gap-4 text-sm"
    >
      {page > 1 ? (
        <Link href={newerHref} transitionTypes={["nav-back"]} className={linkClass}>
          &larr; Lebih baru
        </Link>
      ) : (
        <span className={disabledClass}>
          &larr; Lebih baru
          {unavailable}
        </span>
      )}

      <span className="tabular text-slate">
        Halaman {page} dari {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={`/page/${page + 1}`} transitionTypes={["nav-forward"]} className={linkClass}>
          Lebih lama &rarr;
        </Link>
      ) : (
        <span className={disabledClass}>
          Lebih lama &rarr;
          {unavailable}
        </span>
      )}
    </nav>
  );
}
