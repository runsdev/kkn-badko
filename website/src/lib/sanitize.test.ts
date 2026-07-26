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
