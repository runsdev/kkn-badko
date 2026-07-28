import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ErrorState from "@/components/ErrorState";
import Shell from "@/components/Shell";
import Transition from "@/components/Transition";
import { getAboutPage } from "@/lib/blogger";
import type { StaticPage } from "@/lib/types";

export const metadata: Metadata = { title: "Tentang", alternates: { canonical: "/about" } };

// WF-05: About content from Blogger static pages (FEAT-007 / FR-018).
export default async function AboutPage() {
  let page: StaticPage | null;
  try {
    page = await getAboutPage();
  } catch {
    return (
      <Shell className="py-24">
        <ErrorState level={1} retryHref="/about" />
      </Shell>
    );
  }
  if (!page) notFound(); // page absent in Blogger → 404 (WF-05 note 1)

  return (
    <Transition>
      <Shell className="py-12 sm:py-16">
        <article className="mx-auto max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[1px] text-slate">
            Kecamatan Moyudan, Sleman
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.5px] text-ink sm:text-[42px]">
            {page.title}
          </h1>
          {/* sanitized in the service layer — FR-018/FR-008 */}
          <div
            className="prose prose-archive mt-10 max-w-none"
            style={{ ["--frame-tint" as string]: "var(--tint-lavender)" }}
            dangerouslySetInnerHTML={{ __html: page.contentHtml }}
          />
        </article>
      </Shell>
    </Transition>
  );
}
