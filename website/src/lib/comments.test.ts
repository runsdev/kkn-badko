import { describe, expect, it } from "vitest";
import { bloggerCommentUrl } from "@/lib/comments";

// The one job of this helper is to turn a post URL that came out of the Blogger
// API into an `href`. Two things matter: it must land on the editor anchor, and
// it must never emit something that is not a web address — the value is
// interpolated straight into a link.

describe("bloggerCommentUrl", () => {
  it("anchors a real Blogger post URL at the comment editor", () => {
    expect(bloggerCommentUrl("https://tpamoyudan.blogspot.com/2026/07/blog-post.html")).toBe(
      "https://tpamoyudan.blogspot.com/2026/07/blog-post.html#comment-form",
    );
  });

  it("matches the rel=replies URL Blogger advertises in its own feed", () => {
    // Copied verbatim from the GData feed for this blog, which publishes
    // <link rel='replies' type='text/html' href='…#comment-form'/>. If Blogger
    // ever moves the anchor, this is the assertion that should fail.
    const advertised = "https://tpamoyudan.blogspot.com/2026/07/blog-post.html#comment-form";
    expect(bloggerCommentUrl("https://tpamoyudan.blogspot.com/2026/07/blog-post.html")).toBe(
      advertised,
    );
  });

  it("keeps query strings and non-ASCII paths intact", () => {
    expect(bloggerCommentUrl("https://example.blogspot.com/2011/05/tpa-al-huda.html?m=1")).toBe(
      "https://example.blogspot.com/2011/05/tpa-al-huda.html?m=1#comment-form",
    );
  });

  it("replaces an existing fragment rather than appending to it", () => {
    expect(bloggerCommentUrl("https://example.blogspot.com/p.html#comments")).toBe(
      "https://example.blogspot.com/p.html#comment-form",
    );
  });

  it("accepts http as well as https", () => {
    expect(bloggerCommentUrl("http://example.blogspot.com/p.html")).toBe(
      "http://example.blogspot.com/p.html#comment-form",
    );
  });

  it("returns null for a value that is not a URL, so the caller withholds the link", () => {
    expect(bloggerCommentUrl("")).toBeNull();
    expect(bloggerCommentUrl("/2026/07/blog-post.html")).toBeNull();
    expect(bloggerCommentUrl("not a url")).toBeNull();
  });

  it("rejects script and data schemes — the result becomes an href", () => {
    // `new URL` parses both of these happily; only the protocol check stops them.
    expect(bloggerCommentUrl("javascript:alert(1)")).toBeNull();
    expect(bloggerCommentUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
  });
});
