import { describe, expect, it } from "vitest";
import { sanitize, toPlainText } from "./sanitize";

// FR-008 / BR-005 / NFR-011 — the security boundary for all Blogger HTML
describe("sanitize", () => {
  it("strips script tags entirely", () => {
    const out = sanitize('<p>hi</p><script>alert("xss")</script>');
    expect(out).toBe("<p>hi</p>");
  });

  it("strips inline event handlers", () => {
    const out = sanitize('<a href="https://example.com" onclick="steal()">x</a>');
    expect(out).not.toContain("onclick");
    expect(out).toContain('href="https://example.com"');
  });

  it("strips javascript: URLs", () => {
    const out = sanitize("<a href=\"javascript:alert('xss')\">x</a>");
    expect(out).not.toContain("javascript:");
  });

  it("strips iframes (not in the allowlist)", () => {
    expect(sanitize('<iframe src="https://evil.example"></iframe>')).toBe("");
  });

  it("keeps images and adds lazy loading + async decoding", () => {
    const out = sanitize('<img src="https://blogger.googleusercontent.com/x.jpg" alt="a">');
    expect(out).toContain('loading="lazy"');
    expect(out).toContain('decoding="async"');
    expect(out).toContain('alt="a"');
  });

  it("forces rel=noopener noreferrer on links", () => {
    const out = sanitize('<a href="https://example.com" target="_blank">x</a>');
    expect(out).toContain('rel="noopener noreferrer"');
  });

  it("keeps typical Blogger content markup", () => {
    const html = "<h2>t</h2><ul><li>a</li></ul><blockquote>q</blockquote>";
    expect(sanitize(html)).toBe(html);
  });
});

describe("toPlainText", () => {
  it("drops all tags and collapses whitespace", () => {
    expect(toPlainText("<p>Hello   <b>world</b></p>\n<p>again</p>")).toBe("Hello world again");
  });
});

// Blogger's editor writes blocks back to back with no whitespace between them.
// Stripping the tags with nothing in their place ran the words together, and
// the excerpt is what the home page, the cards, and every meta description
// show — so this was visible on the site and in search results.
describe("toPlainText block boundaries", () => {
  it("separates blocks that Blogger emits with no whitespace between them", () => {
    // verbatim body of the 27 Jul 2026 post, which rendered as
    // "TES 123Subjudul 1Lorem ipsum" on the home page
    const body =
      '<h1 style="text-align: left;">&nbsp;TES 123</h1>' +
      '<h3 style="text-align: left;">Subjudul 1</h3>' +
      "<div>Lorem ipsum</div>";
    expect(toPlainText(body)).toBe("TES 123 Subjudul 1 Lorem ipsum");
  });

  it("separates list items, table cells, and line breaks", () => {
    expect(toPlainText("<ul><li>satu</li><li>dua</li></ul>")).toBe("satu dua");
    expect(toPlainText("<table><tr><td>a</td><td>b</td></tr></table>")).toBe("a b");
    expect(toPlainText("baris satu<br>baris dua")).toBe("baris satu baris dua");
    expect(toPlainText("<p>a</p><blockquote>b</blockquote>")).toBe("a b");
  });

  it("does NOT separate inline elements — a browser renders them joined", () => {
    // <b>foo</b>bar reads as "foobar" on the page; the plain text must agree
    expect(toPlainText("<p><b>foo</b>bar</p>")).toBe("foobar");
    expect(toPlainText("<p>Al-<em>Qur'an</em></p>")).toBe("Al-Qur'an");
    expect(toPlainText('<p>lihat <a href="https://x.test">di sini</a>ya</p>')).toBe(
      "lihat di siniya",
    );
  });

  it("inserts exactly one space, never a run", () => {
    expect(toPlainText("<div>\n  <p>a</p>\n  <p>b</p>\n</div>")).toBe("a b");
  });

  it("still refuses to treat an author's escaped markup as a tag", () => {
    // the boundary pass runs on raw HTML, where this is still "&lt;p&gt;"
    expect(toPlainText("<p>tulis &amp;lt;p&amp;gt;</p>")).toBe("tulis &lt;p&gt;");
    expect(toPlainText("<p>a &lt;div&gt; b</p>")).toBe("a <div> b");
  });
});

describe("toPlainText entity decoding", () => {
  // sanitize-html returns HTML, so it leaves &, <, > and " encoded. As a React
  // text node those rendered literally — real excerpts on the site read
  // "santri &amp; membenarkan".
  it("decodes the ampersand that leaked into excerpts", () => {
    expect(toPlainText("<p>santri &amp; membenarkan</p>")).toBe("santri & membenarkan");
    expect(toPlainText("<p>santri & membenarkan</p>")).toBe("santri & membenarkan");
  });

  it("decodes angle brackets and quotes", () => {
    expect(toPlainText("<p>a &lt;b&gt; c</p>")).toBe("a <b> c");
    expect(toPlainText("<p>dia bilang &quot;ya&quot;</p>")).toBe('dia bilang "ya"');
  });

  it("preserves an author's literal escaped markup", () => {
    // "&amp;lt;" is how a post writes the visible text "&lt;" — decoding the
    // ampersand first would collapse it to "<" and change what was written
    expect(toPlainText("<p>tulis &amp;lt;br&amp;gt;</p>")).toBe("tulis &lt;br&gt;");
  });

  it("still decodes the entities sanitize-html already handled", () => {
    expect(toPlainText("<p>&ldquo;bagus&rdquo;</p>")).toBe("“bagus”");
    expect(toPlainText("<p>Al-Qur&#39;an</p>")).toBe("Al-Qur'an");
    expect(toPlainText("<p>a&nbsp;b</p>")).toBe("a b");
  });

  it("still strips tags and collapses whitespace", () => {
    expect(toPlainText("<div><p>a</p>\n\n  <p>b</p></div>")).toBe("a b");
  });
});
