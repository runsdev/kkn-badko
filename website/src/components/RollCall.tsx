import Link from "next/link";
import Shell from "@/components/Shell";
import { labelStyle } from "@/lib/labels";
import { prettyTpaName, type TpaEntry } from "@/lib/tpa";

/**
 * The Beranda's signature element (D-08).
 *
 * `/arsip` shows this same data as a board of photographs — the archive as a
 * database. Here it is the opposite treatment: the seventeen centres as a
 * typographic roll call, village first, name set large, one hairline rule
 * between each. Same seventeen records, and the two pages are not confusable.
 *
 * The names are the organisation's own vernacular — Arabic-derived centre names
 * against Javanese dusun names, Al-Huda against Kaliduren — which is the most
 * characteristic thing the archive contains and the reason this reads as
 * belonging to Moyudan rather than to a template.
 *
 * No images by design: the seventeen photographs are all the same graduation
 * backdrop, so at this size they would say less than the names do.
 */
export default function RollCall({ entries }: { entries: TpaEntry[] }) {
  if (entries.length === 0) return null;
  const accent = labelStyle("FOTO").accent;
  // The accessible name must be the text actually on screen (WCAG 2.5.3), so
  // it uses the title-cased form rather than the raw shouted title.

  return (
    <Shell className="mt-24">
      <section aria-labelledby="daftar-tpa">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-ink pb-4">
          <h2
            id="daftar-tpa"
            className="text-2xl font-semibold tracking-[-0.5px] text-ink sm:text-[32px]"
          >
            Tujuh belas tempat
          </h2>
          <p className="tabular text-sm text-slate">
            {entries.length}&nbsp;TPA &middot; Kecamatan Moyudan
          </p>
        </div>

        <ul>
          {entries.map((entry) => (
            <li key={entry.post.id}>
              <Link
                href={`/posts/${entry.post.slug}`}
                aria-label={prettyTpaName(entry.name)}
                transitionTypes={["nav-forward"]}
                className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-hairline py-5 sm:grid-cols-[10rem_1fr_auto] sm:py-6"
              >
                {/* Village leads. It is the thing a local reader scans for, and
                    it is omitted rather than guessed when the parse is unsure
                    (see lib/tpa.ts), so the column can legitimately be blank. */}
                <span
                  aria-hidden="true"
                  className="order-1 col-span-2 text-[11px] font-semibold uppercase tracking-[1px] sm:order-none sm:col-span-1"
                  style={{ color: labelStyle("FOTO").deep }}
                >
                  {entry.village ?? "—"}
                </span>

                <span className="order-2 font-display text-xl font-semibold leading-tight text-ink sm:order-none sm:text-2xl">
                  {prettyTpaName(entry.name)}
                </span>

                <span
                  aria-hidden="true"
                  className="order-3 shrink-0 text-lg text-hairline-strong transition-colors duration-150 group-hover:text-ink sm:order-none"
                  style={{ ["--dot" as string]: accent }}
                >
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
