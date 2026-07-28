import Link from "next/link";
import Shell from "@/components/Shell";
import TpaCard from "@/components/TpaCard";
import type { TpaEntry } from "@/lib/tpa";

/**
 * DESIGN.md `workspace-mockup-card` — the card that breaks out of the hero
 * band with the Level-3 shadow.
 *
 * DESIGN.md:718 puts "actual product UI" in this slot. Here the product is the
 * archive, so the card holds a real board view of the TPA directory: real
 * names, real photographs, real links. It is not a screenshot of anything.
 *
 * Pulled up over the band with a negative margin, which is why Hero carries
 * the deep bottom padding.
 */
export default function ArchiveBoard({
  entries,
  total,
  preview = 6,
}: {
  entries: TpaEntry[];
  total: number;
  preview?: number;
}) {
  const shown = entries.slice(0, preview);

  return (
    <Shell className="relative -mt-44">
      <section
        aria-labelledby="papan-arsip"
        className="overflow-hidden rounded-xl border border-hairline bg-canvas shadow-elev-3"
      >
        {/* the mockup's own chrome — a board header, as the product would have */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-surface-soft px-4 py-3 sm:px-5">
          <h2 id="papan-arsip" className="flex items-center gap-2 text-sm font-semibold text-ink">
            <span aria-hidden="true" className="inline-block size-2.5 rounded-full bg-teal" />
            Papan Arsip
            <span className="tabular font-normal text-slate">{total} tempat</span>
          </h2>
          <Link
            href="/tpa"
            transitionTypes={["nav-forward"]}
            className="text-[13px] font-medium text-link-pressed underline decoration-1 underline-offset-2 transition-colors duration-150 hover:text-ink"
          >
            Lihat semua
          </Link>
        </div>

        <ul className="grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:p-5 lg:grid-cols-3">
          {shown.map((entry, i) => (
            <li key={entry.post.id}>
              {/* level 3: the board's own heading above is the h2.
                  The negative margin pulls the first row into the fold, so
                  those photos are the LCP candidate and load eagerly. */}
              <TpaCard entry={entry} morph level={3} eager={i < 3} />
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
