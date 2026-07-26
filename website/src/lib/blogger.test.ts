import { describe, expect, it } from "vitest";
import { slugFromPostUrl } from "./blogger";

// FR-007 — slug derivation drives the /posts/[slug] route
describe("slugFromPostUrl", () => {
  it("extracts the slug from a Blogger post URL", () => {
    expect(slugFromPostUrl("https://tpamoyudan.blogspot.com/2009/05/daftar-tpa.html")).toBe(
      "daftar-tpa",
    );
  });

  it("handles Blogger's dedup-suffixed slugs", () => {
    expect(slugFromPostUrl("https://x.blogspot.com/2009/05/daftar_01520857899.html")).toBe(
      "daftar_01520857899",
    );
  });

  it("handles URLs without .html", () => {
    expect(slugFromPostUrl("https://x.blogspot.com/2009/05/plain")).toBe("plain");
  });
});
