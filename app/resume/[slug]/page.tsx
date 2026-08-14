import type { Metadata } from "next";
import Link from "next/link";
import {
  ALL_RESUME_PAGES,
  RESUME_PAGE_COUNT,
  SITE_URL,
  findResumePage,
  relatedResumeLinks,
  marketParagraph,
  buildFaqs,
  buildJsonLd,
  jobPlural,
  categoryLabel,
  jobHubHref,
  cityHubHref,
  studioHref,
} from "@/lib/resume/content";
import { ResumeQuoteForm } from "./ResumeQuoteForm";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_RESUME_PAGES.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = findResumePage(slug);
  if (!page) return { title: "Not found" };
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `${SITE_URL}/resume/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `${SITE_URL}/resume/${page.slug}`,
      type: "website",
      siteName: "AI Resume Builder",
    },
  };
}

export default async function ResumeLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = findResumePage(slug);
  if (!page) return null;

  const { job, city } = page;
  const faqs = buildFaqs(job, city);
  const related = relatedResumeLinks(page);
  const jsonLd = buildJsonLd(page);
  const plural = jobPlural(job);
  const jobCount = ALL_RESUME_PAGES.filter((candidate) => candidate.job.id === job.id).length;

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
              <p className="text-sm font-bold tracking-[0.16em] text-white">AI RESUME BUILDER</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{job.name} · Global</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/seo" className="btn-ghost rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-blue-300 transition hover:bg-blue-500/10">Services</Link>
            <Link href="/resume" className="premium-chip cursor-pointer">All {RESUME_PAGE_COUNT} Pages</Link>
          </div>
        </header>

        <nav aria-label="Breadcrumb" className="mt-6 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
          <Link href="/" className="transition hover:text-slate-300">Home</Link>
          <span>/</span>
          <Link href="/resume" className="transition hover:text-slate-300">Resume Pages</Link>
          <span>/</span>
          <Link href={jobHubHref(job)} className="transition hover:text-slate-300">{job.name}</Link>
          <span>/</span>
          <span className="text-slate-300">{city.name}</span>
        </nav>

        <section className="anim-slide-in-left mt-8">
          <p className="eyebrow">{city.country} · {categoryLabel(job)}</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black leading-[1.08] tracking-tight text-white md:text-5xl">
            {job.name} Resume in <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent">{city.name}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
            {job.summary} Build yours free in about 5 minutes — ATS-optimized, tailored to {city.name} employers, and ready to download the moment you finish.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <span className="stat-chip"><b>{city.pop}</b> Local Market</span>
            <span className="stat-chip"><b>50+</b> Templates</span>
            <span className="stat-chip"><b>ATS</b> Score in Seconds</span>
            <span className="stat-chip"><b>5 Min</b> To Finish</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={studioHref(job)} className="btn-primary rounded-xl px-6 py-3 text-sm font-bold text-white">Build My {job.name} Resume →</Link>
            <Link href={jobHubHref(job)} className="btn-ghost rounded-xl px-5 py-3 text-xs font-bold text-blue-300 transition hover:bg-blue-500/10">All {jobCount} City Pages</Link>
          </div>
        </section>

        <section className="anim-slide-in-right mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]" style={{ animationDelay: "0.08s" }}>
          <div className="glass-panel hairline rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="section-num">01</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">What Every {job.name} Resume Needs</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Recruiters and ATS bots scan for the same things: the right keywords, measurable achievements, and a clean structure. These are the keywords {plural.toLowerCase()} should have on page one for {city.name} roles:
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {job.keywords.map((keyword) => (
                <span key={keyword} className="premium-chip">{keyword}</span>
              ))}
            </div>
            <ul className="mt-5 space-y-2">
              {job.skills.map((skill) => (
                <li key={skill} className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-2.5 text-sm leading-relaxed text-slate-300">✓ {skill}</li>
              ))}
            </ul>

            <div className="mt-8 flex items-center gap-3">
              <span className="section-num">02</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Bullet Points That Pass ATS</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="mt-4 space-y-3">
              {job.bullets.map((bullet) => (
                <div key={bullet.label} className="rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">{bullet.label}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{bullet.example}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              Every bullet starts with a verb, adds a number, and proves impact — the pattern ATS scoring and human recruiters both reward.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <span className="section-num">03</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">The {city.name} Job Market</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              {marketParagraph(job, city)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {city.industries.map((industry) => (
                <span key={industry} className="premium-chip">{industry}</span>
              ))}
              <span className="premium-chip">{city.university}</span>
              <span className="premium-chip">{city.landmarks[0]}</span>
            </div>

            <div className="mt-8 flex items-center gap-3">
              <span className="section-num">04</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Cover Letter Tip</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <p className="mt-4 rounded-2xl border border-blue-400/20 bg-blue-500/10 px-5 py-4 text-sm leading-relaxed text-slate-300">
              {job.coverTip}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              The studio writes the matching cover letter for you — one click, tailored to the same {job.name} role.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <span className="section-num">05</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Pricing — Use It Free</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Free</p>
                <p className="mt-2 text-3xl font-black text-blue-200">$0</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-400">Build, edit &amp; download. Resume and cover letter generation included.</p>
              </div>
              <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">PRO · One-Time</p>
                <p className="mt-2 text-3xl font-black text-violet-200">$14.99</p>
                <p className="mt-1 text-[11px] leading-snug text-slate-400">All premium templates, full ATS scoring &amp; unlimited exports. PRO+ at $29.99.</p>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="glass-panel hairline rounded-3xl p-6">
              <p className="eyebrow">Free Quote</p>
              <h2 className="mt-2 text-lg font-bold text-white">Need a hand with your {job.name} resume in {city.name}?</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-400">
                For a professional rewrite, cover letter, or portfolio site — tell me about your role and I reply within 24 hours.
              </p>
              <ResumeQuoteForm jobName={job.name} cityName={city.name} />
            </div>

            <div className="glass-panel hairline rounded-3xl p-6">
              <p className="eyebrow">Related Resumes</p>
              <h2 className="mt-2 text-lg font-bold text-white">Explore {job.name} & Nearby</h2>
              <ul className="mt-4 space-y-2">
                {related.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-blue-300 transition hover:text-blue-200">
                      {link.label} →
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={jobHubHref(job)} className="premium-chip">All {job.name} Pages</Link>
                <Link href={cityHubHref(city)} className="premium-chip">All Jobs in {city.name}</Link>
              </div>
            </div>
          </aside>
        </section>

        <section className="anim-fade-in-up mt-10" style={{ animationDelay: "0.12s" }}>
          <div className="glass-panel hairline rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-3">
              <span className="section-num">06</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Frequently Asked Questions</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="mt-5 space-y-4">
              {faqs.map((faq) => (
                <details key={faq.q} className="group rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4">
                  <summary className="cursor-pointer list-none text-sm font-bold text-white">
                    <span className="mr-2 inline-block text-blue-300 transition group-open:rotate-90">›</span>
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
              <span className="section-num">07</span>
              <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Your Resume, Built Right</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
                <p className="text-sm font-bold text-white">AI Writing Help</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">Generate bullets and summaries tailored to your exact role — no blank-page panic.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
                <p className="text-sm font-bold text-white">Instant ATS Scoring</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">Know your score before employers do, with fixes for every weak section.</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4">
                <p className="text-sm font-bold text-white">PDF &amp; Word Export</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">Download a perfectly formatted resume in seconds, from {city.name} or anywhere.</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6">
              <p className="text-xs leading-relaxed text-slate-400">
                From Kaykay Wise — Senior Full-Stack Engineer &amp; SaaS Founder, built for job seekers in {city.name} and worldwide. Use every tool free; upgrade once to unlock all premium templates and ATS scoring.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={studioHref(job)} className="btn-primary rounded-xl px-5 py-2.5 text-xs font-bold text-white">Build My Resume Now →</Link>
                <Link href="/portfolio" className="btn-ghost rounded-xl px-5 py-2.5 text-xs font-bold text-blue-300 transition hover:bg-blue-500/10">Portfolio</Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 border-t border-white/5 py-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
            © 2026 <span className="font-bold text-slate-300">Kaywebservice Enterprise Solutions</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
            <Link href="/resume" className="transition hover:text-slate-300">All {RESUME_PAGE_COUNT} Resume Pages</Link>
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