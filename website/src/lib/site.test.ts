import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { siteUrl } from "@/lib/site";

// siteUrl() feeds metadataBase, every canonical, every og:url, the JSON-LD
// mainEntityOfPage, robots.txt's Sitemap line, and all 55 sitemap <loc>
// values. A wrong value here is not a cosmetic bug — it is the whole site
// telling search engines to index a host that does not exist. It did exactly
// that in production; see 07-seo/SEO_Plan.md §1.

const VARS = ["NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL"] as const;

let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = Object.fromEntries(VARS.map((v) => [v, process.env[v]]));
  for (const v of VARS) delete process.env[v];
});

afterEach(() => {
  for (const v of VARS) {
    if (saved[v] === undefined) delete process.env[v];
    else process.env[v] = saved[v];
  }
});

describe("siteUrl", () => {
  it("uses the explicit value when one is set", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://badkotpamoyudan.or.id";
    expect(siteUrl()).toBe("https://badkotpamoyudan.or.id");
  });

  it("falls back to the Vercel production host", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "badkotpamoyudan.vercel.app";
    expect(siteUrl()).toBe("https://badkotpamoyudan.vercel.app");
  });

  it("falls back to localhost when nothing is configured", () => {
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  it("still honours an explicit localhost during local development", () => {
    // no VERCEL_PROJECT_PRODUCTION_URL — this is a developer's machine
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    expect(siteUrl()).toBe("http://localhost:3000");
  });

  describe("the production regression", () => {
    beforeEach(() => {
      process.env.VERCEL_PROJECT_PRODUCTION_URL = "badkotpamoyudan.vercel.app";
    });

    it("ignores a leftover localhost on a real deployment", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
      expect(siteUrl()).toBe("https://badkotpamoyudan.vercel.app");
    });

    it.each([
      "http://localhost:3000",
      "http://localhost",
      "http://127.0.0.1:3000",
      "http://0.0.0.0:8080",
      "http://[::1]:3000",
      "http://site.localhost:3000",
    ])("ignores %s in favour of the Vercel host", (value) => {
      process.env.NEXT_PUBLIC_SITE_URL = value;
      expect(siteUrl()).toBe("https://badkotpamoyudan.vercel.app");
    });

    it("does NOT override a legitimate explicit host", () => {
      // the guard must be narrow: a real custom domain still wins, which is
      // how the site moves off vercel.app later
      process.env.NEXT_PUBLIC_SITE_URL = "https://badkotpamoyudan.or.id";
      expect(siteUrl()).toBe("https://badkotpamoyudan.or.id");
    });

    it("does not mistake a hostname that merely contains 'localhost'", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://localhost.example.com";
      expect(siteUrl()).toBe("https://localhost.example.com");
    });
  });

  describe("trailing slashes", () => {
    // callers concatenate: `${siteUrl()}/arsip`, `${base}${m.href}`
    it("strips one, so paths do not double up", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://badkotpamoyudan.or.id/";
      expect(siteUrl()).toBe("https://badkotpamoyudan.or.id");
      expect(`${siteUrl()}/arsip`).toBe("https://badkotpamoyudan.or.id/arsip");
    });

    it("strips several", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "https://badkotpamoyudan.or.id///";
      expect(siteUrl()).toBe("https://badkotpamoyudan.or.id");
    });

    it("trims surrounding whitespace from a pasted value", () => {
      process.env.NEXT_PUBLIC_SITE_URL = "  https://badkotpamoyudan.or.id  ";
      expect(siteUrl()).toBe("https://badkotpamoyudan.or.id");
    });
  });
});
