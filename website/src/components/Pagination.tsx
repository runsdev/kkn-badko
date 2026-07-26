import Link from "next/link";

// WF-01 (6): rendered only when more than one page exists (FR-004).
export default function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const newerHref = page === 2 ? "/" : `/page/${page - 1}`;
  const linkClass =
    "rounded border border-border px-3 py-1.5 transition-colors hover:border-accent hover:text-accent";
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4 text-sm">
      {page > 1 ? (
        <Link href={newerHref} className={linkClass}>
          &larr; Newer
        </Link>
      ) : (
        <span className="rounded border border-border px-3 py-1.5 text-muted/50" aria-hidden>
          &larr; Newer
        </span>
      )}
      <span className="text-muted">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={`/page/${page + 1}`} className={linkClass}>
          Older &rarr;
        </Link>
      ) : (
        <span className="rounded border border-border px-3 py-1.5 text-muted/50" aria-hidden>
          Older &rarr;
        </span>
      )}
    </nav>
  );
}
