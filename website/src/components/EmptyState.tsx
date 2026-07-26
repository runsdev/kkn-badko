import Link from "next/link";

// WF-07b: empty is a defined state, not an error (FR-006, FR-012, FR-015).
export default function EmptyState({ message = "Nothing here yet." }: { message?: string }) {
  return (
    <div className="py-16 text-center">
      <p className="text-3xl text-muted/50" aria-hidden>
        &#9675;
      </p>
      <p className="mt-3 text-muted">{message}</p>
      <p className="mt-5">
        <Link href="/" className="text-accent underline underline-offset-4 hover:text-accent-hover">
          Browse all posts
        </Link>
      </p>
    </div>
  );
}
