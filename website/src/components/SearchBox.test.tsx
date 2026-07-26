import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SearchBox from "./SearchBox";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams("q=lomba"),
}));

beforeEach(() => push.mockClear());
afterEach(cleanup);

// FR-013/FR-014 — empty submit blocked with a prompt; query URL-encoded
describe("SearchBox", () => {
  it("pre-fills from the current ?q= parameter (WF-04)", () => {
    render(<SearchBox />);
    expect(screen.getByRole("searchbox").getAttribute("value")).toBe("lomba");
  });

  it("blocks empty/whitespace submits with an inline alert", async () => {
    render(<SearchBox />);
    await userEvent.clear(screen.getByRole("searchbox"));
    await userEvent.type(screen.getByRole("searchbox"), "   ");
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toMatch(/enter a search term/i);
  });

  it("navigates with the trimmed, URL-encoded query", async () => {
    render(<SearchBox />);
    await userEvent.clear(screen.getByRole("searchbox"));
    await userEvent.type(screen.getByRole("searchbox"), "  dua kata  ");
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(push).toHaveBeenCalledWith("/search?q=dua%20kata");
  });
});
