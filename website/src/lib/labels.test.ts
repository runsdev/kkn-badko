import { describe, expect, it } from "vitest";
import { LABEL_ORDER, canonicalLabel, isKnownLabel, labelStyle, primaryLabel } from "@/lib/labels";

// The label map is the whole design's single source of colour, so the
// contract that matters is: every taxonomy label resolves, unknown labels
// degrade instead of throwing, and no two labels share an accent.
describe("labelStyle", () => {
  it("resolves every label in the taxonomy", () => {
    for (const label of LABEL_ORDER) {
      const style = labelStyle(label);
      expect(style.accent).toMatch(/^var\(--/);
      expect(style.tint).toMatch(/^var\(--/);
      expect(style.deep).toMatch(/^var\(--/);
      expect(style.display.length).toBeGreaterThan(0);
    }
  });

  it("is case- and whitespace-insensitive, since Blogger labels are free text", () => {
    expect(labelStyle(" foto ")).toEqual(labelStyle("FOTO"));
    expect(labelStyle("Berita")).toEqual(labelStyle("BERITA"));
  });

  it("falls back to a neutral pair for a label added later in Blogger", () => {
    const style = labelStyle("KEGIATAN BARU");
    expect(style.accent).toBe("var(--stone)");
    expect(style.tint).toBe("var(--tint-gray)");
    expect(style.deep).toBe("var(--charcoal)");
    // the fallback keeps the editor's own wording rather than inventing one
    expect(style.display).toBe("KEGIATAN BARU");
  });

  it("gives each label its own accent, so the legend is unambiguous", () => {
    const accents = LABEL_ORDER.map((l) => labelStyle(l).accent);
    expect(new Set(accents).size).toBe(LABEL_ORDER.length);
  });
});

describe("isKnownLabel", () => {
  it("recognises the taxonomy and rejects anything else", () => {
    expect(isKnownLabel("FOTO")).toBe(true);
    expect(isKnownLabel("bcm")).toBe(true);
    expect(isKnownLabel("KEGIATAN BARU")).toBe(false);
  });
});

describe("primaryLabel", () => {
  it("prefers a taxonomy label so the card tint is stable across rebuilds", () => {
    // Blogger returns labels in arbitrary order
    expect(primaryLabel(["tak dikenal", "BERITA"])).toBe("BERITA");
    expect(primaryLabel(["BERITA", "tak dikenal"])).toBe("BERITA");
  });

  it("falls back to the first label when none are in the taxonomy", () => {
    expect(primaryLabel(["satu", "dua"])).toBe("satu");
  });

  it("returns undefined for an unlabelled post", () => {
    expect(primaryLabel([])).toBeUndefined();
  });
});

describe("canonicalLabel", () => {
  it("normalises a taxonomy label to the casing Blogger stores", () => {
    // Blogger's labels= filter is case-sensitive: labels=foto returns zero.
    expect(canonicalLabel("foto")).toBe("FOTO");
    expect(canonicalLabel(" Berita ")).toBe("BERITA");
    expect(canonicalLabel("FOTO")).toBe("FOTO");
  });

  it("passes an unknown label through trimmed, preserving the editor's casing", () => {
    expect(canonicalLabel("  Kegiatan Baru  ")).toBe("Kegiatan Baru");
  });
});
