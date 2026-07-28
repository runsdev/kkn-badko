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
