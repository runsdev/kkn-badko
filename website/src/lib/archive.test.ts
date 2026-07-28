import { describe, expect, it } from "vitest";
import {
  archiveShape,
  byLabel,
  contributors,
  labelCounts,
  monthsByYear,
  postsInMonth,
  yearCounts,
} from "@/lib/archive";
import type { PostSummary } from "@/lib/types";

function post(id: string, published: string, labels: string[]): PostSummary {
  return { id, title: id, slug: id, published, labels, excerpt: "" };
}

// Mirrors the real archive's shape: 2009 x2, 2010 x2, 2011 x1, no 2012.
const ARCHIVE = [
  post("a", "2011-10-20T00:00:00Z", ["LINK"]),
  post("b", "2010-12-23T00:00:00Z", ["BCM", "TIPS"]),
  post("c", "2010-11-16T00:00:00Z", ["FOTO"]),
  post("d", "2009-07-05T00:00:00Z", ["BERITA"]),
  post("e", "2009-05-20T00:00:00Z", ["PROFIL"]),
];

describe("byLabel", () => {
  it("filters by a single label", () => {
    expect(byLabel(ARCHIVE, "FOTO").map((p) => p.id)).toEqual(["c"]);
  });

  it("is case-insensitive", () => {
    expect(byLabel(ARCHIVE, "foto").map((p) => p.id)).toEqual(["c"]);
  });

  it("unions several labels without duplicating a post that carries both", () => {
    // "b" is labelled BCM *and* TIPS — the teaching band must not show it twice
    expect(byLabel(ARCHIVE, "TIPS", "BCM").map((p) => p.id)).toEqual(["b"]);
  });

  it("preserves the index's newest-first order", () => {
    expect(byLabel(ARCHIVE, "LINK", "PROFIL").map((p) => p.id)).toEqual(["a", "e"]);
  });
});

describe("labelCounts", () => {
  it("counts every label, including both on a doubly-labelled post", () => {
    const counts = labelCounts(ARCHIVE);
    expect(counts.find((c) => c.label === "BCM")?.count).toBe(1);
    expect(counts.find((c) => c.label === "TIPS")?.count).toBe(1);
  });

  it("orders the taxonomy first so the hero legend is stable", () => {
    const order = labelCounts(ARCHIVE).map((c) => c.label);
    expect(order).toEqual(["FOTO", "BERITA", "TIPS", "PROFIL", "BCM", "LINK"]);
  });

  it("appends labels added later in Blogger rather than dropping them", () => {
    const counts = labelCounts([...ARCHIVE, post("f", "2012-01-01T00:00:00Z", ["KEGIATAN"])]);
    expect(counts.at(-1)).toEqual({ label: "KEGIATAN", count: 1 });
  });

  it("normalises case and whitespace, since Blogger labels are free text", () => {
    const counts = labelCounts([
      post("x", "2010-01-01T00:00:00Z", ["foto"]),
      post("y", "2010-01-02T00:00:00Z", [" FOTO "]),
    ]);
    expect(counts).toEqual([{ label: "FOTO", count: 2 }]);
  });

  it("returns nothing for an empty archive", () => {
    expect(labelCounts([])).toEqual([]);
  });
});

describe("yearCounts", () => {
  it("counts per year, oldest first", () => {
    expect(yearCounts(ARCHIVE)).toEqual([
      { year: "2009", count: 2 },
      { year: "2010", count: 2 },
      { year: "2011", count: 1 },
    ]);
  });

  it("keeps a silent year inside the span as a zero row", () => {
    // the gap is part of what the timeline is saying, so it is not collapsed
    const gapped = [post("a", "2011-01-01T00:00:00Z", []), post("b", "2009-01-01T00:00:00Z", [])];
    expect(yearCounts(gapped)).toEqual([
      { year: "2009", count: 1 },
      { year: "2010", count: 0 },
      { year: "2011", count: 1 },
    ]);
  });

  it("returns nothing for an empty archive", () => {
    expect(yearCounts([])).toEqual([]);
  });
});

