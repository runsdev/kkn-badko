// The TPA directory (WF-09) — 17 Qur'an study centres across Moyudan.
//
// There is no structured field for this: Blogger gives us labels and titles.
// But the archive follows a consistent convention — every directory post is
// labelled FOTO and titled `TPA <NAME> <VILLAGE>` — so the directory is
// derived from titles. Verified against the migrated archive: this returns
// exactly 17, and correctly excludes the other three FOTO posts (`Panitia`,
// `Panitia Lokal`, and `Wisuda Ibu-ibu TPA As-Salam II Kruwet`, where TPA
// appears mid-title rather than at the start).

import type { PostSummary } from "@/lib/types";

export const DIRECTORY_LABEL = "FOTO";

/** Below this, assume the title convention changed and stop filtering. */
const MIN_CONFIDENT_MATCHES = 5;

const TPA_TITLE = /^TPA\s+/i;

export interface TpaEntry {
  post: PostSummary;
  /** Full title, always — this is the card's accessible name. */
  name: string;
  /**
   * Village, shown as a presentational eyebrow. Undefined whenever the parse
   * is not confident: a wrong village name on a directory of real places is
   * worse than no village name at all, so this fails silent rather than guesses.
   */
  village?: string;
}

/**
 * Trailing descriptive clauses that appear on group photos rather than
 * directory records — they must not be mistaken for a village.
 */
const NOT_A_VILLAGE = /\b(BERSAMA|PANITIA|WISUDA|LOKAL|KHATAMAN)\b/i;

/**
 * Best-effort village extraction from `TPA <NAME> <VILLAGE>`.
 *
 * Village names are not delimited from centre names, and several titles
 * interleave numerals with the place (`TPA SABIILUL MUTTAQIIN KALIDUREN 1`,
 * `TPA AS-SALAM II KRUWET`), so no split rule recovers it reliably. This takes
 * the last alphabetic word, drops any trailing index, and gives up entirely
 * when the title carries a descriptive clause.
 */
export function villageOf(title: string): string | undefined {
  const body = title.replace(TPA_TITLE, "").trim().replace(/\s+/g, " ");
  if (!body || NOT_A_VILLAGE.test(body)) return undefined;

  // drop a trailing branch index: "KALIDUREN 3" -> "KALIDUREN"
  const words = body.replace(/\s+(?:\d+|I{1,3}|IV|V)$/i, "").split(" ");
  if (words.length < 2) return undefined; // no room for both a name and a village

  const last = words[words.length - 1];
  if (!/^[A-Za-z][A-Za-z'-]{2,}$/.test(last)) return undefined;
  return last;
}

/** Title with the `TPA ` prefix kept — centre names read as proper nouns. */
export function displayName(title: string): string {
  return title.trim().replace(/\s+/g, " ");
}

/** Roman numerals that appear as branch numbers in these titles. */
const ROMAN = /^(?:I{1,3}|IV|V|VI{0,3}|IX|X)$/;

/**
 * Archive titles are shouted — `TPA SABIILUL MUTTAQIIN KALIDUREN 1`. That is
 * fine in a dense grid but unreadable set large, so the Beranda roll call
 * title-cases them.
 *
 * Preserves what must stay uppercase: the `TPA` prefix, roman branch numerals
 * (`AS-SALAM II` must not become `Ii`), and digits. Hyphenated Arabic names are
 * cased per segment, so `AL-HUDA` becomes `Al-Huda` rather than `Al-huda`.
 *
 * Input that is already mixed-case is left alone — only all-caps titles are
 * reflowed, so a future post typed normally is not mangled.
 */
export function prettyTpaName(title: string): string {
  const clean = displayName(title);
  if (clean !== clean.toUpperCase()) return clean;

  return clean
    .split(" ")
    .map((word) => {
      if (word === "TPA" || ROMAN.test(word) || /^\d+$/.test(word)) return word;
      return word
        .split("-")
        .map((part) => (part.length === 0 ? part : part[0] + part.slice(1).toLowerCase()))
        .join("-");
    })
    .join(" ");
}

/**
 * Build the directory from a set of posts.
 *
 * Falls back to every FOTO post if the title convention stops matching, so a
 * future editing style degrades the page instead of emptying it.
 */
export function tpaDirectory(posts: PostSummary[]): TpaEntry[] {
  const foto = posts.filter((p) => p.labels.some((l) => l.toUpperCase() === DIRECTORY_LABEL));
  const matched = foto.filter((p) => TPA_TITLE.test(p.title));
  const source = matched.length >= MIN_CONFIDENT_MATCHES ? matched : foto;

  return source.map((post) => ({
    post,
    name: displayName(post.title),
    village: TPA_TITLE.test(post.title) ? villageOf(post.title) : undefined,
  }));
}
