import { ImageResponse } from "next/og";
import { LABEL_ORDER } from "@/lib/labels";
import { SITE_NAME } from "@/lib/site";

// Social card for the site root. Post pages don't use this — they set
// openGraph.images to the post's own photograph, which is always better than a
// generated card.
//
// ImageResponse constraints: flexbox only (no grid), 500KB bundle including any
// fonts. No font files are loaded here, so this renders in the default face —
// the card carries the brand through the navy band and the label dots rather
// than through the typeface.

export const alt = "Arsip Badan Koordinasi TPA Kecamatan Moyudan, 2009–2011";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Resolved values, because ImageResponse renders outside the document and has
// no access to the CSS custom properties in globals.css.
const DOTS: Record<string, string> = {
  FOTO: "#2a9d99",
  BERITA: "#dd5b00",
  TIPS: "#f5d75e",
  PROFIL: "#7b3ff2",
  BCM: "#ff64c8",
  LINK: "#0075de",
};

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0a1530",
        padding: "72px",
        color: "#ffffff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#5645d4" }} />
        <div style={{ fontSize: 30, fontWeight: 700 }}>{SITE_NAME}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, letterSpacing: -2 }}>
          Rekaman 17 TPA di Kecamatan Moyudan.
        </div>
        <div style={{ fontSize: 30, color: "#a4a097" }}>
          35 catatan kegiatan, foto, dan bahan mengajar — 2009 sampai 2011.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {LABEL_ORDER.map((label) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, background: DOTS[label] }} />
            <div style={{ fontSize: 22, color: "#ffffff" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
