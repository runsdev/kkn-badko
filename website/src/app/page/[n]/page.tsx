import type { Metadata } from "next";
import { redirect } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import Pagination from "@/components/Pagination";
import PostCard from "@/components/PostCard";
import Shell from "@/components/Shell";
import Transition from "@/components/Transition";
import { listPostsPage } from "@/lib/blogger";
import type { PostListResult } from "@/lib/types";

interface Props {
  params: Promise<{ n: string }>;
}

/**
 * Plain decimal digits only, no leading zero.
 *
 * `Number.isInteger(Number(n))` was too loose: `Number("0x2")` is 2,
 * `Number("1e1")` is 10, `Number("2.0")` is 2 and `Number(" 2")` is 2, so
 * `/page/0x2` and `/page/1e1` served real page content at junk URLs — with no
 * canonical tag, that is an indexable duplicate of a legitimate page.
 */
function parsePage(n: string): number | null {
  if (!/^[1-9][0-9]*$/.test(n)) return null;
  const page = Number(n);
  return Number.isSafeInteger(page) ? page : null;
}

/**
 * This segment streams behind loading.tsx, so a redirect() or notFound() here
 * cannot set a real status — the response is already committed. Junk and
 * out-of-range URLs are therefore kept out of the index explicitly, and every
 * valid page declares its own canonical.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  const page = parsePage(n);
  if (page === null || page <= 1) {
    return { title: "Seluruh catatan", robots: { index: false, follow: true } };
  }
  return {
    title: `Seluruh catatan — halaman ${page}`,
    alternates: { canonical: `/page/${page}` },
  };
}

// WF-01: post list, page n (FEAT-002). Page 1 canonicalizes to "/arsip" (D-08).
export default async function PostListPage({ params }: Props) {
  const { n } = await params;
  const page = parsePage(n);
  if (page === null || page <= 1) redirect("/arsip");

  let result: PostListResult;
  try {
    result = await listPostsPage(page);
  } catch {
    return (
      <Shell className="py-24">
        <ErrorState level={1} retryHref={`/page/${page}`} />
      </Shell>
    );
  }

  // FR-006: out of range is a defined empty state. Don't print "halaman 99
  // dari 4" — the count is only meaningful for a page that exists.
  const inRange = page <= result.totalPages;

  return (
    <Transition>
      <Shell className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="flex flex-wrap items-baseline gap-x-3 text-3xl font-semibold tracking-[-0.5px] text-ink sm:text-[42px]">
            Seluruh catatan
            {inRange && (
              <span className="tabular text-lg font-normal text-slate">
                halaman {page} dari {result.totalPages}
              </span>
            )}
          </h1>

          <div className="mt-10">
            {result.posts.length === 0 ? (
              <EmptyState message="Tidak ada catatan di halaman ini." />
            ) : (
              <ul className="space-y-4">
                {result.posts.map((post) => (
                  <li key={post.id}>
                    <PostCard post={post} morph />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {inRange && <Pagination page={page} totalPages={result.totalPages} />}
        </div>
      </Shell>
    </Transition>
  );
}
