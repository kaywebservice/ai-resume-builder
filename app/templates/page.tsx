import Link from "next/link";
import { resumeThemes, type ResumeTheme } from "../templates";
import { SAMPLE_RESUME } from "../sampleResume";
import { ResumePreview } from "../components/ResumePreview";
import "../globals.css";

export const metadata = {
  title: "Resume Templates — AI Resume Builder",
  description: "Browse 50 ATS-friendly templates. Classic and premium designs for every role.",
};

const STANDARD = resumeThemes.filter((t: ResumeTheme) => !t.premium);
const PREMIUM = resumeThemes.filter((t: ResumeTheme) => t.premium);

export default function TemplatesPage() {
  const list = (themes: ResumeTheme[], locked: boolean) =>
    themes.map((theme: ResumeTheme) => (
      <Link
        key={theme.id}
        href={`/t/${theme.id}`}
        className="group relative block rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-white/20 hover:bg-white/[0.06]"
      >
        <div className="h-56 w-full overflow-hidden rounded-xl border border-white/5 bg-white shadow-[0_2px_12px_-4px_rgba(0,0,0,0.35)]">
          <div className="h-24 w-full overflow-hidden rounded-t-xl" style={{ background: theme.headerBg, color: theme.headerText }} />
          <div className="p-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: theme.accent }}>{theme.name}</p>
          </div>
        </div>
        {locked && (
          <span className="absolute top-2 right-2 rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 ring-1 ring-amber-400/40">PRO</span>
        )}
      </Link>
    ));

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b16] text-slate-200">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="aurora aurora-blue -left-40 -top-32 h-[34rem] w-[34rem]" />
        <div className="aurora aurora-violet -right-48 top-80 h-[38rem] w-[38rem]" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.55) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-12">
        <header className="glass-panel hairline mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="logo-tile"><span className="text-sm font-black tracking-tight text-white">CV</span></div>
            <div>
              <p className="text-sm font-bold tracking-[0.16em] text-white">AI RESUME BUILDER</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Templates</p>
            </div>
          </div>
          <Link href="/" className="btn-ghost rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-blue-300">Studio →</Link>
        </header>

        <section className="anim-fade-in-up">
          <p className="eyebrow">50 Designs</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">
            50 ATS-Optimized <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent">Resume Templates</span>.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
            Every template passes a real applicant-tracking system. Standard templates are free; PRO templates unlock all 30 premium layouts + live preview.
          </p>
        </section>

        <h2 className="mt-10 text-sm font-bold uppercase tracking-[0.26em] text-white">Standard (Free)</h2>
        <div className="mt-5 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {list(STANDARD, false)}
        </div>

        <h2 className="mt-12 text-sm font-bold uppercase tracking-[0.26em] text-white">Premium (PRO)</h2>
        <div className="mt-5 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {list(PREMIUM, true)}
        </div>

        <div className="mt-14 border-t border-white/5 pt-8 text-center">
          <p className="text-sm text-slate-400">Need a custom layout? Email Kaywebservice — new templates ship every quarter.</p>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
        <Link
          href="/"
          className="glass-panel hairline flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] transition hover:-translate-y-0.5"
        >
          <span role="img" aria-label="build">✦</span> Build yours in the studio
        </Link>
      </div>

      {/* live demo preview pinned to the bottom corner on wide screens */}
      <div className="pointer-events-none absolute bottom-[-2rem] right-[-3rem] hidden xl:block xl:w-[26rem] xl:opacity-40">
        <ResumePreview data={SAMPLE_RESUME} templateId="violet" />
      </div>
    </main>
  );
}
