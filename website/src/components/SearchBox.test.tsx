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

// FR-013/FR-014 — empty submit blocked with a prompt; query URL-encoded.
// Button label is Indonesian per D-06.
describe("SearchBox", () => {
  it("pre-fills from the current ?q= parameter (WF-04)", () => {
    render(<SearchBox />);
    expect(screen.getByRole("searchbox").getAttribute("value")).toBe("lomba");
  });

  it("blocks empty/whitespace submits with an inline alert", async () => {
    render(<SearchBox />);
    await userEvent.clear(screen.getByRole("searchbox"));
    await userEvent.type(screen.getByRole("searchbox"), "   ");
    await userEvent.click(screen.getByRole("button", { name: "Cari" }));
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("alert").textContent).toMatch(/masukkan kata pencarian/i);
  });

  it("navigates with the trimmed, URL-encoded query", async () => {
    render(<SearchBox />);
    await userEvent.clear(screen.getByRole("searchbox"));
    await userEvent.type(screen.getByRole("searchbox"), "  dua kata  ");
    await userEvent.click(screen.getByRole("button", { name: "Cari" }));
    expect(push).toHaveBeenCalledWith("/search?q=dua%20kata");
  });

  it("labels the input and ties it to the alert when invalid", async () => {
    render(<SearchBox />);
    const input = screen.getByRole("searchbox");
    // the label is programmatically associated even though it is visually hidden
    expect(screen.getByLabelText("Cari catatan")).toBe(input);

    await userEvent.clear(input);
    await userEvent.click(screen.getByRole("button", { name: "Cari" }));
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(screen.getByRole("alert").id);
  });

  it("clears the warning as soon as the reader starts typing", async () => {
    render(<SearchBox />);
    const input = screen.getByRole("searchbox");
    await userEvent.clear(input);
    await userEvent.click(screen.getByRole("button", { name: "Cari" }));
    expect(screen.queryByRole("alert")).toBeTruthy();

    await userEvent.type(input, "a");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("gives each instance a unique input id, since the shell renders two", () => {
    // header + mobile menu are both in the DOM at all times; a fixed id would
    // duplicate and break the label association for one of them
    const { container: a } = render(<SearchBox />);
    const { container: b } = render(<SearchBox />);
    const idA = a.querySelector("input")?.id;
    const idB = b.querySelector("input")?.id;
    expect(idA).toBeTruthy();
    expect(idA).not.toBe(idB);
  });
});
