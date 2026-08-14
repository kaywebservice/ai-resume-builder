import type { MetadataRoute } from "next";
import { ALL_PAGES } from "@/lib/seo/content";
import { ALL_RESUME_PAGES, RESUME_CITIES, jobHubHref, cityHubHref } from "@/lib/resume/content";
import { JOBS } from "@/lib/resume/jobs";
import { getRequestSiteUrl, isAirbRequest } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const today = new Date();
  const siteUrl = await getRequestSiteUrl();
  const airb = await isAirbRequest();
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/seo`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/resume`, lastModified: today, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/templates`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/privacy`, lastModified: today, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/terms`, lastModified: today, changeFrequency: "yearly", priority: 0.2 },
  ];
  if (!airb) {
    staticPages.push({ url: `${siteUrl}/portfolio`, lastModified: today, changeFrequency: "weekly", priority: 0.9 });
  }
  const seoPages: MetadataRoute.Sitemap = ALL_PAGES.map((page) => ({
    url: `${siteUrl}/seo/${page.slug}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  const resumePages: MetadataRoute.Sitemap = ALL_RESUME_PAGES.map((page) => ({
    url: `${siteUrl}/resume/${page.slug}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.7,
  }));
  const jobHubs: MetadataRoute.Sitemap = JOBS.map((job) => ({
    url: `${siteUrl}${jobHubHref(job)}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
  const cityHubs: MetadataRoute.Sitemap = RESUME_CITIES.map((city) => ({
    url: `${siteUrl}${cityHubHref(city)}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
  return [...staticPages, ...seoPages, ...resumePages, ...jobHubs, ...cityHubs];
}