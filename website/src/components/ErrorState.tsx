// WF-07d: upstream failure with no cached page (FR-003). With a warm ISR
// cache Next.js keeps serving the last good page instead (NFR-009, P-1).
// Never exposes error details or a stack trace.
//
// `level` exists because this renders inside a page that already has its own
// h1 in most cases; it becomes the h1 only when it replaces the whole page.
export default function ErrorState({
  retryHref = "/",
  level = 2,
}: {
  retryHref?: string;
  level?: 1 | 2;
}) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <div className="rounded-lg border border-hairline bg-surface-soft px-6 py-16 text-center">
      <span
        aria-hidden="true"
        className="mx-auto block size-9 rounded-full border-2 border-warning"
      />
      <Heading className="mt-4 text-xl font-semibold text-ink">Catatan gagal dimuat</Heading>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-slate">
        Arsip tidak bisa dihubungi saat ini. Isinya tersimpan di Blogger dan tidak hilang &mdash;
        coba muat ulang sebentar lagi.
      </p>
      <p className="mt-5">
        {/* deliberately <a>, not <Link>: this must force a fresh request */}
        <a
          href={retryHref}
          className="inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors duration-150 hover:bg-primary-pressed"
        >
          Muat ulang
        </a>
      </p>
    </div>
  );
}
