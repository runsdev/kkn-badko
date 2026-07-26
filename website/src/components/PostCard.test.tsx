import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { PostSummary } from "@/lib/types";
import PostCard from "./PostCard";

afterEach(cleanup);

const post: PostSummary = {
  id: "1",
  title: "Diklat Ustadz",
  slug: "diklat-ustadz",
  published: "2009-07-06T10:00:00+07:00",
  labels: ["BERITA", "FOTO"],
  excerpt: "An excerpt",
};

// FR-001/FR-007/FR-011 — card links to detail, labels link to label pages
describe("PostCard", () => {
  it("links the title to the post detail route", () => {
    render(<PostCard post={post} />);
    expect(screen.getByRole("link", { name: "Diklat Ustadz" }).getAttribute("href")).toBe(
      "/posts/diklat-ustadz",
    );
  });

  it("links each label chip to its URL-encoded label route", () => {
    render(<PostCard post={{ ...post, labels: ["dua kata"] }} />);
    expect(screen.getByRole("link", { name: "dua kata" }).getAttribute("href")).toBe(
      "/labels/dua%20kata",
    );
  });

  it("shows the excerpt and the publish date", () => {
    render(<PostCard post={post} />);
    expect(screen.getByText("An excerpt")).toBeTruthy();
    expect(screen.getByText("6 Jul 2009")).toBeTruthy();
  });

  it("omits the label row when the post has no labels", () => {
    render(<PostCard post={{ ...post, labels: [] }} />);
    expect(screen.queryByRole("link", { name: "BERITA" })).toBeNull();
  });
});