describe("archiveShape", () => {
  it("summarises totals, labels and the span", () => {
    const shape = archiveShape(ARCHIVE);
    expect(shape.total).toBe(5);
    expect(shape.labels).toHaveLength(6);
    expect(shape.span).toBe("2009–2011");
  });

  it("renders a single-year archive as one year, not a range", () => {
    expect(archiveShape([post("a", "2010-01-01T00:00:00Z", [])]).span).toBe("2010");
  });

  it("survives an empty archive without inventing a span", () => {
    expect(archiveShape([])).toEqual({ total: 0, labels: [], years: [], span: "" });
  });
});

// D-07 — the native equivalents of Blogger's BlogArchive and Profile gadgets.
describe("monthsByYear", () => {
  it("groups months under years, both newest first", () => {
    const groups = monthsByYear(ARCHIVE);
    expect(groups.map((g) => g.year)).toEqual(["2011", "2010", "2009"]);
    expect(groups[2].months.map((m) => m.month)).toEqual([7, 5]);
  });

  it("counts each month and rolls the year total up from them", () => {
    const groups = monthsByYear(ARCHIVE);
    const y2009 = groups.find((g) => g.year === "2009")!;
    expect(y2009.months).toEqual([
      { year: "2009", month: 7, count: 1, href: "/arsip/2009/07" },
      { year: "2009", month: 5, count: 1, href: "/arsip/2009/05" },
    ]);
    expect(y2009.count).toBe(2);
  });

  it("zero-pads the month in the href, matching the route's canonical form", () => {
    // the route rejects /arsip/2009/7, so the link must not generate it
    const hrefs = monthsByYear(ARCHIVE).flatMap((g) => g.months.map((m) => m.href));
    expect(hrefs.every((h) => /^\/arsip\/\d{4}\/(0[1-9]|1[0-2])$/.test(h))).toBe(true);
  });

  it("omits empty months, unlike yearCounts which keeps empty years", () => {
    // a silent year says "the archive went quiet"; eleven silent months say
    // nothing and would bury the month that holds most of the posts
    const groups = monthsByYear(ARCHIVE);
    expect(groups.flatMap((g) => g.months).every((m) => m.count > 0)).toBe(true);
    expect(groups.find((g) => g.year === "2010")!.months).toHaveLength(2);
  });

  it("returns nothing for an empty archive", () => {
    expect(monthsByYear([])).toEqual([]);
  });
});

describe("postsInMonth", () => {
  it("returns only that month's posts, newest first", () => {
    expect(postsInMonth(ARCHIVE, 2010, 12).map((p) => p.id)).toEqual(["b"]);
    expect(postsInMonth(ARCHIVE, 2009, 7).map((p) => p.id)).toEqual(["d"]);
  });

  it("returns nothing for a month with no posts, rather than throwing", () => {
    expect(postsInMonth(ARCHIVE, 2010, 6)).toEqual([]);
    expect(postsInMonth(ARCHIVE, 1999, 1)).toEqual([]);
  });
});

describe("contributors", () => {
  const authored = [
    post("a", "2011-01-01T00:00:00Z", []),
    post("b", "2010-01-01T00:00:00Z", []),
    post("c", "2009-01-01T00:00:00Z", []),
  ];
  authored[0].author = "Badko Rayon";
  authored[1].author = "Badko Rayon";
  authored[2].author = "Harun664";

  it("tallies distinct authors, most posts first", () => {
    expect(contributors(authored)).toEqual([
      { name: "Badko Rayon", count: 2 },
      { name: "Harun664", count: 1 },
    ]);
  });

  it("drops blank authors rather than showing an empty row", () => {
    // Post.author is "" whenever Blogger omits a display name
    expect(contributors(ARCHIVE)).toEqual([]);
  });

  it("trims, so the same person is not counted twice", () => {
    const a = post("x", "2010-01-01T00:00:00Z", []);
    const b = post("y", "2010-01-02T00:00:00Z", []);
    a.author = " Badko Rayon ";
    b.author = "Badko Rayon";
    expect(contributors([a, b])).toEqual([{ name: "Badko Rayon", count: 2 }]);
  });
});
