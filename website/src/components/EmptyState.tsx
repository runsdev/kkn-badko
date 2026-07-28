import Link from "next/link";

// WF-07b: empty is a defined state, not an error (FR-006, FR-012, FR-015).
// An empty screen is an invitation to act, so it always offers a way onward.
export default function EmptyState({
  message = "Belum ada apa pun di sini.",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-hairline-strong bg-surface-soft px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="mx-auto block size-9 rounded-full border-2 border-dashed border-hairline-strong"
      />
      <p className="mt-4 text-[15px] text-charcoal">{message}</p>
      <p className="mt-5">
        <Link
          href="/arsip"
          className="text-sm font-medium text-link-pressed underline decoration-1 underline-offset-2 transition-colors duration-150 hover:text-ink"
        >
          Telusuri seluruh arsip
        </Link>
      </p>
    </div>
  );
}
