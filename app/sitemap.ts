import type { MetadataRoute } from "next";
import { ALL_PAGES, SITE_URL } from "@/lib/seo/content";
import { ALL_RESUME_PAGES, RESUME_CITIES, jobHubHref, cityHubHref } from "@/lib/resume/content";
import { JOBS } from "@/lib/resume/jobs";

export default function sitemap(): MetadataRoute.Sitemap {
  const today = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/portfolio`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/seo`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/resume`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
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
  const resumePages: MetadataRoute.Sitemap = ALL_RESUME_PAGES.map((page) => ({
    url: `${SITE_URL}/resume/${page.slug}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  const jobHubs: MetadataRoute.Sitemap = JOBS.map((job) => ({
    url: `${SITE_URL}${jobHubHref(job)}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
  const cityHubs: MetadataRoute.Sitemap = RESUME_CITIES.map((city) => ({
    url: `${SITE_URL}${cityHubHref(city)}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
  return [...staticPages, ...seoPages, ...resumePages, ...jobHubs, ...cityHubs];
}