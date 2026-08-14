import type { City } from "./data";

export type SeoService = {
  id: string;
  name: string;
  slugPart: string;
  price: string;
  tagline: string;
  intro: (city: City) => string;
  whyCity: (city: City) => string;
  scope: (city: City) => string[];
  faqs: (city: City) => { q: string; a: string }[];
};

const pick = <T,>(items: T[], hash: number): T => items[hash % items.length];

export const SEO_SERVICES: SeoService[] = [
  {
    id: "web-design",
    name: "Web Design & Development",
    slugPart: "web-design",
    price: "$250–$800",
    tagline: "high-converting websites built to grow your business",
    intro: (city) =>
      `Looking for web design in ${city.name}? Your website is your hardest-working salesperson — and in a city with ${
        city.pop
      } people and a thriving ${pick(city.industries, city.name.length)} sector, it needs to stand out in seconds. I design and build fast, modern, mobile-first websites that turn visitors into customers. Every project is unique to your business — no cookie-cutter templates — and every site is optimized for speed, search engines, and conversions from day one.`,
    whyCity: (city) =>
      `Businesses across ${city.name} — from ${city.districts[0]} startups to established names near ${
        city.landmarks[0]
      } — trust well-crafted sites to win local customers. With ${city.university} and other institutions driving talent into the area, the local market is competitive, and a dated website quietly loses you clients every week. I help ${city.name} businesses of every size look credible online, rank locally, and turn their website into their best employee.`,
    scope: (city) => [
      "Custom modern design tailored to your brand",
      `Mobile-first build tested across devices in ${city.name}`,
      "Fast loading speed & Core Web Vitals optimization",
      "Local SEO setup to rank in ${city.name} searches",
      "Contact forms, maps & conversion-focused calls to action",
    ],
    faqs: (city) => [
      { q: `How much does a website cost in ${city.name}?`, a: `Most business websites in ${city.name} range from $250 to $800. The final quote depends on the number of pages, features, and integrations — I always confirm the exact price before starting, with no hidden fees.` },
      { q: `How long does it take to build a website in ${city.name}?`, a: `A typical business website takes 1–2 weeks from start to launch. Larger projects with e-commerce or custom features take longer — I share a clear timeline before we begin.` },
      { q: `Will my ${city.name} website rank on Google?`, a: `Yes — every site I build includes local SEO fundamentals, fast page speed, and clean code. I also offer a dedicated SEO service to take your ${city.name} rankings further.` },
      { q: `Do you work with ${city.name} businesses remotely?`, a: `Absolutely. I work with clients all over the world, including ${city.name}, with daily updates over email or WhatsApp and a final handover you fully own.` },
    ],
  },
  {
    id: "ecommerce",
    name: "E-Commerce Development",
    slugPart: "ecommerce-development",
    price: "$600–$1,500",
    tagline: "online stores that sell while you sleep",
    intro: (city) =>
      `Looking for e-commerce development in ${city.name}? The online shopping market keeps growing — and in a city of ${
        city.pop
      } people with a strong ${pick(city.industries, city.name.length + 3)} scene, customers already expect to buy from you online. I build complete online stores with product catalogs, secure checkout, and payment integration, so ${city.name} shoppers can buy from you around the clock — safely and smoothly.`,
    whyCity: (city) =>
      `From ${city.districts[0]} boutiques to brands shipping across the country, ${city.name} businesses are winning sales online. A professionally built store beats a generic platform template on speed, trust, and conversion — and those three things decide whether shoppers in ${city.name} check out or leave the cart. I handle products, payments, shipping zones, and marketing integrations so you can focus on the business, not the tech.`,
    scope: (city) => [
      "Product catalog, categories & search tuned for your market",
      "Secure checkout with cards, wallets & local payment options",
      `Multiple shipping zones including ${city.name} and nationwide delivery`,
      "Inventory & order management dashboard",
      "Marketing hooks: discounts, abandoned-cart emails, analytics",
    ],
    faqs: (city) => [
      { q: `What does an online store cost in ${city.name}?`, a: `E-commerce builds in ${city.name} typically start at $600 and go up based on catalog size and features like subscriptions or multi-vendor marketplaces. You get a fixed quote before we start.` },
      { q: `Can you accept payments in ${city.name}'s local currency?`, a: `Yes — I set up card payments, digital wallets, and popular local providers, so your ${city.name} customers pay the way they prefer.` },
      { q: `Do I need a designer separately?`, a: `No. Design, development, payment setup, and post-launch support are all included in my e-commerce service for ${city.name} clients.` },
      { q: `How fast can my store go live in ${city.name}?`, a: `A standard store launches in 2–3 weeks. With ready product data, I can often go even faster.` },
    ],
  },
  {
    id: "seo",
    name: "SEO Optimization",
    slugPart: "seo-optimization",
    price: "$300–$800",
    tagline: "rank on Google and get found by local customers",
    intro: (city) =>
      `Looking for SEO services in ${city.name}? Thousands of people in ${city.name} search Google every day for the services you offer — and most of them click the first few results. I optimize your website so ${city.name} searchers can actually find you: technical fixes, keyword targeting, content improvements, and local SEO across the ${pick(
        city.industries,
        city.name.length + 7,
      )} space your business operates in.`,
    whyCity: (city) =>
      `In a competitive market like ${city.name}, ranking is everything. Customers searching near ${city.landmarks[0]} or in ${city.districts[0]} are usually ready to buy — and Google rewards sites that are fast, well-structured, and genuinely useful. My SEO work for ${city.name} businesses combines on-page optimization, technical health, and content strategy to move the metrics that matter: rankings, traffic, and leads.`,
    scope: (city) => [
      `Keyword research focused on ${city.name} buyers`,
      "Technical SEO: speed, mobile, crawlability, schema markup",
      "On-page optimization for every key page",
      `Local SEO: Google Business Profile & ${city.name} citations`,
      "Monthly analytics reports & ranking monitoring",
    ],
    faqs: (city) => [
      { q: `How long until my website ranks in ${city.name}?`, a: `Most improvements show within 4–8 weeks, with meaningful ranking gains building over 3–6 months. SEO compounds — the earlier you start in ${city.name}, the further you get ahead.` },
      { q: `Do you offer monthly SEO care in ${city.name}?`, a: `Yes — after the initial optimization, I offer ongoing monthly care from $100–$300/month covering content updates, link building, and performance reports for your ${city.name} site.` },
      { q: `Can you do SEO for my existing website in ${city.name}?`, a: `Absolutely. Most of my ${city.name} SEO clients already have websites — I audit, fix, and optimize what's there before expanding.` },
      { q: `Is this the Programmatic SEO option too?`, a: `Yes — I also build programmatic SEO systems (like this very page) that create hundreds of unique, indexed landing pages — ideal for ${city.name} businesses targeting many locations or search terms at scale.` },
    ],
  },
  {
    id: "ai-saas",
    name: "AI & SaaS Development",
    slugPart: "ai-saas-development",
    price: "from $1,500",
    tagline: "AI-powered products and platforms built end-to-end",
    intro: (city) =>
      `Looking for AI or SaaS development in ${city.name}? Companies everywhere — including ${city.name} — are using AI tools, automation, and subscription platforms to cut costs and grow faster. I build complete AI-powered applications and SaaS products end-to-end: from the first line of code to paid customers, including payment integration and access control. This very website you're on is an AI-powered SaaS I designed, built, and monetized myself.`,
    whyCity: (city) =>
      `${city.name}'s market won't wait — early movers there are already shipping AI features and subscription products. With a ${pick(
        city.industries,
        city.name.length + 11,
      )} ecosystem and talent from ${city.university}, the demand for modern software in ${city.name} is only growing. I help founders and businesses in ${city.name} launch MVPs, add AI capabilities, and build the infrastructure — dashboards, payments, analytics — that makes a product ready for real users.`,
    scope: (city) => [
      `AI features: generation, chat, scoring & automation`,
      "Full SaaS platforms: auth, dashboards, access control",
      "Payment integration (Stripe, Creem) with webhooks",
      `Scalable architecture ready for ${city.name} and beyond`,
      "Launch support, analytics, and ongoing improvements",
    ],
    faqs: (city) => [
      { q: `How much does a SaaS MVP cost in ${city.name}?`, a: `AI and SaaS projects in ${city.name} start at $1,500 for an MVP, scaling with complexity — AI features, payments, and user management add scope. You get a clear fixed quote and timeline first.` },
      { q: `Can you add AI to my existing product in ${city.name}?`, a: `Yes — integrations are often the fastest win. I add AI features to existing ${city.name} products without rebuilding what's already working.` },
      { q: `Do you handle payments and subscriptions?`, a: `Yes — I integrate Stripe or Creem with webhook verification, so subscriptions and one-time payments in ${city.name} and worldwide are secure and automatic.` },
      { q: `Can I see a live example?`, a: `This website — an AI resume builder with 50 templates, scoring, exports, and paid unlocks — is a working example of exactly what I build for ${city.name} clients.` },
    ],
  },
  {
    id: "wordpress",
    name: "WordPress Development",
    slugPart: "wordpress-development",
    price: "$300–$800",
    tagline: "powerful, easy-to-manage websites for any business",
    intro: (city) =>
      `Looking for WordPress development in ${city.name}? If you want a professional website you can actually manage yourself — without learning code — WordPress is the platform, and I'm the developer who builds it right. I create fast, secure, beautiful WordPress sites for ${city.name} businesses: business sites, blogs, online stores, and membership sites, all with an editor so simple anyone on your team can use it.`,
    whyCity: (city) =>
      `Most businesses in ${city.name} don't need a developer on call — they need a website they can update themselves. From ${city.districts[1]} shops and ${city.districts[0]} service providers to teams near ${
        city.landmarks[1]
      }, my WordPress builds combine a professional custom design with the freedom to edit everything in minutes. And because I keep code clean, security patched, and speed fast, your ${city.name} site stays healthy long after launch.`,
    scope: (city) => [
      "Custom WordPress theme built for your brand",
      "Content management you can use without training",
      "Speed & security hardening on every build",
      `Local SEO setup targeting ${city.name} customers`,
      "Stores, blogs, or membership areas on request",
    ],
    faqs: (city) => [
      { q: `Why choose WordPress for my ${city.name} site?`, a: `WordPress powers over 40% of the web because it balances power with simplicity. For ${city.name} businesses that want to update their own content, it's the most practical choice.` },
      { q: `What does a WordPress site cost in ${city.name}?`, a: `Typical WordPress builds in ${city.name} range from $300 to $800. E-commerce features add to the scope — I confirm the exact price before starting.` },
      { q: `Can you migrate my old site to WordPress?`, a: `Yes — I move existing content, design, and SEO value into a fresh WordPress build for ${city.name} clients, with redirects so you don't lose rankings.` },
      { q: `Is my WordPress site in ${city.name} secure?`, a: `Every build includes security hardening — updated plugins, firewalls, backups, and login protection — maintained with my optional monthly care plan.` },
    ],
  },
];

export function getService(id: string): SeoService | undefined {
  return SEO_SERVICES.find((service) => service.id === id);
}