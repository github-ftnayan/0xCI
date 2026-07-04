import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/setup", "/api"] },
    sitemap: "https://0xci.online/sitemap.xml",
  };
}
