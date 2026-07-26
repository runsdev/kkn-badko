// Human-readable date per wireframes ("12 Jul 2026"). Fixed locale keeps
// server output deterministic; localization is a Phase 2.3 concern.
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
