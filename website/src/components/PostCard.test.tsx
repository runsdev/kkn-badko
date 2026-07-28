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

// FR-001/FR-007 — the card is a single link to the detail route and carries
// all four required slots. Labels are deliberately NOT links here: WF-00 (1)
// requires the whole card to be one tab stop, so the chip is static and label
// navigation lives on the detail page and in the label switcher.
describe("PostCard", () => {
  it("makes the whole card one link to the post detail route", () => {
    render(<PostCard post={post} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe("/posts/diklat-ustadz");
  });

  it("names that link after the post rather than the card's whole text", () => {
    render(<PostCard post={post} />);
    expect(screen.getByRole("link", { name: "Diklat Ustadz" })).toBeTruthy();
  });

  it("renders no nested links, so the card stays a single tab stop", () => {
    render(<PostCard post={{ ...post, labels: ["dua kata", "BERITA", "FOTO"] }} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });

  it("shows the excerpt and the publish date", () => {
    render(<PostCard post={post} />);
    expect(screen.getByText("An excerpt")).toBeTruthy();
    expect(screen.getByText("6 Jul 2009")).toBeTruthy();
  });

  it("shows the primary label, preferring one in the taxonomy", () => {
    render(<PostCard post={{ ...post, labels: ["tak dikenal", "BERITA"] }} />);
    expect(screen.getByText("Berita")).toBeTruthy();
  });

  it("omits the label chip when the post has no labels", () => {
    render(<PostCard post={{ ...post, labels: [] }} />);
    expect(screen.queryByText("Berita")).toBeNull();
  });

  it("omits the thumbnail when the post has no image", () => {
    render(<PostCard post={post} />);
    expect(screen.queryByRole("img")).toBeNull();
  });
});
