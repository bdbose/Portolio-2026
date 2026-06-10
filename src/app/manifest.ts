import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bidipto Bose — Senior Software Engineer",
    short_name: "Bidipto Bose",
    description:
      "Senior Software Engineer at SaffronStays. Go backends, booking & revenue systems, AI search, custom DNS infrastructure and React/Next.js frontends.",
    start_url: "/",
    display: "standalone",
    background_color: "#070707",
    theme_color: "#070707",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
