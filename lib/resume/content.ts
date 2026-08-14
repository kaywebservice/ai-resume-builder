import { CITIES, citySlug, REGION_LABELS, type City } from "@/lib/seo/data";
import { JOBS, JOB_CATEGORIES, type Job } from "@/lib/resume/jobs";
import { SITE_URL, hashOf } from "@/lib/seo/content";

export { SITE_URL };

export const RESUME_CITY_SLUGS = [
  "new-york", "los-angeles", "chicago", "houston", "dallas", "austin",
  "san-francisco", "seattle", "washington", "boston", "miami", "atlanta",
  "toronto", "montreal", "vancouver",
  "london", "manchester", "dublin",
  "paris", "berlin", "amsterdam",
  "sydney", "melbourne", "dubai", "singapore",
];

export const RESUME_CITIES: City[] = CITIES.filter((city) => RESUME_CITY_SLUGS.includes(citySlug(city)));

export type ResumePage = {
  slug: string;
  job: Job;
  city: City;
  title: string;
  description: string;
  h1: string;
};

export function resumePageSlug(job: Job, city: City): string {
  return `${job.id}-resume-in-${citySlug(city)}`;
}

export const ALL_RESUME_PAGES: ResumePage[] = RESUME_CITIES.flatMap((city) =>
  JOBS.map((job) => {
    const h1 = `${job.name} Resume in ${city.name}`;
    return {
      slug: resumePageSlug(job, city),
      job,
      city,
      title: `${h1} — ATS-Optimized | AI Resume Builder`,
      description: `Need a ${job.name} resume for ${city.name}, ${city.country}? Build an ATS-optimized ${job.name} resume in 5 minutes with 50+ professional templates, AI writing help, and instant ATS scoring.`,
      h1,
    };
  }),
);

export const RESUME_PAGE_COUNT = ALL_RESUME_PAGES.length;

const PAGE_INDEX = new Map(ALL_RESUME_PAGES.map((page, index) => [page.slug, index]));

export function findResumePage(slug: string): ResumePage | undefined {
  return PAGE_INDEX.has(slug) ? ALL_RESUME_PAGES[PAGE_INDEX.get(slug)!] : undefined;
}

export function jobHubHref(job: Job): string {
  return `/resume/jobs/${job.id}`;
}

export function cityHubHref(city: City): string {
  return `/resume/cities/${citySlug(city)}`;
}

export function studioHref(job: Job): string {
  return `/?jobTitle=${encodeURIComponent(job.name)}`;
}

export function relatedResumeLinks(page: ResumePage): { href: string; label: string }[] {
  const links: { href: string; label: string }[] = [];
  const sameJob = ALL_RESUME_PAGES.filter((candidate) => candidate.job.id === page.job.id && candidate.slug !== page.slug);
  for (const candidate of sameJob) {
    if (links.length < 4) {
      links.push({ href: `/resume/${candidate.slug}`, label: `${candidate.job.name} Resume in ${candidate.city.name}` });
    }
  }
  const sameCity = ALL_RESUME_PAGES.filter((candidate) => candidate.city.name === page.city.name && candidate.slug !== page.slug);
  for (const candidate of sameCity) {
    if (links.length < 8) {
      links.push({ href: `/resume/${candidate.slug}`, label: `${candidate.job.name} Resume in ${candidate.city.name}` });
    }
  }
  return links.slice(0, 8);
}

const IRREGULAR_PLURALS: Record<string, string> = {
  caregiver: "Caregivers and CNAs",
  "social-media-manager": "Social Media Managers",
  "hotel-front-desk-agent": "Hotel Front Desk Agents",
  "real-estate-agent": "Real Estate Agents",
  "customer-service-representative": "Customer Service Representatives",
};

function simplePlural(name: string): string {
  if (/[sxz]$/.test(name) || /(ch|sh)$/.test(name)) return `${name}es`;
  if (/[^aeiou]y$/.test(name)) return `${name.slice(0, -1)}ies`;
  return `${name}s`;
}

export function jobPlural(job: Job): string {
  return IRREGULAR_PLURALS[job.id] ?? simplePlural(job.name);
}

function pick<T>(items: T[], seed: string): T {
  return items[hashOf(seed) % items.length];
}

