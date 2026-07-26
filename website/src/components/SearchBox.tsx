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
          className="w-full rounded border border-foreground/30 bg-transparent px-2 py-1 text-sm"
        />
        <button
          type="submit"
          className="rounded border border-foreground/30 px-3 py-1 text-sm hover:bg-foreground/10"
        >
          Go
        </button>
      </div>
      {warning && (
        <p role="alert" className="text-xs text-red-600">
          Please enter a search term.
        </p>
      )}
    </form>
  );
}
