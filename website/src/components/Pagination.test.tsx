import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Pagination from "./Pagination";

afterEach(cleanup);

// FR-004/FR-005 — controls render only when there is more than one page
describe("Pagination", () => {
  it("renders nothing for a single page", () => {
    const { container } = render(<Pagination page={1} totalPages={1} />);
    expect(container.innerHTML).toBe("");
  });

  it("disables Newer on page 1 and links Older", () => {
    render(<Pagination page={1} totalPages={4} />);
    expect(screen.getByText("Page 1 of 4")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Newer/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Older/ }).getAttribute("href")).toBe("/page/2");
  });

  it("links page 2's Newer to the canonical home route", () => {
    render(<Pagination page={2} totalPages={4} />);
    expect(screen.getByRole("link", { name: /Newer/ }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: /Older/ }).getAttribute("href")).toBe("/page/3");
  });

  it("disables Older on the last page", () => {
    render(<Pagination page={4} totalPages={4} />);
    expect(screen.queryByRole("link", { name: /Older/ })).toBeNull();
  });
});
