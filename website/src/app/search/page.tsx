import type { Metadata } from "next";
import Link from "next/link";
import ErrorState from "@/components/ErrorState";
import PostCard from "@/components/PostCard";
import Shell from "@/components/Shell";
import Transition from "@/components/Transition";
import { searchPosts } from "@/lib/blogger";
import type { PostSummary } from "@/lib/types";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export const metadata: Metadata = { title: "Cari" };

// WF-04: search results (FEAT-005). Dynamic per query (route map).
export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  // FR-013 server-side guard (the client guard lives in SearchBox)
  if (!query) {
    return (
      <Shell className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-[-0.5px] text-ink sm:text-[42px]">Cari</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate">
            Masukkan kata pencarian di kotak pada bagian atas halaman &mdash; nama TPA, nama
            kegiatan, atau kata apa pun yang muncul dalam catatan.
          </p>
        </div>
      </Shell>
    );
  }

  let posts: PostSummary[];
  try {
    posts = await searchPosts(query);
  } catch {
    return (
      <Shell className="py-24">
        <ErrorState level={1} retryHref={`/search?q=${encodeURIComponent(query)}`} />
      </Shell>
    );
  }

  return (
    <Transition>
      <Shell className="py-12 sm:py-16">
        <div className="mx-auto max-w-3xl">
          {/* Query echoed via JSX → HTML-escaped (FR-014). `?q=` is fully
              reader-controlled, so the echo is capped and allowed to break:
              one long unbroken token would otherwise force the whole page to
              scroll sideways. The search itself still uses the full query. */}
          <h1 className="flex flex-wrap items-baseline gap-x-3 text-3xl font-semibold tracking-[-0.5px] text-ink sm:text-[42px]">
            <span className="min-w-0 break-words">
              &ldquo;{query.length > 80 ? `${query.slice(0, 80)}…` : query}&rdquo;
            </span>
            <span className="tabular text-lg font-normal text-slate">{posts.length} catatan</span>
          </h1>

          {/* No ViewTransition here. A Suspense reveal fires as its own
              transition with no type attached, and this page's <Transition>
              resolves an untyped transition to "none" — so an inner enter VT
              nested below it is never reached and the animation silently never
              runs. Removed rather than left as decorative dead code. */}
          <div className="mt-10">
            {posts.length === 0 ? (
              // FR-015: defined no-results state with a recovery action
              <div className="rounded-lg border border-dashed border-hairline-strong bg-surface-soft px-6 py-16 text-center">
                <p className="text-[15px] text-charcoal">
                  Tidak ada catatan yang cocok dengan pencarian ini.
                </p>
                <p className="mt-2 text-sm text-slate">
                  Coba kata lain, atau{" "}
                  <Link
                    href="/"
                    className="font-medium text-link-pressed underline decoration-1 underline-offset-2 transition-colors duration-150 hover:text-ink"
                  >
                    telusuri seluruh arsip
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {posts.map((post) => (
                  <li key={post.id}>
                    <PostCard post={post} morph />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Shell>
    </Transition>
  );
}
