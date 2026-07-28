"use client";

import Shell from "@/components/Shell";

// WF-07d backstop for unexpected render errors. Expected API failures are
// handled in the pages themselves via ErrorState; this never exposes a stack
// trace to the reader.
//
// Next 16.2 added `unstable_retry`, which re-fetches and re-renders the
// boundary's children. `reset` still exists but only clears the error state
// without re-fetching, which for an upstream API failure just re-throws — so
// retry is the correct control here.
export default function ErrorPage({ unstable_retry }: { unstable_retry: () => void }) {
  return (
    <Shell className="py-24">
      <div className="mx-auto max-w-md rounded-lg border border-hairline bg-surface-soft px-6 py-14 text-center">
        <span
          aria-hidden="true"
          className="mx-auto block size-9 rounded-full border-2 border-warning"
        />
        <h1 className="mt-4 text-xl font-semibold text-ink">Halaman gagal dimuat</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate">
          Ada yang salah saat menyiapkan halaman ini. Coba muat ulang.
        </p>
        <p className="mt-5">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors duration-150 hover:bg-primary-pressed"
          >
            Muat ulang
          </button>
        </p>
      </div>
    </Shell>
  );
}
