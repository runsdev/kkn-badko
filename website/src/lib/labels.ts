// The label taxonomy IS the graphic system (Redesign_Plan.md §2.1).
//
// DESIGN.md:479 describes its brand spectrum as one that "echoes live product
// database properties". This archive is a small database — 35 records across
// six labels — so each label owns one brand colour, and that colour is used
// identically for the hero dot, the card tint, the chip, and the filter pill
// everywhere on the site. Change a colour here and it changes everywhere.
//
// Every text-on-tint pair below is verified >= 4.5:1 (WCAG 2.1 AA, NFR-016);
// ratios are recorded in Redesign_Plan.md §2.2. Do not swap a `text` value for
// a lighter tone from the same family — DESIGN.md's own badge-tag-green
// (brand-green on mint) is 2.50:1 and had to be replaced.

export interface LabelStyle {
  /** Solid accent: hero dots and rules. Decorative only — see `deep`. */
  accent: string;
  /** Pale surface: card and chip background. */
  tint: string;
  /**
   * The label's dark tone, verified for two uses:
   *   - text on `tint` (5.33–11.06:1)
   *   - background under white text (6.26–14.21:1)
   *
   * `accent` must NOT be used for either. White on the mid-tone accents is
   * 1.42–3.77:1 for four of the six labels, so the emphatic "active" state
   * takes `deep` as its background rather than `accent`.
   */
  deep: string;
  /** Indonesian display name; labels are stored upper-case in Blogger. */
  display: string;
  /** One line explaining what the label collects, for section headers. */
  blurb: string;
}

const FALLBACK: LabelStyle = {
  accent: "var(--stone)",
  tint: "var(--tint-gray)",
  deep: "var(--charcoal)",
  display: "Lainnya",
  blurb: "Catatan lain dalam arsip.",
};

const LABELS: Record<string, LabelStyle> = {
  FOTO: {
    accent: "var(--teal)",
    tint: "var(--tint-mint)",
    deep: "var(--teal-deep)",
    display: "Foto",
    blurb: "Dokumentasi setiap TPA di Kecamatan Moyudan.",
  },
  BERITA: {
    accent: "var(--orange)",
    tint: "var(--tint-peach)",
    deep: "var(--orange-deep)",
    display: "Berita",
    blurb: "Wisuda, khataman, diklat, dan festival.",
  },
  TIPS: {
    accent: "var(--yellow)",
    tint: "var(--tint-yellow)",
    deep: "var(--brown)",
    display: "Tips",
    blurb: "Cara mengajar dan menenangkan santri.",
  },
  PROFIL: {
    accent: "var(--purple)",
    tint: "var(--tint-lavender)",
    deep: "var(--purple-800)",
    display: "Profil",
    blurb: "Susunan pengurus dan daftar TPA.",
  },
  BCM: {
    accent: "var(--pink)",
    tint: "var(--tint-rose)",
    deep: "var(--pink-deep)",
    display: "BCM",
    blurb: "Bermain, Cerita, Menyanyi.",
  },
  LINK: {
    accent: "var(--link)",
    tint: "var(--tint-sky)",
    deep: "var(--link-pressed)",
    display: "Link",
    blurb: "Tautan ke TPA dan lembaga lain.",
  },
};

/** Display order for the hero legend and the label switcher: most posts first. */
export const LABEL_ORDER = ["FOTO", "BERITA", "TIPS", "PROFIL", "BCM", "LINK"] as const;

/**
 * Style for a label. Unknown labels — anything an editor adds in Blogger
 * later — fall back to the neutral grey pair rather than throwing, so a new
 * label degrades to "unstyled but readable" instead of breaking the page.
 */
export function labelStyle(label: string): LabelStyle {
  return LABELS[label.trim().toUpperCase()] ?? { ...FALLBACK, display: label };
}

/** True when the label has a designed colour, i.e. it is part of the taxonomy. */
export function isKnownLabel(label: string): boolean {
  return label.trim().toUpperCase() in LABELS;
}

/**
 * The exact casing Blogger stores a taxonomy label under.
 *
 * Blogger's `labels=` filter is **case-sensitive** — `labels=FOTO` returns 20
 * posts, `labels=foto` returns zero. Without this, `/labels/foto` rendered a
 * fully styled "Foto" page reporting 0 catatan, because display text was
 * upper-cased for presentation while the raw segment went to the API.
 *
 * Unknown labels pass through trimmed: an editor's own casing is all we have.
 */
export function canonicalLabel(label: string): string {
  const upper = label.trim().toUpperCase();
  return upper in LABELS ? upper : label.trim();
}

/**
 * CSS custom properties for a label, spread onto a element's `style`.
 * Components then reference `var(--label-tint)` etc. in Tailwind arbitrary
 * values, which keeps the colour decision in this file rather than in markup.
 */
export function labelVars(label: string): React.CSSProperties {
  const s = labelStyle(label);
  return {
    ["--label-accent" as string]: s.accent,
    ["--label-tint" as string]: s.tint,
    ["--label-deep" as string]: s.deep,
  };
}

/**
 * FR-001 requires a "primary label" on every card. Blogger returns labels in
 * an arbitrary order, so pick the first that is part of the taxonomy — which
 * makes the card's tint stable across rebuilds — and only then fall back.
 */
export function primaryLabel(labels: string[]): string | undefined {
  return labels.find(isKnownLabel) ?? labels[0];
}
