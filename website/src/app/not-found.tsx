import Link from "next/link";
import Shell from "@/components/Shell";

// WF-07c: real HTTP 404, used for unknown slugs (FR-010) and unknown routes.
export default function NotFound() {
  return (
    <Shell className="py-24">
      <div className="mx-auto max-w-md text-center">
        {/* A 60px numeral in a hairline tone measured 1.74:1 — under even the
            3:1 large-text floor — and it dominated the page it was decorating.
            A small chip says the same thing legibly and lets the heading lead. */}
        <p className="tabular inline-block rounded-sm bg-surface px-2 py-0.5 text-[13px] font-semibold text-slate">
          404
        </p>
        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.5px] text-ink">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate">
          Catatan atau halaman yang dituju tidak ada di arsip ini.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors duration-150 hover:bg-primary-pressed"
          >
            Ke beranda
          </Link>
          <Link
            href="/tpa"
            className="rounded-md border border-hairline-strong px-4 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:border-primary hover:text-primary"
          >
            Direktori TPA
          </Link>
        </div>
      </div>
    </Shell>
  );
}
