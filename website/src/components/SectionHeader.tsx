import Link from "next/link";

/**
 * Section opener: title, a count, an optional one-line description, and an
 * optional escape hatch to the full list.
 *
 * The count is part of the header rather than decoration — on an archive, "7
 * catatan" tells the reader how much there is before they scroll.
 */
export default function SectionHeader({
  id,
  title,
  count,
  countNoun = "catatan",
  blurb,
  accent,
  href,
  hrefLabel,
}: {
  id: string;
  title: string;
  count?: number;
  countNoun?: string;
  blurb?: string;
  accent?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div>
        <h2
          id={id}
          className="flex items-center gap-2.5 text-2xl font-semibold tracking-[-0.5px] text-ink sm:text-[28px]"
        >
          {accent && (
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: accent }}
            />
          )}
          {title}
          {count !== undefined && (
            <span className="tabular text-base font-normal text-slate">
              {count} {countNoun}
            </span>
          )}
        </h2>
        {blurb && <p className="mt-1.5 text-[15px] text-slate">{blurb}</p>}
      </div>
      {href && hrefLabel && (
        <Link
          href={href}
          className="text-sm font-medium text-link underline decoration-1 underline-offset-2 transition-colors duration-150 hover:text-link-pressed"
        >
          {hrefLabel}
        </Link>
      )}
    </div>
  );
}
