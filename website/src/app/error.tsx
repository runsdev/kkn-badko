"use client";

// WF-07d backstop for unexpected render errors. Expected API failures are
// handled in the pages themselves via ErrorState; this never exposes a
// stack trace to the reader.
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-16 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted">We couldn&rsquo;t load this page. Please try again shortly.</p>
      <p className="mt-5">
        <button
          onClick={() => reset()}
          className="text-accent underline underline-offset-4 hover:text-accent-hover"
        >
          Retry
        </button>
      </p>
    </div>
  );
}
