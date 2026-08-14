import type { Metadata } from "next";
import Link from "next/link";
import {
  ALL_RESUME_PAGES,
  RESUME_CITIES,
  SITE_URL,
  cityHubTitle,
  cityHubDescription,
} from "@/lib/resume/content";
import { JOB_CATEGORIES } from "@/lib/resume/jobs";
import { citySlug } from "@/lib/seo/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return RESUME_CITIES.map((city) => ({ slug: citySlug(city) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const city = RESUME_CITIES.find((candidate) => citySlug(candidate) === slug);
  if (!city) return { title: "Not found" };
  return {
    title: cityHubTitle(city),
    description: cityHubDescription(city),
    alternates: { canonical: `${SITE_URL}/resume/cities/${slug}` },
    openGraph: {
      title: cityHubTitle(city),
      description: cityHubDescription(city),
      url: `${SITE_URL}/resume/cities/${slug}`,
      type: "website",
      siteName: "AI Resume Builder",
    },
  };
}

export default async function CityHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = RESUME_CITIES.find((candidate) => citySlug(candidate) === slug);
  if (!city) return null;

  const pages = ALL_RESUME_PAGES.filter((page) => page.city.name === city.name);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b16] text-slate-200">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="aurora aurora-blue -left-40 -top-32 h-[34rem] w-[34rem]" />
        <div className="aurora aurora-violet -right-48 top-80 h-[38rem] w-[38rem]" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.55) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 py-6 md:px-10 md:py-10">
        <header className="glass-panel hairline anim-fade-in-down flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/" className="logo-tile"><span className="text-sm font-black tracking-tight text-white">CV</span></Link>
            <div>
              <p className="text-sm font-bold tracking-[0.16em] text-white">AI RESUME BUILDER</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{city.name} · {city.country}</p>
            </div>
          </div>
          <Link href="/resume" className="btn-ghost rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-blue-300 transition hover:bg-blue-500/10">All Resume Pages</Link>
        </header>

        <nav aria-label="Breadcrumb" className="mt-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
          <Link href="/" className="transition hover:text-slate-300">Home</Link>
          <span>/</span>
          <Link href="/resume" className="transition hover:text-slate-300">Resume Pages</Link>
          <span>/</span>
          <span className="text-slate-300">{city.name}</span>
        </nav>

        <section className="anim-slide-in-left mt-8 text-center">
          <p className="eyebrow">{city.country} · {city.pop} Market</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-[1.08] tracking-tight text-white md:text-5xl">
            Resumes for Every Job in <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent">{city.name}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
            {pages.length} city-specific resume guides for {city.name} — every one ATS-optimized with local keywords, bullet examples, and instant scoring. Free to build in 5 minutes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary rounded-xl px-7 py-3 text-sm font-bold text-white">Build My Resume Free →</Link>
            <span className="premium-chip">{pages.length} Jobs · {city.university}</span>
          </div>
        </section>

        <section className="mt-12 space-y-10">
          {JOB_CATEGORIES.map((category, categoryIndex) => {
            const categoryPages = pages.filter((page) => page.job.category === category.id);
            if (categoryPages.length === 0) return null;
            return (
              <div key={category.id}>
                <div className="flex items-center gap-3">
                  <span className="section-num">{categoryIndex + 1}</span>
                  <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">{category.label}</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  <span className="text-[11px] text-slate-500">{categoryPages.length} jobs</span>
                </div>
                <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {categoryPages.map((page) => (
                    <Link
                      key={page.slug}
                      href={`/resume/${page.slug}`}
                      className="group rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-blue-500/10"
                    >
                      <p className="text-sm font-bold text-white group-hover:text-blue-200">{page.job.name} Resume in {page.city.name}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">ATS-optimized · 5-minute build</p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-3">
            <span className="section-num">{JOB_CATEGORIES.length + 1}</span>
            <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Local Services in {city.name}</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="-mt-4 flex flex-wrap gap-2">
            {[
              ["web-design", "Web Design"],
              ["ecommerce-development", "E-Commerce"],
              ["seo-optimization", "SEO"],
              ["ai-saas-development", "AI & SaaS"],
              ["wordpress-development", "WordPress"],
            ].map(([slugPart, label]) => (
              <Link key={slugPart} href={`/seo/${slugPart}-in-${slug}`} className="premium-chip">{label} in {city.name}</Link>
            ))}
          </div>
        </section>

        <footer className="mt-10 border-t border-white/5 py-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
            © 2026 <span className="font-bold text-slate-300">Kaywebservice Enterprise Solutions</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
            <Link href="/resume" className="transition hover:text-slate-300">Resume Pages</Link>
            <span className="text-slate-700">·</span>
            <Link href="/seo" className="transition hover:text-slate-300">Service Pages</Link>
            <span className="text-slate-700">·</span>
            <Link href="/portfolio" className="transition hover:text-slate-300">Portfolio</Link>
            <span className="text-slate-700">·</span>
            <Link href="/" className="transition hover:text-slate-300">Studio</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}