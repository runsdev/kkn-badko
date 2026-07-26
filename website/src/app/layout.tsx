import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import NavLinks from "@/components/NavLinks";
import SearchBox from "@/components/SearchBox";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
  },
};

// WF-00 global shell: header (title, nav, search) + content + footer.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-background"
        >
          Skip to content
        </a>
        <header className="border-b border-border bg-surface/50">
          <div className="mx-auto w-full max-w-3xl px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="text-xl font-bold tracking-tight hover:text-accent">
                {SITE_NAME}
              </Link>
              <nav aria-label="Primary" className="hidden sm:block">
                <NavLinks />
              </nav>
              {/* WF-00 (5): mobile menu — native details/summary is keyboard-
                  and screen-reader-operable without JavaScript (NFR-016) */}
              <details className="relative sm:hidden">
                <summary
                  className="flex cursor-pointer list-none items-center rounded border border-border px-3 py-1.5 text-sm hover:bg-surface [&::-webkit-details-marker]:hidden"
                  aria-label="Menu"
                >
                  Menu
                </summary>
                <nav
                  aria-label="Primary"
                  className="absolute right-0 z-40 mt-2 w-40 rounded-lg border border-border bg-background px-2 shadow-lg"
                >
                  <NavLinks vertical />
                </nav>
              </details>
            </div>
            <div className="mt-3 sm:max-w-sm">
              <Suspense fallback={null}>
                <SearchBox />
              </Suspense>
            </div>
          </div>
        </header>
        <main id="content" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-border bg-surface/50">
          {/* WF-00 (4): static footer, no tracking scripts (NFR-012) */}
          <p className="mx-auto w-full max-w-3xl px-4 py-5 text-sm text-muted">
            &copy; KKN BADKO — content authored in Google Blogger
          </p>
        </footer>
      </body>
    </html>
  );
}
