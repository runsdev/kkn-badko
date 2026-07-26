"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// WF-00 (3): global search box. Empty/whitespace submit is blocked
// client-side with an inline prompt (FR-013); the query is URL-encoded
// before it reaches the API route (FR-014).
export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [warning, setWarning] = useState(false);

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
    <form role="search" onSubmit={onSubmit} className="flex flex-col gap-1">
      <div className="flex gap-2">
        <label htmlFor="site-search" className="sr-only">
          Search posts
        </label>
        <input
          id="site-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="search posts..."
          className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted/70 focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-md border border-border px-4 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent"
        >
          Go
        </button>
      </div>
      {warning && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          Please enter a search term.
        </p>
      )}
    </form>
  );
}
