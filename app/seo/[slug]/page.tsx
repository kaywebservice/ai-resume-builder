import type { Metadata } from "next";
import Link from "next/link";
import {
  ALL_PAGES,
  PAGE_COUNT,
  SITE_URL,
  findPage,
  relatedPageLinks,
  rotated,
  hashOf,
  buildJsonLd,
  regionLabel,
  PORTFOLIO_SERVICES,
  PORTFOLIO_PROJECTS,
  PORTFOLIO_SITES,
  PORTFOLIO_SKILLS,
} from "@/lib/seo/content";
import { SeoQuoteForm } from "./SeoQuoteForm";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = findPage(slug);
  if (!page) return { title: "Not found" };
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `${SITE_URL}/seo/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${SITE_URL}/seo/${page.slug}`,
      type: "website",
      siteName: "Kaywebservice",
    },
  };
}

export default async function SeoLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = findPage(slug);
  if (!page) return null;

  const { city, service } = page;
  const seed = `${city.name}-${service.id}`;
  const faqs = service.faqs(city);
  const scope = service.scope(city);
  const related = relatedPageLinks(page);
  const projects = rotated(PORTFOLIO_PROJECTS, seed, 3);
  const skills = rotated(PORTFOLIO_SKILLS, seed, 6);
  const sites = rotated(PORTFOLIO_SITES, seed, 3);
  const jsonLd = buildJsonLd(page);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b16] text-slate-200">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="aurora aurora-blue -left-40 -top-32 h-[34rem] w-[34rem]" />
        <div className="aurora aurora-violet -right-48 top-80 h-[38rem] w-[38rem]" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.55) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 py-6 md:px-10 md:py-10">
        <header className="glass-panel hairline anim-fade-in-down flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/" className="logo-tile"><span className="text-sm font-black tracking-tight text-white">CV</span></Link>
            <div>
              <p className="text-sm font-bold tracking-[0.16em] text-white">KAYWEBSERVICE</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{service.name} · Global</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/portfolio" className="btn-ghost rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-blue-300 transition hover:bg-blue-500/10">Portfolio</Link>
            <Link href="/seo" className="premium-chip cursor-pointer">All {PAGE_COUNT} Pages</Link>
          </div>
        </header>

        <nav aria-label="Breadcrumb" className="mt-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
          <Link href="/" className="transition hover:text-slate-300">Home</Link>
          <span>/</span>
          <Link href="/seo" className="transition hover:text-slate-300">Service Pages</Link>
          <span>/</span>
          <span className="text-slate-300">{service.name}</span>
          <span>/</span>
          <span className="text-slate-300">{city.name}</span>
        </nav>

        <section className="anim-slide-in-left mt-8">
          <p className="eyebrow">{regionLabel(city.region)} · {city.country}</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-[1.08] tracking-tight text-white md:text-5xl">
            {service.name} in <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent">{city.name}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
            {service.intro(city)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="stat-chip"><b>{city.pop}</b> Local Market</span>
            <span className="stat-chip"><b>From {service.price}</b> Fixed Quote</span>
            <span className="stat-chip"><b>1–3 Weeks</b> Typical Delivery</span>
            <span className="stat-chip"><b>Lifetime</b> Ownership</span>
          </div>
        </section>

        <section className="anim-slide-in-right mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" style={{ animationDelay: "0.08s" }}>
          <div className="glass-panel hairline rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="section-num">01</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Why {city.name} Chooses Kaywebservice</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {service.whyCity(city)}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {city.industries.map((industry) => (
                <span key={industry} className="premium-chip">{industry}</span>
              ))}
              <span className="premium-chip">{city.university}</span>
              <span className="premium-chip">{city.landmarks[0]}</span>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <span className="section-num">02</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">What You Get</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <ul className="mt-4 space-y-3">
              {scope.map((item) => (
                <li key={item} className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-slate-300">
                  ✓ {item}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-3">
              <span className="section-num">03</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Pricing in {city.name}</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Standard</p>
                <p className="mt-2 text-3xl font-black text-blue-200">{service.price}</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-400">One-time payment · fixed quote before work starts</p>
              </div>
              <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Care Plan</p>
                <p className="mt-2 text-3xl font-black text-violet-200">$100–$300<span className="text-sm text-slate-400">/mo</span></p>
                <p className="mt-1 text-[11px] leading-snug text-slate-400">Updates, SEO care & priority support</p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <span className="section-num">04</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Portfolio — Recent Work</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <ul className="mt-4 space-y-2.5">
              {projects.map((project) => (
                <li key={project} className="text-sm leading-relaxed text-slate-300">· {project}</li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300">{skill}</span>
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Sites designed for clients include <span className="text-slate-200">{sites.join(", ")}</span>. Full portfolio:
              {" "}<Link href="/portfolio" className="text-blue-300 underline underline-offset-2 hover:text-blue-200">kaywebservice portfolio</Link>.
            </p>
          </div>

          <aside className="space-y-6">
            <div className="glass-panel hairline rounded-3xl p-6">
              <p className="eyebrow">Free Quote</p>
              <h2 className="mt-2 text-lg font-bold text-white">Start your {service.name} project in {city.name}</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                Tell me about your project — I reply within 24 hours with a fixed quote.
              </p>
              <SeoQuoteForm serviceName={service.name} cityName={city.name} />
            </div>

            <div className="glass-panel hairline rounded-3xl p-6">
              <p className="eyebrow">Service Page Index</p>
              <h2 className="mt-2 text-lg font-bold text-white">Explore {city.name} & Nearby</h2>
              <ul className="mt-4 space-y-2">
                {related.map((link) => (
                  <li key={link.slug}>
                    <Link href={`/seo/${link.slug}`} className="text-sm text-blue-300 transition hover:text-blue-200">
                      {link.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        <section className="anim-fade-in-up mt-10" style={{ animationDelay: "0.12s" }}>
          <div className="glass-panel hairline rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="section-num">05</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Frequently Asked Questions</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="mt-5 space-y-4">
              {faqs.map((faq) => (
                <details key={faq.q} className="group rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4">
                  <summary className="cursor-pointer list-none text-sm font-bold text-white">
                    <span className="mr-2 text-blue-300 group-open:rotate-90 inline-block transition">›</span>
                    {faq.q}
                  </summary>
                  <p className="mt-3 pl-5 text-sm leading-relaxed text-slate-400">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="anim-fade-in-up mt-10" style={{ animationDelay: "0.16s" }}>
          <div className="glass-panel hairline rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="section-num">06</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">All Services & Pricing</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {PORTFOLIO_SERVICES.map((entry) => (
                <div key={entry.name} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
                  <p className="text-sm font-bold text-white">{entry.name}</p>
                  <p className="mt-1 text-xs font-black text-blue-200">{entry.price}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6">
              <p className="text-xs leading-relaxed text-slate-400">
                Kaykay Wise — Senior Full-Stack Engineer & SaaS Founder. Remote-first, working with clients in {city.name}, the {regionLabel(city.region)}, and worldwide.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/portfolio" className="btn-ghost rounded-xl px-5 py-2.5 text-xs font-bold text-blue-300 transition hover:bg-blue-500/10">Full Portfolio</Link>
                <Link href="/" className="btn-primary rounded-xl px-5 py-2.5 text-xs font-bold text-white">Try the Studio →</Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-white/5 py-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
            © 2026 <span className="font-bold text-slate-300">Kaywebservice Enterprise Solutions</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
            <Link href="/seo" className="transition hover:text-slate-300">All {PAGE_COUNT} Service Pages</Link>
            <span className="text-slate-700">·</span>
            <Link href="/portfolio" className="transition hover:text-slate-300">Portfolio</Link>
            <span className="text-slate-700">·</span>
            <Link href="/privacy" className="transition hover:text-slate-300">Privacy</Link>
            <span className="text-slate-700">·</span>
            <Link href="/terms" className="transition hover:text-slate-300">Terms</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

export const generatedHash = hashOf;