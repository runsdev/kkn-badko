// WF-07d: upstream failure with no cached page (FR-003). With a warm ISR
// cache Next.js keeps serving the last good page instead (NFR-009, P-1).
// Never exposes error details or a stack trace.
export default function ErrorState({ retryHref = "/" }: { retryHref?: string }) {
  return (
    <div className="py-16 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="mt-2 opacity-80">We couldn&rsquo;t load posts. Please try again shortly.</p>
      <p className="mt-4">
        <a href={retryHref} className="underline">
          Retry
        </a>
      </p>
    </div>
  );
}
