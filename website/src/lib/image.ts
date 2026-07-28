// First-image extraction for post cards, and Blogger CDN size rewriting.
//
// blogger.ts already requests `content` on the list endpoints, so a thumbnail
// costs zero extra API calls — the HTML is in hand. This module only reads it.
//
// Not server-only: the pure helpers are unit-tested and safe either side.

/** Longest-edge / width renditions we ask the Blogger CDN for. */
export const CARD_WIDTH = 800;
export const HERO_WIDTH = 1600;

/**
 * Hosts `next.config.ts` allows through the image optimizer.
 *
 * This list must stay in step with `images.remotePatterns`. It is not
 * belt-and-braces: next/image's default loader **throws** for a host or
 * protocol it does not recognise, and that propagates out of the component and
 * takes down the whole page with error.tsx — a single stray `http://` or
 * `lh3.ggpht.com` URL in one post would 500 the route rather than just drop a
 * thumbnail. Blogger is a live, editable source and 2009-era markup routinely
 * carries both, so an unrecognised URL is discarded here instead.
 */
const ALLOWED_HOSTS = [/\.googleusercontent\.com$/i, /\.blogspot\.com$/i, /\.ggpht\.com$/i];

function isOptimizable(url: string): boolean {
  try {
    const parsed = new URL(url);
    // https only: remotePatterns pins the protocol, and http would throw
    if (parsed.protocol !== "https:") return false;
    return ALLOWED_HOSTS.some((host) => host.test(parsed.hostname));
  } catch {
    return false;
  }
}

/**
 * Blogger CDN paths carry the rendition as a path segment — `/s320/name.jpg`
 * means "longest edge 320px". Archive markup is all `/s320/`, which is far too
 * small to render at card or hero size, but the segment can be rewritten and
 * the CDN serves the larger original (verified: /s1600/ -> 254KB, HTTP 200).
 *
 * `/wNNN/` constrains width specifically, which is what a fixed-width card
 * wants. Returns the URL unchanged when it carries no recognisable segment.
 */
export function resizeBloggerImage(url: string, width: number): string {
  if (!/(^|\/)(?:s\d+|w\d+|h\d+)(?:-[a-z0-9-]+)?\//i.test(url)) return url;
  return url.replace(/(^|\/)(?:s\d+|w\d+|h\d+)(?:-[a-z0-9-]+)?\//i, `$1w${width}/`);
}

/**
 * First usable `<img src>` in a chunk of post HTML, or undefined.
 *
 * Deliberately a regex rather than a parser: this runs on the list endpoint's
 * payload for every post on every page, and the only thing being read is one
 * src attribute. Skips anything the image optimizer would reject, and skips the
 * 1x1 spacer pixels some legacy Blogger posts carry.
 */
export function firstImageUrl(html: string): string | undefined {
  if (!html) return undefined;
  const tags = html.match(/<img\b[^>]*>/gi);
  if (!tags) return undefined;

  for (const tag of tags) {
    // (^|\s) so `data-src` and `lazy-src` cannot be mistaken for `src`
    const src = tag.match(/(?:^|\s)src\s*=\s*["']([^"']+)["']/i)?.[1];
    if (!src || !isOptimizable(src)) continue;
    // a declared 1-or-2px edge is a spacer, not a photograph
    const w = Number(tag.match(/\bwidth\s*=\s*["']?(\d+)/i)?.[1] ?? NaN);
    const h = Number(tag.match(/\bheight\s*=\s*["']?(\d+)/i)?.[1] ?? NaN);
    if ((w && w <= 2) || (h && h <= 2)) continue;
    return src;
  }
  return undefined;
}

/** Convenience: extract and upsize in one step. */
export function cardImage(html: string, width = CARD_WIDTH): string | undefined {
  const url = firstImageUrl(html);
  return url ? resizeBloggerImage(url, width) : undefined;
}

/**
 * Remove the `<img>` that the detail page promoted to a hero.
 *
 * Matched by source rather than by position. Removing "the first img" was
 * wrong on two counts: `firstImageUrl` skips spacers and non-optimizable
 * sources that a positional strip would delete instead, leaving the real photo
 * in the body and rendering the hero twice; and the hero URL is derived from
 * the *raw* content while this runs on the *sanitized* content, so the two are
 * not guaranteed to agree on which tag is first.
 *
 * Blogger wraps photos as `<a href="…full.jpg"><img …></a>`, so when the anchor
 * holds nothing but the image the anchor goes too — otherwise it would be left
 * behind as an empty link.
 */
export function stripFirstImage(html: string, heroUrl?: string): string {
  const tags = html.match(/<img\b[^>]*>/gi);
  if (!tags) return html;

  // Compare on the un-resized source: heroUrl has had its rendition rewritten.
  const target = heroUrl
    ? tags.find((tag) => {
        const src = tag.match(/(?:^|\s)src\s*=\s*["']([^"']+)["']/i)?.[1];
        return src ? resizeBloggerImage(src, 1) === resizeBloggerImage(heroUrl, 1) : false;
      })
    : tags[0];
  if (!target) return html;

  const at = html.indexOf(target);
  const before = html.slice(0, at);
  const after = html.slice(at + target.length);

  const openAnchor = before.match(/<a\b[^>]*>\s*$/i);
  const closeAnchor = after.match(/^\s*<\/a>/i);
  if (openAnchor && closeAnchor) {
    return (
      before.slice(0, before.length - openAnchor[0].length) + after.slice(closeAnchor[0].length)
    );
  }
  return before + after;
}
