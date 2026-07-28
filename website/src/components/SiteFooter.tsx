import Link from "next/link";
import { type Contributor, contributors } from "@/lib/archive";
import { listArchiveIndex } from "@/lib/blogger";
import { LABEL_ORDER, labelStyle } from "@/lib/labels";
import { SITE_NAME } from "@/lib/site";

// DESIGN.md `footer-region` — a multi-column link grid, reduced from six
// columns to the four this site actually has content for. WF-00 (4): static,
// no tracking scripts (NFR-012).
//
// The Kontributor column (D-07) is the native equivalent of Blogger's Profile
// gadget. It is derived here rather than passed in, because the footer renders
// from the root layout and has no page props — the call is the same cached walk
// the home page uses, so it costs no extra request.
//
// Rendered from every route, including ones that need no data at all like
// /contact, so an upstream failure must not take a page down: it degrades to a
// footer with one fewer column.
async function getContributors(): Promise<Contributor[]> {
  try {
    return contributors(await listArchiveIndex());
  } catch {
    return [];
  }
}

export default async function SiteFooter() {
  const people = await getContributors();

  return (
    <footer className="mt-24 border-t border-hairline bg-surface-soft">
      <div className="mx-auto w-full max-w-(--container-shell) px-(--shell-gutter) py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="flex items-center gap-2 font-display text-[15px] font-bold text-ink">
              <span aria-hidden="true" className="inline-block size-4 rounded-[4px] bg-primary" />
              <span translate="no">{SITE_NAME}</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate">
              Badan Koordinasi Taman Pendidikan Al-Qur&rsquo;an Kecamatan Moyudan, Sleman.
            </p>
          </div>

          <nav aria-labelledby="footer-arsip">
            <h2
              id="footer-arsip"
              className="text-[11px] font-semibold uppercase tracking-[1px] text-slate"
            >
              Arsip
            </h2>
            <ul className="mt-4 space-y-2.5">
              {[
                { href: "/arsip", label: "Semua catatan" },
                { href: "/tpa", label: "Direktori TPA" },
                { href: "/search", label: "Cari" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate transition-colors duration-150 hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-label">
            <h2
              id="footer-label"
              className="text-[11px] font-semibold uppercase tracking-[1px] text-slate"
            >
              Label
            </h2>
            <ul className="mt-4 space-y-2.5">
              {LABEL_ORDER.map((label) => (
                <li key={label}>
                  <Link
                    href={`/labels/${encodeURIComponent(label)}`}
                    className="group flex items-center gap-2 text-sm text-slate transition-colors duration-150 hover:text-ink"
                  >
                    <span
                      aria-hidden="true"
                      className="size-2 shrink-0 rounded-full"
                      style={{ background: labelStyle(label).accent }}
                    />
                    {labelStyle(label).display}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-org">
            <h2
              id="footer-org"
              className="text-[11px] font-semibold uppercase tracking-[1px] text-slate"
            >
              Organisasi
            </h2>
            <ul className="mt-4 space-y-2.5">
              {[
                { href: "/about", label: "Tentang Badko" },
                { href: "/contact", label: "Kontak" },
                { href: "/labels/PROFIL", label: "Susunan pengurus" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate transition-colors duration-150 hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {people.length > 0 && (
          <div className="mt-10 border-t border-hairline pt-8">
            <h2 className="text-[11px] font-semibold uppercase tracking-[1px] text-slate">
              Kontributor
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
              {people.map((person) => (
                <li key={person.name} className="text-sm text-slate">
                  <span translate="no">{person.name}</span>
                  <span className="tabular ml-2 text-stone" aria-hidden="true">
                    {person.count}
                  </span>
                  <span className="sr-only">, {person.count} catatan</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-10 border-t border-hairline pt-6 text-[13px] text-slate">
          &copy; KKN BADKO &mdash; isi tulisan dikelola di Google Blogger.
        </p>
      </div>
    </footer>
  );
}
