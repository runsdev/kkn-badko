import Link from "next/link";
import { labelStyle } from "@/lib/labels";

const BASE =
  "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-[13px] font-semibold leading-tight";

/**
 * DESIGN.md `badge-tag-*` — the label's colour pair, always from lib/labels.
 *
 * Static by default. On a post card the chip must NOT be a link: WF-00 requires
 * the whole card to be a single tab stop, and a chip inside it would add one
 * per label. Chips become interactive only on the detail page and in the label
 * switcher, where they are the primary control.
 */
export default function LabelChip({
  label,
  href,
  showDot = true,
}: {
  label: string;
  href?: string;
  showDot?: boolean;
}) {
  const style = labelStyle(label);
  const content = (
    <>
      {showDot && (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full"
          style={{ background: style.accent }}
        />
      )}
      {style.display}
    </>
  );

  const visual = { background: style.tint, color: style.deep };

  if (!href) {
    return (
      <span className={BASE} style={visual}>
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${BASE} transition-opacity duration-150 hover:opacity-80`}
      style={visual}
    >
      {content}
    </Link>
  );
}
