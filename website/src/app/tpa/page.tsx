import type { Metadata } from "next";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import Shell from "@/components/Shell";
import TpaCard from "@/components/TpaCard";
import Transition from "@/components/Transition";
import { listArchiveIndex } from "@/lib/blogger";
import { tpaDirectory } from "@/lib/tpa";
import type { PostSummary } from "@/lib/types";

export const metadata: Metadata = {
  title: "Direktori TPA",
  description:
    "Setiap Taman Pendidikan Al-Qur'an di Kecamatan Moyudan yang terekam dalam arsip Badko, 2009–2011.",
  alternates: { canonical: "/tpa" },
};

// WF-09 (D-06): the place directory.
//
// 17 of the archive's 35 posts each document one TPA, which a reverse-
// chronological feed reduces to two indistinguishable pages. Here they are
// what they actually are: a directory of places.
export default async function TpaPage() {
  let index: PostSummary[];
  try {
    index = await listArchiveIndex();
  } catch {
    return (
      <Shell className="py-24">
        <ErrorState level={1} retryHref="/tpa" />
      </Shell>
    );
  }

  const directory = tpaDirectory(index);

  return (
    <Transition>
      <Shell className="py-12 sm:py-16">
        <header className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[1px] text-teal-deep">
            Kecamatan Moyudan, Sleman
          </p>
          <h1 className="mt-2 flex flex-wrap items-baseline gap-x-3 text-3xl font-semibold tracking-[-0.5px] text-ink sm:text-[42px]">
            Direktori TPA
            <span className="tabular text-lg font-normal text-slate">
              {directory.length} tempat
            </span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate">
            Setiap Taman Pendidikan Al-Qur&rsquo;an yang terekam dalam arsip ini, beserta foto
            dokumentasinya.
          </p>
        </header>

        {directory.length === 0 ? (
          <div className="mt-10">
            <EmptyState message="Belum ada TPA yang terekam dalam arsip." />
          </div>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {directory.map((entry, i) => (
              <li key={entry.post.id}>
                {/* the first row is above the fold and is the LCP candidate */}
                <TpaCard entry={entry} morph eager={i < 3} />
              </li>
            ))}
          </ul>
        )}
      </Shell>
    </Transition>
  );
}
