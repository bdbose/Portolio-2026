import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://bdbose.in",
      lastModified: new Date("2026-06-10"),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
