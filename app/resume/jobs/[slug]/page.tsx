import type { Metadata } from "next";
import Link from "next/link";
import {
  ALL_RESUME_PAGES,
  RESUME_CITIES,
  SITE_URL,
  jobHubTitle,
  jobHubDescription,
  jobPlural,
  regionLabel,
  cityHubHref,
  studioHref,
} from "@/lib/resume/content";
import { JOBS, getJob } from "@/lib/resume/jobs";

export const dynamicParams = false;

const REGION_ORDER = ["usa", "canada", "uk-ireland", "europe", "australasia", "asia-middleeast"];

export function generateStaticParams() {
  return JOBS.map((job) => ({ slug: job.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job) return { title: "Not found" };
  return {
    title: jobHubTitle(job),
    description: jobHubDescription(job),
    alternates: { canonical: `${SITE_URL}/resume/jobs/${job.id}` },
    openGraph: {
      title: jobHubTitle(job),
      description: jobHubDescription(job),
      url: `${SITE_URL}/resume/jobs/${job.id}`,
      type: "website",
      siteName: "AI Resume Builder",
    },
  };
}

export default async function JobHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = getJob(slug);
  if (!job) return null;

  const pages = ALL_RESUME_PAGES.filter((page) => page.job.id === job.id);
  const plural = jobPlural(job);

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
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{job.name} · Worldwide</p>
            </div>
          </div>
          <Link href="/resume" className="btn-ghost rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-blue-300 transition hover:bg-blue-500/10">All Resume Pages</Link>
        </header>

        <nav aria-label="Breadcrumb" className="mt-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
          <Link href="/" className="transition hover:text-slate-300">Home</Link>
          <span>/</span>
          <Link href="/resume" className="transition hover:text-slate-300">Resume Pages</Link>
          <span>/</span>
          <span className="text-slate-300">{job.name}</span>
        </nav>

        <section className="anim-slide-in-left mt-8 text-center">
          <p className="eyebrow">Resume Guides</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-[1.08] tracking-tight text-white md:text-5xl">
            {job.name} Resume — <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent">{pages.length} City Guides</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
            {job.summary} Pick your city for ATS-optimized templates, keyword lists, and market-specific advice — free to build in 5 minutes.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={studioHref(job)} className="btn-primary rounded-xl px-7 py-3 text-sm font-bold text-white">Build My {job.name} Resume →</Link>
            <span className="premium-chip">{plural} · {pages.length} Locations</span>
          </div>
        </section>

        <section className="mt-12 space-y-10">
          {REGION_ORDER.map((region, regionIndex) => {
            const cityPages = pages.filter((page) => page.city.region === region);
            if (cityPages.length === 0) return null;
            return (
              <div key={region}>
                <div className="flex items-center gap-3">
                  <span className="section-num">{regionIndex + 1}</span>
                  <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">{regionLabel(region)}</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  <span className="text-[11px] text-slate-500">{cityPages.length} cities</span>
                </div>
                <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {cityPages.map((page) => (
                    <Link
                      key={page.slug}
                      href={`/resume/${page.slug}`}
                      className="group rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-blue-500/10"
                    >
                      <p className="text-sm font-bold text-white group-hover:text-blue-200">{job.name} Resume in {page.city.name}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">{page.city.country} · {page.city.pop}</p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section className="anim-fade-in-up mt-12">
          <div className="glass-panel hairline rounded-3xl p-6 text-center md:p-8">
            <h2 className="text-xl font-black text-white">Don&apos;t see your city?</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
              These {pages.length} city guides are just the start — the studio works for any location in the world in under 5 minutes.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {RESUME_CITIES.slice(0, 8).map((city) => (
                <Link key={city.name} href={cityHubHref(city)} className="premium-chip">{city.name}</Link>
              ))}
            </div>
            <Link href={studioHref(job)} className="btn-primary mt-6 inline-block rounded-xl px-7 py-3 text-sm font-bold text-white">Build My {job.name} Resume Now →</Link>
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