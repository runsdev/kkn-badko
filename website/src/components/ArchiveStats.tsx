import Link from "next/link";
import Shell from "@/components/Shell";
import type { ArchiveShape, YearGroup } from "@/lib/archive";
import { monthShort } from "@/lib/format";

/**
 * DESIGN.md `stat-row` — the surface-tinted strip with a bar chart. Also the
 * native equivalent of Blogger's **BlogArchive** gadget (Gadgets_Research §6).
 *
 * Deliberately a timeline rather than a set of headline figures. The shape of
 * this archive is the honest thing about it: a burst in November 2010, then it
 * stops. Bars are proportional to real counts and every month links to its own
 * page, which is what Blogger's sidebar archive does.
 *
 * It is a table because it is tabular data — a screen reader gets the numbers,
 * not a row of decorative divs. Months are grouped under their year with the
 * year as a row header, so the two levels are conveyed structurally rather than
 * by indentation alone.
 */
export default function ArchiveStats({
  shape,
  months,
}: {
  shape: ArchiveShape;
  months: YearGroup[];
}) {
  const peak = Math.max(1, ...months.flatMap((g) => g.months.map((m) => m.count)));
  const activeMonths = months.reduce((n, g) => n + g.months.length, 0);

  return (
    <Shell className="mt-20">
      <section aria-labelledby="bentuk-arsip" className="rounded-lg bg-surface p-6 sm:p-12">
        <h2 id="bentuk-arsip" className="text-2xl font-semibold tracking-[-0.5px] text-ink">
          Arsip per bulan
        </h2>
        <p className="mt-1.5 text-[15px] text-slate">
          <span className="tabular">{activeMonths}</span> bulan yang berisi catatan, dari{" "}
          <span className="tabular">{shape.span || "—"}</span>.
        </p>

        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-16">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 self-start">
            {[
              { label: "Catatan", value: String(shape.total) },
              { label: "Label", value: String(shape.labels.length) },
              { label: "Rentang", value: shape.span || "—" },
              { label: "Bulan aktif", value: String(activeMonths) },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="text-[11px] font-semibold uppercase tracking-[1px] text-slate">
                  {stat.label}
                </dt>
                <dd className="tabular mt-1 font-display text-2xl font-semibold text-ink">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <table className="w-full border-separate border-spacing-y-1.5 text-left">
            <caption className="mb-4 caption-bottom text-left text-[13px] text-slate">
              Pilih satu bulan untuk melihat catatannya. Arsip berhenti setelah{" "}
              <span className="tabular">{shape.years.at(-1)?.year ?? "—"}</span>.
            </caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Bulan</th>
                <th scope="col">Jumlah catatan</th>
              </tr>
            </thead>
            {months.map((group) => (
              <tbody key={group.year}>
                <tr>
                  <th
                    scope="rowgroup"
                    colSpan={2}
                    className="tabular pt-3 pb-1 font-display text-sm font-semibold text-ink"
                  >
                    {group.year}
                    <span className="ml-2 font-sans font-normal text-slate">
                      {group.count} catatan
                    </span>
                  </th>
                </tr>
                {group.months.map((m) => (
                  <tr key={m.href}>
                    <th
                      scope="row"
                      className="w-16 pr-3 align-middle text-[13px] font-medium text-slate"
                    >
                      <Link
                        href={m.href}
                        transitionTypes={["nav-forward"]}
                        className="rounded-sm underline decoration-1 underline-offset-2 transition-colors duration-150 hover:text-ink"
                      >
                        {monthShort(m.month)}
                      </Link>
                    </th>
                    <td className="align-middle">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="h-2.5 rounded-full bg-primary"
                          style={{ width: `${Math.max(3, (m.count / peak) * 100)}%` }}
                        />
                        <span className="tabular shrink-0 text-[13px] text-charcoal">
                          {m.count}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </section>
    </Shell>
  );
}
