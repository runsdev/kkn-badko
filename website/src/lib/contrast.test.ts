import { describe, expect, it } from "vitest";
import { LABEL_ORDER, labelStyle } from "@/lib/labels";

// Contrast regression guard.
//
// This project has already lost accessibility points twice to a colour that
// looked fine: a disabled control at 1.96:1 (QA_Report.md:37), and — caught in
// review during this redesign — the active label pill, where white text on the
// mid-tone accents measured as low as 1.42:1. Both were invisible in code.
//
// So the palette is asserted, not just documented. `labels.ts` stores CSS
// variable references, so the hex values are resolved from the same table that
// globals.css declares; if a token is renamed or added without a value here,
// the test fails rather than silently skipping.

/** Every colour token declared in src/app/globals.css :root. */
const TOKENS: Record<string, string> = {
  "--primary": "#5645d4",
  "--primary-pressed": "#4534b3",
  "--on-primary": "#ffffff",
  "--navy": "#0a1530",
  "--link": "#0075de",
  "--link-pressed": "#005bab",
  "--orange": "#dd5b00",
  "--orange-deep": "#793400",
  "--pink": "#ff64c8",
  "--pink-deep": "#a02e6d",
  "--purple": "#7b3ff2",
  "--purple-800": "#391c57",
  "--teal": "#2a9d99",
  "--teal-deep": "#1c6b68",
  "--yellow": "#f5d75e",
  "--brown": "#523410",
  "--tint-peach": "#ffe8d4",
  "--tint-rose": "#fde0ec",
  "--tint-mint": "#d9f3e1",
  "--tint-lavender": "#e6e0f5",
  "--tint-sky": "#dcecfa",
  "--tint-yellow": "#fef7d6",
  "--tint-yellow-bold": "#f9e79f",
  "--tint-gray": "#f0eeec",
  "--canvas": "#ffffff",
  "--surface": "#f6f5f4",
  "--surface-soft": "#fafaf9",
  "--ink": "#1a1a1a",
  "--charcoal": "#37352f",
  "--slate": "#5d5b54",
  "--stone": "#a4a097",
  "--on-dark": "#ffffff",
  "--on-dark-muted": "#a4a097",
  "--error": "#c92a2a",
};

function resolve(value: string): string {
  const name = value.match(/^var\((--[a-z0-9-]+)\)$/)?.[1];
  if (!name) return value;
  const hex = TOKENS[name];
  if (!hex) throw new Error(`Unknown colour token ${name} — add it to TOKENS`);
  return hex;
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const h = resolve(hex).replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)];
  const [hi, lo] = x > y ? [x, y] : [y, x];
  return (hi + 0.05) / (lo + 0.05);
}

const AA_NORMAL = 4.5;

describe("label colour pairs", () => {
  it.each(LABEL_ORDER)("%s chip: deep text on its tint clears AA", (label) => {
    const s = labelStyle(label);
    expect(contrast(s.deep, s.tint)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it.each(LABEL_ORDER)("%s active pill: white on deep clears AA", (label) => {
    const s = labelStyle(label);
    expect(contrast("var(--on-dark)", s.deep)).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it.each(LABEL_ORDER)("%s accent is NOT safe under white text — deep must be used", (label) => {
    // Documents why `accent` is decorative only. If a future palette change
    // makes an accent safe this will fail, which is the prompt to revisit
    // LabelSwitcher rather than a reason to loosen the rule.
    const s = labelStyle(label);
    const white = contrast("var(--on-dark)", s.accent);
    const deep = contrast("var(--on-dark)", s.deep);
    expect(deep).toBeGreaterThan(white);
  });
});

describe("text tokens", () => {
  const SURFACES = ["--canvas", "--surface", "--surface-soft"] as const;

  it.each(["--ink", "--charcoal", "--slate"])("%s clears AA on every light surface", (token) => {
    for (const surface of SURFACES) {
      expect(contrast(`var(${token})`, `var(${surface})`)).toBeGreaterThanOrEqual(AA_NORMAL);
    }
  });

  it("stone is below AA — it must never be used for text", () => {
    expect(contrast("var(--stone)", "var(--canvas)")).toBeLessThan(AA_NORMAL);
  });

  it("link-pressed clears AA on tinted surfaces, which plain link does not", () => {
    expect(contrast("var(--link)", "var(--surface-soft)")).toBeLessThan(AA_NORMAL);
    expect(contrast("var(--link-pressed)", "var(--surface-soft)")).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it("error clears AA on canvas and on surface", () => {
    expect(contrast("var(--error)", "var(--canvas)")).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrast("var(--error)", "var(--surface)")).toBeGreaterThanOrEqual(AA_NORMAL);
  });
});

describe("primary and dark surfaces", () => {
  it("white on the primary CTA clears AA", () => {
    expect(contrast("var(--on-primary)", "var(--primary)")).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrast("var(--on-primary)", "var(--primary-pressed)")).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
  });

  it("both on-dark tones clear AA on the navy hero band", () => {
    expect(contrast("var(--on-dark)", "var(--navy)")).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrast("var(--on-dark-muted)", "var(--navy)")).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("charcoal clears AA on the bold yellow teaching band", () => {
    expect(contrast("var(--charcoal)", "var(--tint-yellow-bold)")).toBeGreaterThanOrEqual(
      AA_NORMAL,
    );
    expect(contrast("var(--brown)", "var(--tint-yellow-bold)")).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it("the comment CTA clears AA — link-pressed on tint-sky", () => {
    // CommentInvite's button. Plain --link is the tempting choice and is not
    // safe on a tint, the same trap already documented for surface-soft above.
    expect(contrast("var(--link-pressed)", "var(--tint-sky)")).toBeGreaterThanOrEqual(AA_NORMAL);
    expect(contrast("var(--link)", "var(--tint-sky)")).toBeLessThan(AA_NORMAL);
  });

  it("rejects DESIGN.md's badge-tag-green, which is why teal-deep was derived", () => {
    // brand-green #1aae39 on mint is 2.50:1 — the documented deviation
    expect(contrast("#1aae39", "var(--tint-mint)")).toBeLessThan(AA_NORMAL);
  });
});
