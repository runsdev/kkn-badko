// `<ViewTransition>` and `addTransitionType` ship in the React canary that
// Next.js 16 vendors for the App Router, but they are absent from the
// published `@types/react` (19.2.x) and from the top-level `react` package —
// so they work at runtime and fail `tsc`. NFR-008 requires typecheck to pass
// in CI, so the module is augmented here rather than suppressed at each call
// site with ts-expect-error.
//
// Verified against this exact build before writing:
//   next/dist/compiled/react/cjs/react.development.js
//     exports.ViewTransition, exports.addTransitionType
//   next/dist/compiled/react-dom/cjs/react-dom-client.development.js
//     props.name/default/enter/exit/share/update/onEnter/onExit/onShare/onUpdate
//
// Re-check this file when upgrading Next or React: once the types land
// upstream, delete it.

import type { ReactNode, Ref } from "react";

declare module "react" {
  /**
   * A view-transition class name, or a map from transition type to class name.
   * The object form requires `default`, which is what stops an unlisted
   * transition type from silently falling back to the browser cross-fade.
   */
  type ViewTransitionClass = string | ({ default: string } & Record<string, string>);

  interface ViewTransitionInstance {
    name: string;
    group: Animatable;
    imagePair: Animatable;
    old: Animatable;
    new: Animatable;
  }

  interface ViewTransitionProps {
    children?: ReactNode;
    /**
     * Stable identity across views. Two mounted transitions may not share a
     * name — give per-item names (`post-img-123`) and make sure only one
     * source is mounted at a time, or the morph silently does not happen.
     */
    name?: string;
    /** Fallback for any trigger not named explicitly. Use `"none"`. */
    default?: ViewTransitionClass;
    enter?: ViewTransitionClass;
    exit?: ViewTransitionClass;
    share?: ViewTransitionClass;
    update?: ViewTransitionClass;
    ref?: Ref<ViewTransitionInstance>;
    onEnter?: (instance: ViewTransitionInstance, types: string[]) => void;
    onExit?: (instance: ViewTransitionInstance, types: string[]) => void;
    onShare?: (instance: ViewTransitionInstance, types: string[]) => void;
    onUpdate?: (instance: ViewTransitionInstance, types: string[]) => void;
  }

  const ViewTransition: (props: ViewTransitionProps) => ReactNode;

  /**
   * Tags the in-flight transition. Call inside `startTransition`; stack calls
   * to add several types. `<Link transitionTypes>` does this for navigations.
   */
  function addTransitionType(type: string): void;
}
