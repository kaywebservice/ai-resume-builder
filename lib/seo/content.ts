import { CITIES, citySlug, REGION_LABELS, type City } from "./data";
import { SEO_SERVICES, type SeoService } from "./services";

export const SITE_URL = "https://ai-resume-builder-chi-orcin.vercel.app";

export type SeoPage = {
  slug: string;
  city: City;
  service: SeoService;
  title: string;
  description: string;
  h1: string;
};

export const PORTFOLIO_SERVICES = [
  { name: "Web Design & Development", price: "$250–$800" },
  { name: "E-Commerce Development", price: "$600–$1,500" },
  { name: "SEO Optimization", price: "$300–$800" },
  { name: "AI & SaaS Development", price: "from $1,500" },
  { name: "WordPress Development", price: "$300–$800" },
];

export const PORTFOLIO_PROJECTS = [
  "AI Resume Builder — AI-powered resume & cover letter generation with ATS scoring, 50 templates, and paid unlocks",
  "Photoshop Clone — browser-based image editor with layers, filters, and export workflows",
  "AI Image Generator — prompt-based generation with gallery management",
  "Behavioral Profiling SaaS — full-stack platform with Stripe payments and token-based access control",
  "ERC-20 Kaykay Token — deployable smart contract on Ethereum-compatible chains",
  "Token-Based Access Control System — Node.js backend with authentication and token balances",
];

export const PORTFOLIO_SITES = ["predictorama.com", "cistudios.com", "luxurylifemag.co.uk", "ecabinets.com", "indieauthoralley.com"];

export const PORTFOLIO_SKILLS = [
  "React", "Next.js", "Node.js", "PHP", "Python", "WordPress",
  "Tailwind CSS", "Supabase", "Firebase", "Stripe", "AI Integration", "SEO",
];

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function pageSlug(city: City, service: SeoService): string {
  return `${service.slugPart}-in-${citySlug(city)}`;
}

export const ALL_PAGES: SeoPage[] = CITIES.flatMap((city) =>
  SEO_SERVICES.map((service) => {
    const titleBase = `${service.name} in ${city.name}, ${city.country}`;
    return {
      slug: pageSlug(city, service),
      city,
      service,
      title: `${titleBase} | Kaywebservice`,
      description: `${service.name} in ${city.name} — ${service.tagline}. ${city.pop} market · quotes from ${service.price} · responsive builds, local SEO & ongoing support.`,
      h1: `${service.name} in ${city.name}`,
    };
  }),
);

export const PAGE_COUNT = ALL_PAGES.length;

const PAGE_INDEX = new Map(ALL_PAGES.map((page, index) => [page.slug, index]));

export function findPage(slug: string): SeoPage | undefined {
  return PAGE_INDEX.has(slug) ? ALL_PAGES[PAGE_INDEX.get(slug)!] : undefined;
}

export function relatedPageLinks(page: SeoPage): { slug: string; label: string }[] {
  const links: { slug: string; label: string }[] = [];

  const sameService = ALL_PAGES.filter((candidate) => candidate.service.id === page.service.id && candidate.city.region === page.city.region);
  for (const candidate of sameService) {
    if (candidate.slug !== page.slug && links.length < 3) {
      links.push({ slug: candidate.slug, label: `${candidate.service.name} in ${candidate.city.name}` });
    }
  }

  const sameCity = ALL_PAGES.filter((candidate) => candidate.city.name === page.city.name && candidate.service.id !== page.service.id);
  for (const candidate of sameCity) {
    if (links.length < 6) {
      links.push({ slug: candidate.slug, label: `${candidate.service.name} in ${candidate.city.name}` });
    }
  }

  const neighbours = CITIES.filter((candidate) => candidate.region === page.city.region && candidate.name !== page.city.name);
  for (const candidate of neighbours) {
    if (links.length < 8) {
      links.push({
        slug: pageSlug(candidate, page.service),
        label: `${page.service.name} in ${candidate.name}`,
      });
    }
  }

  return links.slice(0, 8);
}

export function regionLabel(region: string): string {
  return REGION_LABELS[region] ?? region;
}

export function hashOf(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function rotated<T>(items: T[], seed: string, count: number): T[] {
  const start = hashOf(seed) % items.length;
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(items[(start + i) % items.length]);
  }
  return result;
}

export function buildJsonLd(page: SeoPage) {
  const city = page.city;
  const faqs = page.service.faqs(city).map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  }));
  return [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: `Kaywebservice — ${page.service.name}`,
      description: page.description,
      url: `${SITE_URL}/seo/${page.slug}`,
      areaServed: { "@type": "City", name: city.name },
      address: { "@type": "PostalAddress", addressLocality: city.name, addressCountry: city.country },
      telephone: "+1-213-329-5005",
      email: "kaywebservice@gmail.com",
      priceRange: page.service.price,
      founder: { "@type": "Person", name: "Kaykay Wise" },
      knowsAbout: [page.service.name, "Web Development", "WordPress", "SEO", "AI & SaaS"],
    },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs },
  ];
}

export { slugify };