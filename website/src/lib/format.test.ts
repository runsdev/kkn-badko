import { describe, expect, it } from "vitest";
import { formatDate, formatYear, monthLong, monthOf, monthShort, yearOf } from "./format";

describe("formatDate", () => {
  it("renders the wireframe date format", () => {
    expect(formatDate("2026-07-12T10:00:00Z")).toBe("12 Jul 2026");
  });

  it("uses Indonesian month abbreviations where they differ from English", () => {
    // Mei / Agu / Okt / Des are the four that change (D-06)
    expect(formatDate("2009-05-20T00:00:00+07:00")).toBe("20 Mei 2009");
    expect(formatDate("2010-08-01T00:00:00+07:00")).toBe("1 Agu 2010");
    expect(formatDate("2011-10-20T00:00:00+07:00")).toBe("20 Okt 2011");
    expect(formatDate("2010-12-23T00:00:00+07:00")).toBe("23 Des 2010");
  });

  it("is pinned to the archive's timezone, not the server's", () => {
    // 23:30 WIB is still the 16th in Jakarta but the 15th in UTC; the date the
    // archive means is the local one, and it must not drift with the runtime
    expect(formatDate("2010-11-16T23:30:00+07:00")).toBe("16 Nov 2010");
    expect(yearOf("2010-12-31T23:30:00+07:00")).toBe(2010);
    expect(monthOf("2010-12-31T23:30:00+07:00")).toBe(12);
  });
});

describe("formatYear / yearOf / monthOf", () => {
  it("renders a bare year, not a grouped number", () => {
    // id-ID number formatting would render 2011 as "2.011"
    expect(formatYear("2011-10-20T00:00:00+07:00")).toBe("2011");
  });

  it("agree with each other, so timeline buckets match their labels", () => {
    const iso = "2009-07-05T10:00:00+07:00";
    expect(String(yearOf(iso))).toBe(formatYear(iso));
    expect(monthOf(iso)).toBe(7);
  });
});

describe("monthShort / monthLong", () => {
  it("covers all twelve months in Indonesian", () => {
    expect([...Array(12)].map((_, i) => monthShort(i + 1))).toEqual([
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ]);
    expect(monthLong(2010, 11)).toBe("November 2010");
    expect(monthLong("2009", 5)).toBe("Mei 2009");
  });

  it("degrades rather than throwing on an out-of-range month", () => {
    expect(monthShort(0)).toBe("0");
    expect(monthShort(13)).toBe("13");
  });
});
