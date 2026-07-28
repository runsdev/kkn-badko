// Where a reader is sent to write a comment (FEAT-006 follow-on).
//
// There is no API that can create a comment on this blog:
//
//   - Blogger API v3's Comments resource has list/get/approve/delete/
//     markAsSpam/removeContent and no `insert`.
//   - The legacy GData v2 comment feed still SERVES, but no longer ACCEPTS.
//     Probed against this blog on 2026-07-27: POST to
//     https://www.blogger.com/feeds/{blogId}/{postId}/comments/default returns
//     200 with a body byte-identical to the GET response (same md5) — the
//     method is ignored and the read feed is served. Seven of eight URI, auth
//     and header variants did the same (the eighth 404'd), with or without a
//     valid Atom entry, with or without a token; none created a comment. There
//     is no status code to branch on and no error body to surface, so a client
//     for it could not even report its own failure — it would just swallow
//     whatever a reader wrote. See 06-redesign/New_Posts_And_Comments.md.
//
// Blogger's own editor is the only surface that still accepts one, so that is
// what the reader is linked to. Every Blogger post page renders an anchor named
// `comment-form` immediately above the editor, and Blogger advertises exactly
// that URL in its own feed as the post's rel="replies" type="text/html" link —
// so this is Blogger's canonical comment address, not a constructed guess.

const COMMENT_ANCHOR = "comment-form";

/**
 * The Blogger comment-editor URL for a post, or null if `postUrl` is not a
 * usable web address.
 *
 * The input is a field from an API response that is about to become an `href`,
 * so the scheme is checked rather than assumed: `javascript:alert(1)` is a
 * perfectly valid URL as far as `new URL` is concerned, and would be a script
 * injection if passed through. Any existing fragment is replaced — Blogger's
 * post URLs carry none, but a caller-supplied one must not survive into a link
 * that is meant to land on the editor.
 */
export function bloggerCommentUrl(postUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(postUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  url.hash = COMMENT_ANCHOR;
  return url.toString();
}
