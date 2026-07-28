"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";

// WF-00 (3): global search box, styled as DESIGN.md `search-pill`.
// Empty/whitespace submit is blocked client-side with an inline prompt
// (FR-013); the query is URL-encoded before it reaches the API (FR-014).
export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [warning, setWarning] = useState(false);

  // The shell renders this twice — once in the header, once inside the mobile
  // menu — and both are always in the DOM, so a fixed id would duplicate.
  const inputId = useId();
  const alertId = `${inputId}-alert`;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      setWarning(true);
      return;
    }
    setWarning(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form role="search" onSubmit={onSubmit} className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          Cari catatan
        </label>
        <input
          id={inputId}
          type="search"
          name="q"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (warning) setWarning(false);
          }}
          placeholder="Cari catatan, TPA, kegiatan…"
          autoComplete="off"
          spellCheck={false}
          aria-invalid={warning || undefined}
          aria-describedby={warning ? alertId : undefined}
          className="min-w-0 flex-1 rounded-md border border-hairline bg-surface px-3 py-2 text-sm text-ink transition-colors duration-150 placeholder:text-slate focus:border-primary focus:bg-canvas"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors duration-150 hover:bg-primary-pressed"
        >
          Cari
        </button>
      </div>
      {warning && (
        <p id={alertId} role="alert" className="text-xs font-medium text-error">
          Masukkan kata pencarian lebih dulu.
        </p>
      )}
    </form>
  );
}
