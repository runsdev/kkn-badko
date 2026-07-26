import Link from "next/link";

// WF-07b: empty is a defined state, not an error (FR-006, FR-012, FR-015).
export default function EmptyState({ message = "Nothing here yet." }: { message?: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-3xl opacity-40" aria-hidden>
        &#9675;
      </p>
      <p className="mt-2 opacity-80">{message}</p>
      <p className="mt-4">
        <Link href="/" className="underline">
          Browse all posts
        </Link>
      </p>
    </div>
  );
}
