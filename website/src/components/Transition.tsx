import { ViewTransition } from "react";

/**
 * Directional page transition, keyed by transition type.
 *
 * Must be placed in a **page** component, never a layout: layouts persist
 * across navigations, so their enter/exit never fire. Must also be the
 * outermost element of the page — a wrapping `<div>` suppresses enter/exit.
 *
 * `default="none"` everywhere is deliberate. Without it every view transition
 * in the tree fires the browser cross-fade on every transition, including
 * Suspense resolves and background revalidations, and the animations fight
 * each other. Links opt in with `transitionTypes={["nav-forward"]}`.
 *
 * Note that the browser back button carries no transition type, so no
 * directional slide plays on it — a shared-element morph still does.
 */
export default function Transition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition
      enter={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      exit={{ "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" }}
      default="none"
    >
      {children}
    </ViewTransition>
  );
}
