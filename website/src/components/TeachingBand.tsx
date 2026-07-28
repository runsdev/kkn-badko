import Link from "next/link";
import Shell from "@/components/Shell";
import { formatYear } from "@/lib/format";
import type { PostSummary } from "@/lib/types";

/**
 * DESIGN.md `card-feature-yellow-bold` — the high-emphasis banner card.
 *
 * On Notion's own site this slot holds "Ask your on-demand assistants". Here it
 * holds the archive's teaching material: BCM is a standard TPA term (Bermain,
 * Cerita, Menyanyi — play, story, song), and these posts are the games and
 * songs the ustadz and ustadzah actually used. They are the most reusable
 * thing in the archive, which is what earns the loudest surface on the page.
 *
 * Titles like "TUYUL" and "SATE vs BAYEM" are the material's own names; they
 * are left exactly as written rather than tidied into descriptions.
 */
export default function TeachingBand({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null;

  return (
    <Shell className="mt-20">
      <section
        aria-labelledby="bahan-mengajar"
        className="rounded-xl bg-tint-yellow-bold p-6 text-charcoal sm:p-12"
      >
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[1px] text-brown">
            Bermain &middot; Cerita &middot; Menyanyi
          </p>
          <h2
            id="bahan-mengajar"
            className="mt-2 text-2xl font-semibold tracking-[-0.5px] text-charcoal sm:text-[36px]"
          >
            Bahan mengajar untuk ustadz &amp; ustadzah
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-brown">
            Permainan, pujian, dan cara menenangkan santri &mdash; dicatat saat dipakai, masih bisa
            dipakai lagi.
          </p>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/posts/${post.slug}`}
                aria-label={post.title}
                transitionTypes={["nav-forward"]}
                className="lift flex h-full flex-col justify-between gap-3 rounded-lg border border-brown/15 bg-canvas/70 p-4"
              >
                <h3 className="text-[15px] font-semibold leading-snug text-charcoal">
                  {post.title}
                </h3>
                <span className="tabular text-[13px] text-brown">{formatYear(post.published)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Shell>
  );
}
