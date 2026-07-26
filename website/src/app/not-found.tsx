import Link from "next/link";

// WF-07c: real HTTP 404, used for unknown slugs (FR-010) and unknown routes.
export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">404 — Page not found</h1>
      <p className="mt-2 opacity-80">
        The post or page you&rsquo;re looking for doesn&rsquo;t exist.
      </p>
      <p className="mt-4">
        <Link href="/" className="underline">
          Go to home page
        </Link>
      </p>
    </div>
  );
}
