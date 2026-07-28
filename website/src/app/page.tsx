import Link from "next/link";
import ErrorState from "@/components/ErrorState";
import PostCard from "@/components/PostCard";
import RollCall from "@/components/RollCall";
import SectionHeader from "@/components/SectionHeader";
import Shell from "@/components/Shell";
import Transition from "@/components/Transition";
import { archiveShape, byLabel } from "@/lib/archive";
import { listArchiveIndex } from "@/lib/blogger";
import { labelStyle } from "@/lib/labels";
import { tpaDirectory } from "@/lib/tpa";
import type { PostSummary } from "@/lib/types";

// WF-11 (D-08): Beranda — the landing page, after the archive front door moved
// to /arsip.
//
// The two pages have deliberately different jobs, and are built so they cannot
// be mistaken for one another:
//
//   /arsip   what the archive CONTAINS. Navy hero band, board of photographs,
//            month timeline, the full paginated feed. Data-first.
//   /        who this IS. Light typographic field, the seventeen centres as a
//            roll call of names, three ways in. Identity-first.
//
// The navy band therefore stays /arsip's signature and is not repeated here;
// this page is light, and its signature is the roll call. Same design system,
// opposite composition.
export default async function BerandaPage() {
  let index: PostSummary[];
  try {
    index = await listArchiveIndex();
  } catch {
    // FR-003 — a defined error state, never a stack trace.
    return (
      <Shell className="py-24">
        <ErrorState level={1} retryHref="/" />
      </Shell>
    );
  }

  const shape = archiveShape(index);
  const directory = tpaDirectory(index);
  const teaching = byLabel(index, "TIPS", "BCM");
  const berita = byLabel(index, "BERITA");
  const latest = index.slice(0, 3);

  const doors = [
    {
      href: "/arsip",
      eyebrow: "Seluruh catatan",
      title: "Arsip 2009–2011",
      body: "Per bulan, per label, urut dari yang terbaru.",
      count: `${shape.total} catatan`,
      tint: labelStyle("FOTO").tint,
      deep: labelStyle("FOTO").deep,
    },
    {
      href: "/labels/BERITA",
      eyebrow: "Kabar & kegiatan",
      title: "Wisuda, diklat, festival",
      body: "Laporan acara yang pernah diselenggarakan Badko.",
      count: `${berita.length} catatan`,
      tint: labelStyle("BERITA").tint,
      deep: labelStyle("BERITA").deep,
    },
    {
      href: "/labels/TIPS",
      eyebrow: "Bermain · Cerita · Menyanyi",
      title: "Bahan mengajar",
      body: "Permainan dan pujian yang dipakai mengajar santri.",
      count: `${teaching.length} catatan`,
      tint: labelStyle("TIPS").tint,
      deep: labelStyle("TIPS").deep,
    },
  ];

  return (
    <Transition>
      <div>
        {/* Light hero. DESIGN.md's navy band belongs to /arsip, so this page
            opens on `surface-soft` and leads with type instead. */}
        <section className="border-b border-hairline bg-surface-soft">
          <Shell className="py-20 sm:py-28">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[1px] text-slate">
                Kecamatan Moyudan, Sleman
              </p>
              <h1
                className="hero-rise mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-[-1px] text-ink sm:text-5xl lg:text-[68px] lg:tracking-[-2px]"
                style={{ ["--rise-delay" as string]: "40ms" }}
              >
                Tujuh belas TPA, satu koordinasi.
              </h1>
              <p
                className="hero-rise mt-7 max-w-2xl text-lg leading-relaxed text-charcoal"
                style={{ ["--rise-delay" as string]: "140ms" }}
              >
                Badan Koordinasi Taman Pendidikan Al-Qur&rsquo;an Kecamatan Moyudan menghimpun taman
                pendidikan di tujuh belas dusun. Situs ini menyimpan catatannya &mdash; foto, kabar
                kegiatan, dan bahan mengajar &mdash; supaya tidak hilang.
              </p>

              <div
                className="hero-rise mt-9 flex flex-wrap items-center gap-3"
                style={{ ["--rise-delay" as string]: "220ms" }}
              >
                <Link
                  href="/arsip"
                  transitionTypes={["nav-forward"]}
                  className="rounded-md bg-primary px-[18px] py-2.5 text-sm font-medium text-on-primary transition-colors duration-150 hover:bg-primary-pressed"
                >
                  Telusuri arsip
                </Link>
                <Link
                  href="/tpa"
                  transitionTypes={["nav-forward"]}
                  className="rounded-md border border-hairline-strong px-[18px] py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-primary hover:text-primary"
                >
                  Direktori TPA
                </Link>
              </div>

              {/* The archive describing itself, inline rather than as a panel —
                  the full statistics strip belongs to /arsip. */}
              <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-hairline pt-6">
                {[
                  { k: "Catatan", v: String(shape.total) },
                  { k: "Tempat", v: String(directory.length) },
                  { k: "Label", v: String(shape.labels.length) },
                  { k: "Rentang", v: shape.span || "—" },
                ].map((s) => (
                  <div key={s.k}>
                    <dt className="text-[11px] font-semibold uppercase tracking-[1px] text-slate">
                      {s.k}
                    </dt>
                    <dd className="tabular mt-1 font-display text-xl font-semibold text-ink">
                      {s.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Shell>
        </section>

        <RollCall entries={directory} />

        <Shell className="mt-24">
          <section aria-labelledby="mulai">
            <h2 id="mulai" className="sr-only">
              Mulai dari sini
            </h2>
            <ul className="grid gap-4 lg:grid-cols-3">
              {doors.map((door) => (
                <li key={door.href}>
                  <Link
                    href={door.href}
                    transitionTypes={["nav-forward"]}
                    className="lift flex h-full flex-col justify-between gap-8 rounded-xl p-6 sm:p-8"
                    style={{ background: door.tint }}
                  >
                    <div>
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[1px]"
                        style={{ color: door.deep }}
                      >
                        {door.eyebrow}
                      </p>
                      <h3 className="mt-3 font-display text-xl font-semibold leading-snug text-charcoal">
                        {door.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-charcoal">{door.body}</p>
                    </div>
                    <p className="tabular text-[13px] font-medium" style={{ color: door.deep }}>
                      {door.count}&nbsp;&rarr;
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </Shell>

        {latest.length > 0 && (
          <Shell className="mt-24">
            <section aria-labelledby="terbaru-beranda">
              <SectionHeader
                id="terbaru-beranda"
                title="Catatan terbaru"
                blurb="Tiga yang paling baru dari arsip."
                href="/arsip"
                hrefLabel="Semua catatan"
              />
              <ul className="space-y-4">
                {latest.map((post) => (
                  <li key={post.id}>
                    {/* morph is safe here: this is the only surface on the page
                        that mounts a named transition per post */}
                    <PostCard post={post} level={3} morph />
                  </li>
                ))}
              </ul>
            </section>
          </Shell>
        )}
      </div>
    </Transition>
  );
}
