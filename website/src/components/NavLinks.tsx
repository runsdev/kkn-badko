"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/arsip", label: "Arsip" },
  { href: "/tpa", label: "Direktori TPA" },
  { href: "/about", label: "Tentang" },
  { href: "/contact", label: "Kontak" },
];

// WF-00 (2): primary nav with the current page marked (aria-current + weight).
export default function NavLinks({ vertical = false }: { vertical?: boolean }) {
  const pathname = usePathname();
  return (
    <ul className={vertical ? "flex flex-col gap-0.5" : "flex items-center gap-1"}>
      {NAV_LINKS.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={[
                "block rounded-md px-3 py-2 text-sm transition-colors duration-150",
                vertical ? "" : "whitespace-nowrap",
                active
                  ? "bg-surface font-semibold text-ink"
                  : "font-medium text-slate hover:bg-surface hover:text-ink",
              ].join(" ")}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
