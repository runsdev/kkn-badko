import { describe, expect, it } from "vitest";
import { prettyTpaName, tpaDirectory, villageOf } from "@/lib/tpa";
import type { PostSummary } from "@/lib/types";

function post(title: string, labels: string[] = ["FOTO"]): PostSummary {
  return {
    id: title,
    title,
    slug: title.toLowerCase().replace(/\s+/g, "-"),
    published: "2010-11-16T10:00:00+07:00",
    labels,
    excerpt: "",
  };
}

// The real FOTO-labelled titles from the migrated archive. The directory is
// derived from these by convention, so they are the fixture that matters.
const FOTO_TITLES = [
  "TPA AL-HUDA KALIDUREN 3",
  "TPA AT-TAQWA SANGUBANYU",
  "TPA NURUL IMAN GOSER",
  "TPA AL-AMIN PENDULAN",
  "TPA SABIILUL MUTTAQIIN KALIDUREN 1",
  "TPA AR-ROHMAH KARANG",
  "TPA AL-FURQON SUMBERARUM",
  "TPA ABDUL MANAN KEDUNGBANTENG",
  "TPA AL-HIDAYAH GEDONGAN",
  "TPA AN-NUUR BETAKAN",
  "TPA AS-SALAM II KRUWET",
  "TPA HIDAYATULLOH CELUNGAN",
  "TPA AL-HIDAYAH SERMO",
  "TPA AL-FALAH SUMBERSARI",
  "TPA AS-SALAM SUMBERRAHAYU",
  "TPA MUHAMMADIYAH KEMBANGAN",
  "TPA AL-HIKMAH TEGAL REJO BERSAMA PANITIA  WISUDA",
  // the three FOTO posts that are not directory records
  "Wisuda Ibu-ibu TPA As-Salam II Kruwet",
  "Panitia",
  "Panitia Lokal",
];

const ARCHIVE = [
  ...FOTO_TITLES.map((t) => post(t)),
  post("Wisuda dan Khataman ke VI Tahun 2010", ["BERITA"]),
  post("TUYUL", ["TIPS"]),
];

describe("tpaDirectory", () => {
  it("finds exactly the 17 directory records in the real archive", () => {
    expect(tpaDirectory(ARCHIVE)).toHaveLength(17);
  });

  it("excludes FOTO posts that are not TPA records", () => {
    const names = tpaDirectory(ARCHIVE).map((e) => e.name);
    expect(names).not.toContain("Panitia");
    expect(names).not.toContain("Panitia Lokal");
    // "TPA" appears mid-title here, so the ^TPA anchor is what excludes it
    expect(names).not.toContain("Wisuda Ibu-ibu TPA As-Salam II Kruwet");
  });

  it("ignores posts that are not labelled FOTO", () => {
    const names = tpaDirectory(ARCHIVE).map((e) => e.name);
    expect(names).not.toContain("Wisuda dan Khataman ke VI Tahun 2010");
    expect(names).not.toContain("TUYUL");
  });

  it("normalises the double space in the archive's one malformed title", () => {
    const entry = tpaDirectory(ARCHIVE).find((e) => e.name.startsWith("TPA AL-HIKMAH"));
    expect(entry?.name).toBe("TPA AL-HIKMAH TEGAL REJO BERSAMA PANITIA WISUDA");
  });

  it("falls back to all FOTO posts if the title convention stops matching", () => {
    // a future editing style that abandons the "TPA <name>" convention should
    // degrade the page, not empty it
    const renamed = [post("Dokumentasi Kaliduren"), post("Dokumentasi Sermo"), post("Panitia")];
    expect(tpaDirectory(renamed)).toHaveLength(3);
  });

  it("returns nothing when there are no FOTO posts at all", () => {
    expect(tpaDirectory([post("TUYUL", ["TIPS"])])).toHaveLength(0);
  });
});

describe("villageOf", () => {
  it("takes the trailing place name", () => {
    expect(villageOf("TPA AT-TAQWA SANGUBANYU")).toBe("SANGUBANYU");
    expect(villageOf("TPA NURUL IMAN GOSER")).toBe("GOSER");
  });

  it("drops a trailing branch index", () => {
    expect(villageOf("TPA AL-HUDA KALIDUREN 3")).toBe("KALIDUREN");
    expect(villageOf("TPA SABIILUL MUTTAQIIN KALIDUREN 1")).toBe("KALIDUREN");
  });

  it("handles a roman numeral inside the centre's name", () => {
    expect(villageOf("TPA AS-SALAM II KRUWET")).toBe("KRUWET");
  });

  it("gives up on titles carrying a descriptive clause rather than guessing", () => {
    // a wrong village on a directory of real places is worse than none
    expect(villageOf("TPA AL-HIKMAH TEGAL REJO BERSAMA PANITIA  WISUDA")).toBeUndefined();
  });

  it("gives up when there is no room for both a name and a village", () => {
    expect(villageOf("TPA SERMO")).toBeUndefined();
  });
});

describe("prettyTpaName", () => {
  it("title-cases the shouted archive titles", () => {
    expect(prettyTpaName("TPA NURUL IMAN GOSER")).toBe("TPA Nurul Iman Goser");
    expect(prettyTpaName("TPA SABIILUL MUTTAQIIN KALIDUREN 1")).toBe(
      "TPA Sabiilul Muttaqiin Kaliduren 1",
    );
  });

  it("keeps the TPA prefix uppercase", () => {
    expect(prettyTpaName("TPA AL-FALAH SUMBERSARI").startsWith("TPA ")).toBe(true);
  });

  it("cases each hyphen segment, so AL-HUDA is not Al-huda", () => {
    expect(prettyTpaName("TPA AL-HUDA KALIDUREN 3")).toBe("TPA Al-Huda Kaliduren 3");
    expect(prettyTpaName("TPA AR-ROHMAH KARANG")).toBe("TPA Ar-Rohmah Karang");
  });

  it("preserves roman branch numerals", () => {
    // "II" must not become "Ii"
    expect(prettyTpaName("TPA AS-SALAM II KRUWET")).toBe("TPA As-Salam II Kruwet");
  });

  it("leaves an already mixed-case title alone", () => {
    // a future post typed normally must not be reflowed
    const typed = "TPA Al-Hidayah Sermo";
    expect(prettyTpaName(typed)).toBe(typed);
  });

  it("normalises the archive's double space", () => {
    expect(prettyTpaName("TPA AL-HIKMAH TEGAL REJO BERSAMA PANITIA  WISUDA")).toBe(
      "TPA Al-Hikmah Tegal Rejo Bersama Panitia Wisuda",
    );
  });
});
