import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import ErrorState from "@/components/ErrorState";
import LabelChip from "@/components/LabelChip";
import Shell from "@/components/Shell";
import Transition from "@/components/Transition";
import { getPostBySlug, getPostComments } from "@/lib/blogger";
import { formatDate } from "@/lib/format";
import { HERO_WIDTH, resizeBloggerImage, stripFirstImage } from "@/lib/image";
import { labelStyle, primaryLabel } from "@/lib/labels";
import { SITE_NAME, siteUrl } from "@/lib/site";
import type { Post } from "@/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

// FR-009 / NFR-015: title, description, Open Graph from the post itself.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPostBySlug(slug);
    if (!post) return {};
    return {
      title: post.title,
      description: post.excerpt,
      alternates: { canonical: `/posts/${post.slug}` },
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article",
        publishedTime: post.published,
        url: `/posts/${post.slug}`,
        images: post.image ? [{ url: resizeBloggerImage(post.image, 1200) }] : undefined,
      },
    };
  } catch {
    return {};
  }
}

// WF-02: post detail + read-only native comments (FEAT-003/006).
export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  let post: Post | null;
  try {
    post = await getPostBySlug(slug);
  } catch {
    return (
      <Shell className="py-24">
        <ErrorState level={1} retryHref={`/posts/${slug}`} />
      </Shell>
    );
  }
  if (!post) notFound(); // FR-010: unknown slug is a real 404

  const comments = await getPostComments(post.id); // null → hide block (§3.2.6)

  const label = primaryLabel(post.labels);
  const style = label ? labelStyle(label) : undefined;

  // The first image is promoted to the hero so it can be the morph target, so
  // it must not also render inside the body.
  const hero = post.image ? resizeBloggerImage(post.image, HERO_WIDTH) : undefined;
  const bodyHtml = hero ? stripFirstImage(post.contentHtml, post.image) : post.contentHtml;

  // NFR-015: JSON-LD BlogPosting
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.published,
    description: post.excerpt,
    image: hero,
    author: post.author ? { "@type": "Person", name: post.author } : undefined,
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: `${siteUrl()}/posts/${post.slug}`,
  };

  return (
    <Transition>
      <Shell className="py-12 sm:py-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />

        <article className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {post.labels.map((l) => (
              <LabelChip key={l} label={l} href={`/labels/${encodeURIComponent(l)}`} />
            ))}
          </div>

          {/* text-morph, not morph: a raster morph on text that changes size
              between views leaves a visibly scaled ghost of the old snapshot */}
          <ViewTransition name={`post-title-${post.id}`} share="text-morph" default="none">
            <h1 className="mt-5 text-3xl font-semibold leading-[1.15] tracking-[-0.5px] text-ink sm:text-[42px]">
              {post.title}
            </h1>
          </ViewTransition>

          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-slate">
            <time dateTime={post.published} className="tabular">
              {formatDate(post.published)}
            </time>
            {/* author is often "" on migrated posts — never render a dangling separator */}
            {post.author && <span>&middot; oleh {post.author}</span>}
          </p>

          {hero && (
            <ViewTransition name={`post-img-${post.id}`} share="morph" default="none">
              {/* 3:2, not 4:3 — every archive photo is straight off a DSLR, so
                  matching the source ratio keeps object-contain from
                  letterboxing. Cards still crop to 4:3 with object-cover. */}
              <div
                className="relative mt-8 aspect-3/2 w-full overflow-hidden rounded-xl border border-hairline"
                style={{ background: style?.tint ?? "var(--tint-gray)" }}
              >
                {/* alt is empty by design: the h1 immediately above names the
                    subject, and the archive carries no real descriptions, so a
                    repeated title would only add noise for screen readers.
                    v16: `priority` is deprecated — eager + high fetchPriority. */}
                <Image
                  src={hero}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-contain"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </ViewTransition>
          )}

          {/* body sanitized in the service layer before it reaches this prop — FR-008.
              --frame-tint colours the fixed-aspect frames that globals.css puts
              around legacy images, which is what reserves their space. */}
          <div
            className="prose prose-archive mt-10 max-w-none"
            style={{ ["--frame-tint" as string]: style?.tint ?? "var(--tint-gray)" }}
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />

          {comments !== null && (
            <section
              className="mt-16 border-t border-hairline pt-8"
              aria-labelledby="comments-heading"
            >
              <h2 id="comments-heading" className="text-xl font-semibold text-ink">
                Komentar <span className="tabular font-normal text-slate">{comments.length}</span>
              </h2>
              {comments.length === 0 ? (
                <p className="mt-3 text-sm text-slate">Belum ada komentar.</p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {comments.map((comment) => (
                    <li
                      key={comment.id}
                      className="rounded-lg border border-hairline bg-surface-soft p-4"
                    >
                      <p className="text-sm font-medium break-words text-ink">
                        {comment.author}{" "}
                        <span className="font-normal text-slate">
                          &middot;{" "}
                          <time dateTime={comment.published} className="tabular">
                            {formatDate(comment.published)}
                          </time>
                        </span>
                      </p>
                      <div
                        className="prose prose-sm prose-archive mt-2 max-w-none"
                        dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
                      />
                    </li>
                  ))}
                </ul>
              )}
              {/* WF-02 (5): deliberately no comment form (FR-017) */}
              <p className="mt-5 text-[13px] text-slate">Komentar dikelola di Blogger.</p>
            </section>
          )}

          <p className="mt-16">
            <Link
              href="/arsip"
              transitionTypes={["nav-back"]}
              className="inline-flex items-center gap-2 rounded-md border border-hairline-strong px-4 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:border-primary hover:text-primary"
            >
              &larr; Kembali ke arsip
            </Link>
          </p>
        </article>
      </Shell>
    </Transition>
  );
}
