"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { resumeThemes, getTheme, type ResumeTheme } from "../../templates";
import { SAMPLE_RESUME } from "../../sampleResume";
import { ResumePreview } from "../../components/ResumePreview";
import { trackEvent } from "@/lib/track";

export default function TemplatePreview() {
  const router = useRouter();
  const params = useParams();
  const initial = typeof params.id === "string" ? params.id : "ats";
  const theme = getTheme(initial) || resumeThemes[0];
  const [selected, setSelected] = useState(theme.id);
  const chosen: ResumeTheme = getTheme(selected) || theme;

  const useInStudio = () => {
    localStorage.setItem("selected-template", chosen.id);
    trackEvent("viewed_template", { template: chosen.id });
    router.push("/?template=" + chosen.id);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b16] text-slate-200">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="aurora aurora-blue -left-40 -top-32 h-[34rem] w-[34rem]" />
        <div className="aurora aurora-violet -right-48 top-80 h-[38rem] w-[38rem]" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.55) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-8">
        <header className="glass-panel hairline mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="logo-tile"><span className="text-sm font-black tracking-tight text-white">CV</span></div>
            <div>
              <p className="text-sm font-bold tracking-[0.16em] text-white">Template Preview</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">{chosen.name}</p>
            </div>
          </div>
          <button type="button" onClick={useInStudio} className="btn-primary rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5">
            Use in Studio →
          </button>
        </header>

        <div className="mb-6">
          <label className="m-label" htmlFor="tpl">Choose another design</label>
          <select id="tpl" value={selected} onChange={(e) => setSelected(e.target.value)} className="input-lux">
            {resumeThemes.map((t: ResumeTheme) => (
              <option key={t.id} value={t.id}>{t.name}{t.premium ? " · PRO" : ""}</option>
            ))}
          </select>
        </div>

        <div className="doc-window hairline anim-scale-in max-h-[860px] w-full overflow-auto rounded-3xl">
          <div className="flex items-center gap-3 border-b border-white/5 bg-white/[0.03] px-5 py-3">
            <span className="doc-dot" /><span className="doc-dot" /><span className="doc-dot" />
            <span className="doc-url">resume.studio/t/{chosen.id}{chosen.premium ? " ◆ PRO" : ""}</span>
          </div>
          <div className="p-5 sm:p-7">
            <div className="overflow-hidden rounded-xl bg-white shadow-[0_50px_100px_-50px_rgba(0,0,0,0.9)] ring-1 ring-black/20">
              <ResumePreview data={SAMPLE_RESUME} templateId={chosen.id} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
