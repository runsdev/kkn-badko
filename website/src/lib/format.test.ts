import { describe, expect, it } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
  it("renders the wireframe date format", () => {
    expect(formatDate("2026-07-12T10:00:00Z")).toBe("12 Jul 2026");
  });
});
