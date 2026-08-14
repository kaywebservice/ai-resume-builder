import type { MetadataRoute } from "next";
import { ALL_PAGES, SITE_URL } from "@/lib/seo/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/portfolio`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/seo`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/templates`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: today, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: today, changeFrequency: "yearly", priority: 0.2 },
  ];
  const seoPages: MetadataRoute.Sitemap = ALL_PAGES.map((page) => ({
    url: `${SITE_URL}/seo/${page.slug}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  return [...staticPages, ...seoPages];
}