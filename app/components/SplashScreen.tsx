"use client";

export function SplashScreen() {
  return (
    <div
      aria-live="polite"
      aria-label="Loading AI Resume Builder"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#070b16] px-6"
    >
      <div className="aurora pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.55) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      <div className="relative w-full max-w-md text-center text-white anim-fade-in-up">
        <div className="anim-float-slow mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-[1.4rem] border border-blue-400/25 bg-gradient-to-br from-blue-500/25 via-blue-600/10 to-transparent shadow-2xl shadow-blue-950/60 backdrop-blur-md">
          <span className="auth-gradient auth-gradient-animated bg-clip-text text-3xl font-bold text-transparent">CV</span>
        </div>
        <p className="eyebrow">Resume Studio</p>
        <h1 className="mt-2 bg-gradient-to-br from-white via-blue-100 to-slate-400 bg-clip-text text-3xl font-black tracking-tight text-transparent">
          AI Resume Builder
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Preparing your professional workspace…
        </p>
        <div className="mx-auto mt-7 h-1.5 w-56 overflow-hidden rounded-full border border-white/10 bg-white/[0.06]">
          <div className="skeleton-shimmer h-full w-full rounded-full" />
        </div>
        <p className="mt-8 text-sm font-semibold text-slate-300">
          Designed by <span className="auth-gradient bg-clip-text font-bold text-transparent">Kaywebservice</span> Enterprise Solutions
        </p>
      </div>
    </div>
  );
}