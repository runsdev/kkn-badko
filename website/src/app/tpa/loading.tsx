import Shell from "@/components/Shell";
import { ViewTransition } from "react";

// WF-07a. Mirrors the real grid's box sizes so content arrival causes no
// layout shift (CLS ≤ 0.1). Exit only: a page-level enter VT nested below
// <Transition> would never fire, since a Suspense reveal carries no transition
// type and Transition resolves an untyped transition to "none".
export default function Loading() {
  return (
    <ViewTransition exit="slide-down" default="none">
      <Shell className="py-12 sm:py-16">
        <p role="status" className="sr-only">
          Memuat direktori TPA…
        </p>
        <div aria-hidden>
          <div className="h-3.5 w-40 rounded-sm bg-surface" />
          <div className="mt-3 h-10 w-64 animate-pulse rounded bg-surface" />
          <div className="mt-4 h-4 w-full max-w-xl rounded bg-surface" />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <li
                key={i}
                className="animate-pulse overflow-hidden rounded-lg border border-hairline bg-canvas"
              >
                <div className="aspect-4/3 w-full bg-surface" />
                <div className="p-4">
                  <div className="h-3 w-20 rounded-sm bg-surface" />
                  <div className="mt-2 h-4 w-4/5 rounded bg-surface" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Shell>
    </ViewTransition>
  );
}
