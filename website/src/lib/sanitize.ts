import "server-only";
import sanitizeHtml from "sanitize-html";

// FR-008 / BR-005 / NFR-011: every piece of HTML from Blogger passes
// through here before rendering. Scripts, event handlers, iframes, and
// non-http(s) URLs are stripped by sanitize-html's defaults.

const options: sanitizeHtml.IOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "figure", "figcaption"],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "srcset", "sizes", "alt", "title", "width", "height", "loading", "decoding"],
    a: ["href", "name", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    // WF-02 (3) / task 2.3.5: lazy-load + async-decode every content image,
    // and guarantee an `alt` attribute — an <img> with none at all is an
    // accessibility failure, while an empty alt correctly marks the image as
    // decorative alongside the post's own heading and body (NFR-016).
    //
    // Deliberately NOT simpleTransform: it overwrites rather than fills, so
    // `alt: ""` there would wipe any real description Blogger did carry.
    img: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        loading: "lazy",
        decoding: "async",
        alt: attribs.alt ?? "",
      },
    }),
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

export function sanitize(html: string): string {
  return sanitizeHtml(html, options);
}

/**
 * Entities that survive tag-stripping and must be decoded for plain text.
 *
 * `sanitize-html` with no allowed tags still returns *HTML*, so it correctly
 * leaves `&`, `<`, `>` and `"` encoded. Rendered as a React text node that
 * shows up literally — "santri &amp; membenarkan" on the page. It does decode
 * everything else (`&nbsp;`, `&ldquo;`, `&#39;`), so only these four need
 * handling.
 *
 * `&amp;` must be decoded LAST: doing it first would turn the escaped literal
 * `&amp;lt;` into `&lt;` and then into `<`, changing the author's text.
 */
const PLAIN_TEXT_ENTITIES: [RegExp, string][] = [
  [/&lt;/g, "<"],
  [/&gt;/g, ">"],
  [/&quot;/g, '"'],
  [/&amp;/g, "&"],
];

export function toPlainText(html: string): string {
  let text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  for (const [pattern, char] of PLAIN_TEXT_ENTITIES) text = text.replace(pattern, char);
  return text.replace(/\s+/g, " ").trim();
}
