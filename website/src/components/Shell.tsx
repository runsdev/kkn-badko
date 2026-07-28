// The 1280px container with 32px gutters from DESIGN.md §Layout. Extracted
// because it was repeated at every section boundary in the old shell.
//
// The gutter is max(gutter, safe-area) so a notched device in landscape can't
// put content under the cutout — the hero band and footer are full-bleed.
export default function Shell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-(--container-shell) px-(--shell-gutter) ${className}`}>
      {children}
    </div>
  );
}
