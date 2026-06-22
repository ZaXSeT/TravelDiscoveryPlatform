import { ImageResponse } from "next/og";
import { siteConfig } from "@/constants/config";
import { ALL_DESTINATIONS } from "@/constants/destinations";
import { REGIONS } from "@/constants/categories";

export const alt = `${siteConfig.name} - Travel Discovery`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social preview card (auto-wired into OpenGraph/Twitter metadata).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 80,
          background:
            "linear-gradient(135deg, #0b1020 0%, #0e0e0f 55%, #161019 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#c8a97e",
          }}
        >
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 920 }}>
          Find the places worth the journey.
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#bcd8ff" }}>
          {ALL_DESTINATIONS.length} destinations · {REGIONS.length} regions ·
          guides, budgets &amp; hidden gems
        </div>
      </div>
    ),
    { ...size },
  );
}
