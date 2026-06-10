import { ImageResponse } from "next/og";

export const alt =
  "Bidipto Bose — Senior Software Engineer. Go, React, Next.js, AI systems.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social share card — same dark editorial identity as the site.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#070707",
          padding: "64px 72px",
          position: "relative",
        }}
      >
        {/* saffron glow, bottom right */}
        <div
          style={{
            position: "absolute",
            right: -220,
            bottom: -260,
            width: 640,
            height: 640,
            borderRadius: 9999,
            background:
              "radial-gradient(circle at center, rgba(255,138,61,0.28) 0%, rgba(255,138,61,0.08) 45%, rgba(255,138,61,0) 70%)",
          }}
        />
        {/* top row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              color: "#8f8f8f",
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 16,
                height: 16,
                borderRadius: 9999,
                background: "#ff8a3d",
              }}
            />
            Senior Software Engineer
          </div>
          <div style={{ display: "flex", color: "#8f8f8f", fontSize: 22 }}>
            Kolkata, India
          </div>
        </div>

        {/* name */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 148,
              fontWeight: 700,
              color: "#ededed",
              letterSpacing: -4,
              textTransform: "uppercase",
              lineHeight: 0.95,
            }}
          >
            Bidipto
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 148,
              fontWeight: 700,
              color: "#ff8a3d",
              letterSpacing: -4,
              textTransform: "uppercase",
              lineHeight: 0.95,
              marginLeft: 96,
            }}
          >
            Bose
          </div>
        </div>

        {/* bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.14)",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", color: "#8f8f8f", fontSize: 26 }}>
            Go · React · Next.js · AI Systems · SaffronStays
          </div>
          <div
            style={{
              display: "flex",
              color: "#ff8a3d",
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            bdbose.in
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
