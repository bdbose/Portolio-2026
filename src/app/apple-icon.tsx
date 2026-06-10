import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon — terminal prompt mark on solid dark (iOS rounds it).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070707",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path
            d="M 18 18 L 31 32 L 18 46"
            fill="none"
            stroke="#ff8a3d"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="37" y="38" width="13" height="9" rx="1.5" fill="#ededed" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
