import Link from "next/link";
import { LABEL_ORDER, labelStyle } from "@/lib/labels";

/**
 * DESIGN.md `pill-tab` / `pill-tab-active` — lateral switching between labels.
 *
 * Lateral navigation, so the links carry no transition type: a directional
 * slide would falsely imply depth between siblings.
 *
 * The active pill takes the label's own colour rather than DESIGN.md's flat
 * black, which is the point of the whole colour map — but it uses `deep`, not
 * `accent`. White on the mid-tone accents measures 1.42:1 (yellow), 2.66:1
 * (pink), 3.29:1 (teal) and 3.77:1 (orange); only purple and link clear 4.5:1.
 * `deep` clears it for all six (6.26–14.21:1), so one rule covers every label
 * with no exception list.
 */

export default function LabelSwitcher({ active }: { active?: string }) {
  const current = active?.trim().toUpperCase();

  return (
    <nav aria-label="Saring menurut label">
      <ul className="flex flex-wrap gap-2">
        <li>
          <Link
            href="/"
            aria-current={current ? undefined : "page"}
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
              current
                ? "border-hairline text-slate hover:border-hairline-strong hover:text-ink"
                : "border-ink-deep bg-ink-deep text-on-dark"
            }`}
          >
            Semua
          </Link>
        </li>
        {LABEL_ORDER.map((label) => {
          const style = labelStyle(label);
          const isActive = current === label;
          return (
            <li key={label}>
              <Link
                href={`/labels/${encodeURIComponent(label)}`}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "border-transparent"
                    : "border-hairline text-slate hover:border-hairline-strong hover:text-ink"
                }`}
                style={isActive ? { background: style.deep, color: "var(--on-dark)" } : undefined}
              >
                {!isActive && (
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full"
                    style={{ background: style.accent }}
                  />
                )}
                {style.display}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
