import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import CommentInvite from "@/components/CommentInvite";

afterEach(cleanup);

const HREF = "https://tpamoyudan.blogspot.com/2026/07/blog-post.html#comment-form";

describe("CommentInvite", () => {
  it("links to the Blogger comment editor", () => {
    render(<CommentInvite href={HREF} />);
    expect(screen.getByRole("link").getAttribute("href")).toBe(HREF);
  });

  it("names its destination in the accessible name, and says it leaves the tab", () => {
    render(<CommentInvite href={HREF} />);
    // "Blogger" has to survive into the accessible name: out of context, a bare
    // "Tulis komentar" would read as an on-site form, which is exactly what
    // this is not. The decorative glyphs are aria-hidden, so they drop out.
    expect(screen.getByRole("link", { name: /Blogger/ })).toBeTruthy();
    expect(screen.getByRole("link", { name: /buka di tab baru/ })).toBeTruthy();
  });

  it("opens off-origin safely", () => {
    render(<CommentInvite href={HREF} />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("target")).toBe("_blank");
    // noopener keeps the new tab from reaching back through window.opener
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("renders no form control — FR-017 holds on this origin", () => {
    const { container } = render(<CommentInvite href={HREF} />);
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector("textarea")).toBeNull();
    expect(container.querySelector("input")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("does not claim comments are moderated — that setting is not known here", () => {
    // 06-redesign/New_Posts_And_Comments.md §4 lists moderation as an open
    // question. The copy may say comments are managed in Blogger; it may not
    // promise a review step that might not be switched on.
    const { container } = render(<CommentInvite href={HREF} />);
    expect(container.textContent).not.toMatch(/moderasi|dimoderasi/i);
  });
});
