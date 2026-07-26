import Link from "next/link";

// WF-01 (6): rendered only when more than one page exists (FR-004).
export default function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const newerHref = page === 2 ? "/" : `/page/${page - 1}`;
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-6 text-sm">
      {page > 1 ? (
        <Link href={newerHref} className="hover:underline">
          &larr; Newer
        </Link>
      ) : (
        <span className="opacity-40" aria-hidden>
          &larr; Newer
        </span>
      )}
      <span>
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={`/page/${page + 1}`} className="hover:underline">
          Older &rarr;
        </Link>
      ) : (
        <span className="opacity-40" aria-hidden>
          Older &rarr;
        </span>
      )}
    </nav>
  );
}
