import Link from "next/link";
import {
  RESUME_CITIES,
  RESUME_PAGE_COUNT,
  jobHubHref,
  cityHubHref,
} from "@/lib/resume/content";
import { JOBS, JOB_CATEGORIES } from "@/lib/resume/jobs";

export const metadata = {
  title: `Resume Examples for ${JOBS.length}+ Jobs in ${RESUME_CITIES.length} Cities — ${RESUME_PAGE_COUNT} Guides | AI Resume Builder`,
  description:
    `Browse ${RESUME_PAGE_COUNT} ATS-optimized resume guides across ${RESUME_CITIES.length} cities worldwide. Free templates, AI writing help, instant ATS scoring, and premium unlocks from $14.99.`,
};

export default function ResumeIndexPage() {
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
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Resume Guides Worldwide</p>
            </div>
          </div>
          <Link href="/" className="btn-primary rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white">Open the Studio →</Link>
        </header>

        <section className="anim-slide-in-left mt-10 text-center">
          <p className="eyebrow">Programmatic SEO · Job Seekers</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-[1.08] tracking-tight text-white md:text-5xl">
            {RESUME_PAGE_COUNT} Resume Guides — <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent">{JOBS.length} Jobs in {RESUME_CITIES.length} Cities</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
            Every guide is unique — city-specific keywords, local job-market advice, and bullet examples that pass ATS screening. Build your resume free in about 5 minutes; upgrade once for all premium templates and full ATS scoring.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary rounded-xl px-7 py-3 text-sm font-bold text-white">Build My Resume Free →</Link>
            <span className="premium-chip">{RESUME_PAGE_COUNT} Pages · 50+ Templates</span>
          </div>
        </section>

        <section className="mt-12 space-y-10">
          {JOB_CATEGORIES.map((category, categoryIndex) => {
            const jobs = JOBS.filter((job) => job.category === category.id);
            return (
              <div key={category.id}>
                <div className="flex items-center gap-3">
                  <span className="section-num">{categoryIndex + 1}</span>
                  <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">{category.label}</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  <span className="text-[11px] text-slate-500">{jobs.length} jobs × {RESUME_CITIES.length} cities</span>
                </div>
                <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {jobs.map((job) => (
                    <Link
                      key={job.id}
                      href={jobHubHref(job)}
                      className="group rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-blue-500/10"
                    >
                      <p className="text-sm font-bold text-white group-hover:text-blue-200">{job.name} Resumes</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">All {RESUME_CITIES.length} cities · ATS-optimized</p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section className="anim-fade-in-up mt-12">
          <div className="glass-panel hairline rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="section-num">{JOB_CATEGORIES.length + 1}</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Browse by City</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
              {RESUME_CITIES.map((city) => (
                <Link
                  key={city.name}
                  href={cityHubHref(city)}
                  className="group rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-blue-500/10"
                >
                  <p className="text-sm font-bold text-white group-hover:text-blue-200">Resumes in {city.name}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">{city.country} · {city.pop}</p>
                </Link>
              ))}
            </div>
            <div className="mt-6 border-t border-white/5 pt-6">
              <p className="text-sm text-slate-300">Also need design, development, or SEO services? Explore the <Link href="/seo" className="text-blue-300 underline underline-offset-2 transition hover:text-blue-200">worldwide service pages</Link>.</p>
            </div>
          </div>
        </section>

        <section className="anim-fade-in-up mt-10">
          <div className="glass-panel hairline rounded-3xl p-6 text-center md:p-8">
            <h2 className="text-xl font-black text-white">Don&apos;t see your job or city?</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
              The studio works for any role in any location — these {RESUME_PAGE_COUNT} guides are just the beginning.
            </p>
            <Link href="/" className="btn-primary mt-5 inline-block rounded-xl px-7 py-3 text-sm font-bold text-white">Start Building Free →</Link>
          </div>
        </section>

        <footer className="mt-10 border-t border-white/5 py-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
            © 2026 <span className="font-bold text-slate-300">Kaywebservice Enterprise Solutions</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
            <Link href="/" className="transition hover:text-slate-300">Studio</Link>
            <span className="text-slate-700">·</span>
            <Link href="/seo" className="transition hover:text-slate-300">Service Pages</Link>
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