export function marketParagraph(job: Job, city: City): string {
  const industry = pick(city.industries, `${job.id}-${city.name}`);
  return `Employers in ${city.name} — across the ${industry} scene, around ${city.landmarks[0]}, and in districts like ${city.districts[0]} — are constantly recruiting ${job.name.toLowerCase()} talent. With ${city.pop} people and top institutions like ${city.university} feeding the local workforce, postings in this market get hundreds of applications. A ${job.name} resume that is clean, keyword-rich, and ATS-optimized is what separates a callback from a silent rejection.`;
}

export function buildFaqs(job: Job, city: City): { q: string; a: string }[] {
  const topKeywords = job.keywords.slice(0, 4).join(", ");
  return [
    {
      q: `What is the best resume format for a ${job.name} in ${city.name}?`,
      a: `Use a clean, reverse-chronological format with a professional summary, skills, experience, and education sections. Avoid tables, columns, photos, and graphics — most employers in ${city.name} use applicant tracking systems (ATS) that struggle to read them.`,
    },
    {
      q: `How do I make my ${job.name} resume pass ATS screening?`,
      a: `Mirror the exact wording of the job description and include keywords the role actually uses — for ${job.name} roles, that typically means ${topKeywords}. Keep standard headings, use a normal font, and export as a text-based PDF.`,
    },
    {
      q: `How long should a ${job.name} resume be?`,
      a: `If you have under 10 years of experience, keep it to one page. Senior ${jobPlural(job).toLowerCase()} can use up to two pages — but every line must add value, and the first half of page one must sell your top achievements.`,
    },
    {
      q: `Can I check my ${job.name} resume against ATS before applying in ${city.name}?`,
      a: `Yes — the AI Resume Builder scores your resume for ATS readiness instantly, flags weak sections, and suggests fixes before you send a single application in ${city.name}.`,
    },
    {
      q: `What does a ${job.name} resume cost, and how fast is it ready?`,
      a: `You can build and download a ${job.name} resume free in about 5 minutes. Premium templates and full ATS scoring unlock with a one-time payment of $14.99 (PRO) or $29.99 (PRO+).`,
    },
  ];
}

export function buildJsonLd(page: ResumePage) {
  const faqs = buildFaqs(page.job, page.city).map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  }));
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: page.title,
      description: page.description,
      url: `${SITE_URL}/resume/${page.slug}`,
      provider: {
        "@type": "LocalBusiness",
        name: "Kaywebservice",
        email: "kaywebservice@gmail.com",
        telephone: "+1-213-329-5005",
        founder: { "@type": "Person", name: "Kaykay Wise" },
      },
      areaServed: { "@type": "City", name: page.city.name, "@id": `${SITE_URL}/resume/cities/${citySlug(page.city)}` },
      offers: { "@type": "Offer", price: "14.99", priceCurrency: "USD" },
      serviceType: `${page.job.name} Resume`,
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "AI Resume Builder",
      operatingSystem: "Web",
      applicationCategory: "BusinessApplication",
      description: `Free AI resume builder used to create ${page.job.name} resumes for ${page.city.name} — 50+ templates, AI writing help, and ATS scoring.`,
      offers: [
        { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free tier" },
        { "@type": "Offer", price: "14.99", priceCurrency: "USD", description: "PRO — one-time" },
        { "@type": "Offer", price: "29.99", priceCurrency: "USD", description: "PRO+ — one-time" },
      ],
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs },
  ];
}

export function categoryLabel(job: Job): string {
  const category = JOB_CATEGORIES.find((entry) => entry.id === job.category);
  return category?.label ?? job.category;
}

export function regionLabel(region: string): string {
  return REGION_LABELS[region] ?? region;
}

export function jobHubTitle(job: Job): string {
  return `${job.name} Resume Examples & Templates — All ${RESUME_CITIES.length} Cities | AI Resume Builder`;
}

export function jobHubDescription(job: Job): string {
  return `Browse ${RESUME_CITIES.length} city-specific ${job.name} resume pages. ATS-optimized templates, keyword lists, bullet examples, and pricing for ${jobPlural(job).toLowerCase()} across the US, Canada, Europe, Australia, and beyond.`;
}

export function cityHubTitle(city: City): string {
  return `Resume Examples for Every Job in ${city.name} — ${JOBS.length} Careers | AI Resume Builder`;
}

export function cityHubDescription(city: City): string {
  return `Find the right resume for your job in ${city.name}, ${city.country}. ${JOBS.length} ATS-optimized resume guides with templates, keywords, and instant scoring — free to start.`;
}