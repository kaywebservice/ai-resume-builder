import Link from "next/link";
import { ALL_PAGES, PAGE_COUNT, regionLabel } from "@/lib/seo/content";
import { SEO_SERVICES } from "@/lib/seo/services";

const REGION_ORDER = ["usa", "canada", "uk-ireland", "europe", "australasia", "asia-middleeast", "africa", "latam"];

export const metadata = {
  title: "Website & SEO Services Worldwide — 500 Service Pages | Kaywebservice",
  description:
    "Web design, e-commerce, SEO, AI & SaaS development and WordPress services in 100 cities across the US, Canada, Europe, Australia and worldwide. Free quotes in 24 hours.",
};

export default function SeoIndexPage() {
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
              <p className="text-sm font-bold tracking-[0.16em] text-white">KAYWEBSERVICE</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Services Worldwide</p>
            </div>
          </div>
          <Link href="/portfolio" className="btn-ghost rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-blue-300 transition hover:bg-blue-500/10">Portfolio</Link>
        </header>

        <section className="anim-slide-in-left mt-10 text-center">
          <p className="eyebrow">Programmatic SEO</p>
          <h1 className="mx-auto mt-3 max-w-3xl text-3xl font-black leading-[1.08] tracking-tight text-white md:text-5xl">
            {PAGE_COUNT} Local Service Pages — <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent">One Global Studio</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
            Web design, e-commerce, SEO, AI &amp; SaaS development and WordPress services in 100 cities worldwide.
            Every page is unique — with local market facts, city-specific FAQs, and fixed pricing. Free quotes in 24 hours.
          </p>
        </section>

        <section className="mt-12 space-y-10">
          {REGION_ORDER.map((region, regionIndex) => {
            const pages = ALL_PAGES.filter((page) => page.city.region === region);
            if (pages.length === 0) return null;
            return (
              <div key={region}>
                <div className="flex items-center gap-3">
                  <span className="section-num">{regionIndex + 1}</span>
                  <h2 className="text-xs font-bold uppercase tracking-[0.26em] text-white">{regionLabel(region)}</h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                  <span className="text-[11px] text-slate-500">{pages.length} pages</span>
                </div>
                <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {pages.map((page) => (
                    <Link
                      key={page.slug}
                      href={`/seo/${page.slug}`}
                      className="group rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-blue-500/10"
                    >
                      <p className="text-sm font-bold text-white group-hover:text-blue-200">{page.service.name} in {page.city.name}</p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500">{page.city.country} · from {page.service.price}</p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section className="anim-fade-in-up mt-12">
          <div className="glass-panel hairline rounded-3xl p-6 text-center md:p-8">
            <h2 className="text-xl font-black text-white">Don&apos;t see your city or service?</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-slate-400">
              I work with clients everywhere — these {PAGE_COUNT} pages are just the beginning. Tell me what you need.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {SEO_SERVICES.map((service) => (
                <Link key={service.id} href="/portfolio" className="premium-chip">{service.name}</Link>
              ))}
            </div>
            <Link href="/portfolio" className="btn-primary mt-6 inline-block rounded-xl px-7 py-3 text-sm font-bold text-white">Get a Free Quote →</Link>
          </div>
        </section>

        <footer className="mt-10 border-t border-white/5 py-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
            © 2026 <span className="font-bold text-slate-300">Kaywebservice Enterprise Solutions</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
            <Link href="/portfolio" className="transition hover:text-slate-300">Portfolio</Link>
            <span className="text-slate-700">·</span>
            <Link href="/" className="transition hover:text-slate-300">Studio</Link>
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