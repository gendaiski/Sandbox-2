import type { MetadataRoute } from "next"

import { legalNav, site } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/for-merchants", priority: 0.9 },
    { path: "/faq", priority: 0.7 },
    ...legalNav.map((item) => ({ path: item.href, priority: 0.3 })),
  ]
  return pages.map((page) => ({
    url: `${site.url}${page.path}`,
    priority: page.priority,
  }))
}
