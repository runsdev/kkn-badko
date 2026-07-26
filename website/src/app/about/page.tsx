import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ErrorState from "@/components/ErrorState";
import { getAboutPage } from "@/lib/blogger";
import type { StaticPage } from "@/lib/types";

export const metadata: Metadata = { title: "About", alternates: { canonical: "/about" } };

// WF-05: About content from Blogger static pages (FEAT-007 / FR-018).
export default async function AboutPage() {
  let page: StaticPage | null;
  try {
    page = await getAboutPage();
  } catch {
    return <ErrorState retryHref="/about" />;
  }
  if (!page) notFound(); // page absent in Blogger → 404 (WF-05 note 1)

  return (
    <article>
      <h1 className="text-2xl font-bold sm:text-3xl">{page.title}</h1>
      {/* sanitized in the service layer — FR-018/FR-008 */}
      <div
        className="prose prose-neutral mt-8 max-w-none dark:prose-invert prose-a:text-accent"
        dangerouslySetInnerHTML={{ __html: page.contentHtml }}
      />
    </article>
  );
}
