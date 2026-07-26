import "server-only";
import sanitizeHtml from "sanitize-html";

// FR-008 / BR-005 / NFR-011: every piece of HTML from Blogger passes
// through here before rendering. Scripts, event handlers, iframes, and
// non-http(s) URLs are stripped by sanitize-html's defaults.

const options: sanitizeHtml.IOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "figure", "figcaption"],
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "srcset", "sizes", "alt", "title", "width", "height", "loading"],
    a: ["href", "name", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }), // WF-02 (3)
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
  },
};

export function sanitize(html: string): string {
  return sanitizeHtml(html, options);
}

export function toPlainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
}
