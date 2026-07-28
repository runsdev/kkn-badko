import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Pagination from "./Pagination";

afterEach(cleanup);

// FR-004/FR-005 — controls render only when there is more than one page.
// Copy is Indonesian per D-06; disabled ends stay non-links.
describe("Pagination", () => {
  it("renders nothing for a single page", () => {
    const { container } = render(<Pagination page={1} totalPages={1} />);
    expect(container.innerHTML).toBe("");
  });

  it("disables Lebih baru on page 1 and links Lebih lama", () => {
    render(<Pagination page={1} totalPages={4} />);
    expect(screen.getByText("Halaman 1 dari 4")).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Lebih baru/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Lebih lama/ }).getAttribute("href")).toBe("/page/2");
  });

  it("links page 2's Lebih baru to the list root, which is /arsip since D-08", () => {
    render(<Pagination page={2} totalPages={4} />);
    expect(screen.getByRole("link", { name: /Lebih baru/ }).getAttribute("href")).toBe("/arsip");
    expect(screen.getByRole("link", { name: /Lebih lama/ }).getAttribute("href")).toBe("/page/3");
  });

  it("disables Lebih lama on the last page", () => {
    render(<Pagination page={4} totalPages={4} />);
    expect(screen.queryByRole("link", { name: /Lebih lama/ })).toBeNull();
  });

  it("marks disabled ends with a dashed border, not a dimmed text colour", () => {
    // regression guard: the previous version used text-muted/50 at 1.96:1,
    // which was a logged accessibility defect (QA_Report.md:37). The disabled
    // state must be carried non-chromatically.
    const { container } = render(<Pagination page={1} totalPages={4} />);
    const dashed = [...container.querySelectorAll("span")].find((s) =>
      s.className.includes("border-dashed"),
    );
    expect(dashed).toBeTruthy();
    expect(dashed?.className).not.toMatch(/\/\d0\b/);
  });

  it("announces the disabled end rather than hiding it from assistive tech", () => {
    const { container } = render(<Pagination page={1} totalPages={4} />);
    // aria-hidden here would remove the affordance the dashed border conveys
    expect(container.querySelector("[aria-hidden]")).toBeNull();
    expect(screen.getByText(/tidak tersedia/)).toBeTruthy();
  });
});
