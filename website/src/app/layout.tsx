import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import NavLinks from "@/components/NavLinks";
import SearchBox from "@/components/SearchBox";
import SiteFooter from "@/components/SiteFooter";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";
import "./globals.css";

// DESIGN.md:530 specifies "Notion Sans", a proprietary Inter-based face, with
// Inter as its first fallback — so Inter takes every body and UI surface
// exactly as the brief intends.
//
// Display is Plus Jakarta Sans: same humanist-geometric family of shapes the
// brief asks for, but designed by Tokotype as Jakarta's official typeface. On
// a site about seventeen TPA in a Yogyakarta sub-district that is a choice
// specific to the subject rather than a default. Both are self-hosted at build
// by next/font, so there is no runtime third-party request (NFR-012).
//
// No `weight` on either: omitting it selects the variable font.
const display = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "id_ID",
  },
};

// themeColor moved out of `metadata` in Next 14 and is deprecated there; the
// separate viewport export is the current form. Matches the canvas background
// so mobile browser chrome doesn't clash with the page.
export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

// WF-00 global shell: promo banner, sticky header (wordmark, nav, search),
// content, footer.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <head>
        {/* Blogger's CDN serves every archive image; connecting early saves a
            round trip on the first thumbnail. */}
        <link rel="preconnect" href="https://blogger.googleusercontent.com" crossOrigin="" />
      </head>
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-on-primary"
        >
          Lewati ke konten
        </a>

        {/* DESIGN.md promo-banner — carries a real fact about the archive,
            not a promotion. */}
        <p className="border-b border-hairline bg-surface px-(--shell-gutter) py-2 text-center text-[13px] font-medium text-slate">
          <span className="tabular">Arsip 2009&ndash;2011</span>
          <span aria-hidden="true" className="mx-2 text-slate">
            &middot;
          </span>
          Dokumentasi TPA se-Kecamatan Moyudan
        </p>

        {/* viewTransitionName pulls the header out of the page's transition
            snapshot, so content slides underneath a header that stays put. */}
        <header
          className="sticky top-0 z-40 border-b border-hairline bg-canvas/95 backdrop-blur"
          style={{ viewTransitionName: "site-header" }}
        >
          <div className="mx-auto w-full max-w-(--container-shell) px-(--shell-gutter)">
            <div className="flex h-16 items-center gap-4">
              <Link
                href="/"
                className="flex shrink-0 items-center gap-2 font-display text-[17px] font-bold tracking-tight text-ink"
              >
                <span aria-hidden="true" className="inline-block size-5 rounded-[5px] bg-primary" />
                <span translate="no">{SITE_NAME}</span>
              </Link>

              <nav aria-label="Utama" className="ml-2 hidden lg:block">
                <NavLinks />
              </nav>

              <div className="ml-auto hidden w-full max-w-xs sm:block">
                <Suspense fallback={null}>
                  <SearchBox />
                </Suspense>
              </div>

              {/* Native details/summary: keyboard- and screen-reader-operable
                  with no JavaScript (NFR-016). Kept from the original shell. */}
              <details className="relative ml-auto lg:hidden [&[open]>summary>.chev]:rotate-180">
                <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-md border border-hairline-strong px-3 py-2 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden">
                  Menu
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 12 12"
                    className="chev size-3 transition-transform duration-150"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M2.5 4.5 6 8l3.5-3.5" strokeLinecap="round" />
                  </svg>
                </summary>
                <nav
                  aria-label="Utama (seluler)"
                  className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-hairline bg-canvas p-2 shadow-elev-4"
                >
                  <NavLinks vertical />
                  <div className="mt-2 border-t border-hairline-soft pt-2 sm:hidden">
                    <Suspense fallback={null}>
                      <SearchBox />
                    </Suspense>
                  </div>
                </nav>
              </details>
            </div>
          </div>
        </header>

        <main id="content" tabIndex={-1} className="flex-1">
          {children}
        </main>

        <SiteFooter />
      </body>
    </html>
  );
}
