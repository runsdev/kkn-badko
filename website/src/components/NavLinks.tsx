"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// WF-00 (2): primary nav with the current page marked (aria-current + accent).
export default function NavLinks({ vertical = false }: { vertical?: boolean }) {
  const pathname = usePathname();
  return (
    <ul className={vertical ? "flex flex-col gap-1 py-2" : "flex gap-5 text-sm"}>
      {NAV_LINKS.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`${
                active ? "font-semibold text-accent" : "text-foreground hover:text-accent"
              } ${vertical ? "block rounded px-2 py-1.5 hover:bg-surface" : ""} transition-colors`}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
