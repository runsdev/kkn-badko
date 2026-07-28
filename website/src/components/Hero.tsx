import Link from "next/link";
import Shell from "@/components/Shell";
import type { LabelCount } from "@/lib/archive";
import { labelStyle } from "@/lib/labels";

/**
 * DESIGN.md `hero-band-dark` — the deep navy band, centred layout.
 *
 * DESIGN.md:748 calls for "scattered colourful sticky-note dots" as
 * atmospheric decoration. Here those dots ARE the archive's label taxonomy,
 * with real counts, linking to the real filtered views. Remove the data and
 * the decoration disappears with it — which is the whole idea (Redesign_Plan
 * §2.1). They settle in on load as one orchestrated moment, staggered by
 * index; `prefers-reduced-motion` removes the animation entirely.
 *
 * `on-navy` switches the focus ring to white, since the purple ring is
 * near-invisible against #0a1530.
 */
export default function Hero({
  labels,
  span,
  total,
  tpaCount,
}: {
  labels: LabelCount[];
  span: string;
  total: number;
  tpaCount: number;
}) {
  return (
    <section className="on-navy relative overflow-hidden bg-navy pt-20 pb-56 text-on-dark sm:pt-24">
      {/* mesh wash, DESIGN.md decorative depth — purely atmospheric */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, var(--navy-mid) 0%, transparent 70%), radial-gradient(40% 40% at 85% 20%, rgba(123,63,242,0.22) 0%, transparent 70%)",
        }}
      />

      <Shell className="relative">
        <ul className="mx-auto mb-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {labels.map((entry, i) => {
            const style = labelStyle(entry.label);
            return (
              <li key={entry.label} className="dot-settle" style={{ ["--dot-index" as string]: i }}>
                <Link
                  href={`/labels/${encodeURIComponent(entry.label)}`}
                  transitionTypes={["nav-forward"]}
                  className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 pr-3 pl-2.5 text-[13px] font-medium text-on-dark transition-colors duration-150 hover:border-white/40 hover:bg-white/10"
                >
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: style.accent }}
                  />
                  {style.display}
                  <span className="tabular text-on-dark-muted">{entry.count}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mx-auto max-w-4xl text-center">
          <h1
            className="hero-rise text-balance text-4xl font-semibold leading-[1.05] tracking-[-1px] sm:text-5xl lg:text-[72px] lg:tracking-[-2px]"
            style={{ ["--rise-delay" as string]: "60ms" }}
          >
            Rekaman {tpaCount} TPA di Kecamatan Moyudan.
          </h1>
          <p
            className="hero-rise mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-on-dark-muted"
            style={{ ["--rise-delay" as string]: "160ms" }}
          >
            <span className="tabular">{total}</span> catatan kegiatan, foto, dan bahan mengajar yang
            dikumpulkan {span} &mdash; diarsipkan supaya tidak hilang.
          </p>

          <div
            className="hero-rise mt-9 flex flex-wrap items-center justify-center gap-3"
            style={{ ["--rise-delay" as string]: "240ms" }}
          >
            <Link
              href="/tpa"
              transitionTypes={["nav-forward"]}
              className="rounded-md bg-primary px-[18px] py-2.5 text-sm font-medium text-on-primary transition-colors duration-150 hover:bg-primary-pressed"
            >
              Lihat {tpaCount} TPA
            </Link>
            <a
              href="#terbaru"
              className="rounded-md border border-on-dark-muted px-[18px] py-2.5 text-sm font-medium text-on-dark transition-colors duration-150 hover:border-on-dark hover:bg-white/10"
            >
              Telusuri arsip
            </a>
          </div>
        </div>
      </Shell>
    </section>
  );
}
