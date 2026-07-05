import type { MetadataRoute } from "next";

const BASE_URL = "https://0xci.online";

// Bump this only when a route's content actually changes, using the
// current request time here made every sitemap fetch report a fresh
// lastmod, which defeats the purpose of the freshness signal.
const LAST_MODIFIED = new Date("2026-07-04T08:45:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/docs", "/changelog", "/privacy"];
  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.6,
  }));
}
