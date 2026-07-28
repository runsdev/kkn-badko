import { describe, expect, it } from "vitest";
import { cardImage, firstImageUrl, resizeBloggerImage, stripFirstImage } from "@/lib/image";

// A real archive URL, shortened. Every image in the blog is this shape.
const BLOGGER =
  "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhRa_nq/s320/DSC_0265.JPG";

describe("resizeBloggerImage", () => {
  it("rewrites the rendition segment, since /s320/ is far too small to render", () => {
    expect(resizeBloggerImage(BLOGGER, 800)).toBe(
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhRa_nq/w800/DSC_0265.JPG",
    );
  });

  it("re-resizes an already-rewritten URL, so card -> hero widening works", () => {
    const card = resizeBloggerImage(BLOGGER, 800);
    expect(resizeBloggerImage(card, 1600)).toContain("/w1600/");
    expect(resizeBloggerImage(card, 1600)).not.toContain("/w800/");
  });

  it("handles the h-prefixed and suffixed rendition forms Blogger also emits", () => {
    expect(resizeBloggerImage("https://x.test/a/h400/p.jpg", 800)).toBe(
      "https://x.test/a/w800/p.jpg",
    );
    expect(resizeBloggerImage("https://x.test/a/s320-c/p.jpg", 800)).toBe(
      "https://x.test/a/w800/p.jpg",
    );
  });

  it("leaves a URL with no rendition segment untouched", () => {
    const plain = "https://example.test/photo.jpg";
    expect(resizeBloggerImage(plain, 800)).toBe(plain);
  });
});

describe("firstImageUrl", () => {
  it("finds the first image in post HTML", () => {
    const html = `<div><a href="x"><img src="${BLOGGER}" /></a><img src="https://x.test/b.jpg"></div>`;
    expect(firstImageUrl(html)).toBe(BLOGGER);
  });

  it("returns undefined for the 15 archive posts that carry no image", () => {
    expect(firstImageUrl("<p>Hanya teks.</p>")).toBeUndefined();
    expect(firstImageUrl("")).toBeUndefined();
  });

  it("ignores non-http sources, so a thumbnail cannot smuggle in inline data", () => {
    const html = `<img src="data:image/gif;base64,R0lGOD"><img src="${BLOGGER}">`;
    expect(firstImageUrl(html)).toBe(BLOGGER);
  });

  it("skips spacer pixels that legacy Blogger markup carries", () => {
    const html = `<img src="https://x.test/px.gif" width="1" height="1"><img src="${BLOGGER}">`;
    expect(firstImageUrl(html)).toBe(BLOGGER);
  });

  it("accepts single-quoted attributes", () => {
    expect(firstImageUrl("<img src='https://blogger.googleusercontent.com/a.jpg'>")).toBe(
      "https://blogger.googleusercontent.com/a.jpg",
    );
  });

  it("does not mistake data-src for src", () => {
    const html = `<img data-src="https://blogger.googleusercontent.com/lazy.jpg" src="${BLOGGER}">`;
    expect(firstImageUrl(html)).toBe(BLOGGER);
  });

  it("skips hosts and protocols the image optimizer would reject", () => {
    // next/image's loader THROWS on an unrecognised host or protocol, which
    // propagates to error.tsx and 500s the whole page — so these are dropped
    // here rather than handed to <Image>.
    expect(firstImageUrl('<img src="http://1.bp.blogspot.com/a.jpg">')).toBeUndefined();
    expect(firstImageUrl('<img src="https://evil.test/a.jpg">')).toBeUndefined();
    expect(firstImageUrl('<img src="https://lh3.ggpht.com/a.jpg">')).toBe(
      "https://lh3.ggpht.com/a.jpg",
    );
  });

  it("falls through a rejected source to a usable one", () => {
    const html = `<img src="http://old.blogspot.com/a.jpg"><img src="${BLOGGER}">`;
    expect(firstImageUrl(html)).toBe(BLOGGER);
  });
});

describe("cardImage", () => {
  it("extracts and upsizes in one step", () => {
    expect(cardImage(`<img src="${BLOGGER}">`)).toContain("/w800/");
  });

  it("is undefined when there is no image to extract", () => {
    expect(cardImage("<p>x</p>")).toBeUndefined();
  });
});

describe("stripFirstImage", () => {
  it("removes the image the detail page promotes to a hero", () => {
    const html = `<p>Teks.</p><img src="${BLOGGER}" /><p>Lagi.</p>`;
    const out = stripFirstImage(html);
    expect(out).not.toContain("<img");
    expect(out).toContain("<p>Teks.</p>");
    expect(out).toContain("<p>Lagi.</p>");
  });

  it("removes the wrapping anchor too, rather than leaving an empty link", () => {
    const html = `<div class="separator"><a href="https://x.test/full.jpg"><img src="${BLOGGER}" /></a></div>`;
    const out = stripFirstImage(html);
    expect(out).not.toContain("<img");
    expect(out).not.toContain("<a ");
    expect(out).toContain('<div class="separator">');
  });

  it("keeps an anchor that holds more than the image", () => {
    const html = `<a href="https://x.test"><img src="${BLOGGER}" />Lihat foto</a>`;
    const out = stripFirstImage(html);
    expect(out).not.toContain("<img");
    expect(out).toContain("<a ");
    expect(out).toContain("Lihat foto");
  });

  it("leaves later images in place — only the hero is de-duplicated", () => {
    const html = `<img src="${BLOGGER}"><img src="https://x.test/b.jpg">`;
    const out = stripFirstImage(html);
    expect(out.match(/<img/g)).toHaveLength(1);
    expect(out).toContain("https://x.test/b.jpg");
  });

  it("is a no-op when there is no image", () => {
    expect(stripFirstImage("<p>x</p>")).toBe("<p>x</p>");
  });

  it("removes the hero by source, not by position", () => {
    // A spacer pixel ahead of the real photo: firstImageUrl skips the spacer,
    // so a positional strip would delete the spacer and leave the photo in the
    // body — rendering the hero twice.
    const html = `<img src="https://blogger.googleusercontent.com/px.gif" width="1" height="1"><img src="${BLOGGER}"><p>Teks.</p>`;
    const hero = cardImage(html);
    const out = stripFirstImage(html, hero);
    expect(out).toContain("px.gif");
    expect(out).not.toContain("DSC_0265");
    expect(out).toContain("<p>Teks.</p>");
  });

  it("matches the hero even though its rendition segment was rewritten", () => {
    const html = `<p>a</p><img src="${BLOGGER}">`;
    // hero is /w1600/, the body tag is still /s320/
    const out = stripFirstImage(html, resizeBloggerImage(BLOGGER, 1600));
    expect(out).not.toContain("<img");
  });

  it("leaves the body alone when the hero is not present in it", () => {
    const html = `<p>a</p><img src="https://blogger.googleusercontent.com/other/s320/b.jpg">`;
    const out = stripFirstImage(html, resizeBloggerImage(BLOGGER, 1600));
    expect(out).toContain("b.jpg");
  });
});
