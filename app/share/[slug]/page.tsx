"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ResumePreview } from "../../components/ResumePreview";
import type { ResumeData } from "../../types";

interface ResumePayload {
  resume: ResumeData;
  templateId: string;
}
interface CoverPayload {
  coverLetter: string;
}
type DocumentPayload = ResumePayload | CoverPayload;

export default function SharePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug as string;
  const [doc, setDoc] = useState<DocumentPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: fetchError } = await supabase
        .from("shared_resumes")
        .select("data")
        .eq("slug", slug)
        .maybeSingle();
      if (cancelled) return;
      setLoading(false);
      if (fetchError || !data) {
        setError("This shared document could not be found.");
        return;
      }
      const record = data as { data: unknown };
      const object = record.data && typeof record.data === "object" ? (record.data as Record<string, unknown>) : {};
      const document = object.document;
      const value = document && typeof document === "object" ? (document as Record<string, unknown>) : {};

      if (typeof value.coverLetter === "string") {
        setDoc({ coverLetter: value.coverLetter });
      } else if (value.resume && typeof value.resume === "object") {
        setDoc({ resume: value.resume as ResumeData, templateId: typeof value.templateId === "string" ? value.templateId : "ats" });
      } else {
        setError("This shared document is missing its content.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <main className="min-h-screen theme-bg theme-text">
      <div className="mx-auto max-w-[900px] px-4 py-8">
        <header className="glass-panel hairline mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="logo-tile"><span className="text-sm font-black text-white">CV</span></div>
            <div>
              <p className="text-sm font-bold tracking-[0.16em] text-white">SHARED DOCUMENT</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">resume.studio/{slug}</p>
            </div>
          </div>
          <Link href="/" className="btn-ghost rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-blue-300 transition hover:bg-blue-500/10">Build Yours →</Link>
        </header>

        {loading && (
          <div className="glass-panel hairline rounded-2xl p-10 text-center text-sm text-slate-400">
            <span className="typing-dot inline-block" /><span className="typing-dot inline-block" /><span className="typing-dot inline-block" />
            <span className="ml-2">Loading shared document…</span>
          </div>
        )}

        {error && (
          <div className="glass-panel hairline rounded-2xl p-10 text-center">
            <p className="text-lg font-bold text-white">Document not found</p>
            <p className="mt-2 text-sm text-slate-400">{error}</p>
            <Link href="/" className="btn-primary mt-6 inline-block rounded-xl px-6 py-3 text-sm font-bold text-white">Back to Studio</Link>
          </div>
        )}

        {doc && "resume" in doc && (
          <div className="anim-scale-in overflow-hidden rounded-2xl bg-white shadow-[0_50px_100px_-50px_rgba(0,0,0,0.9)] ring-1 ring-black/20">
            <ResumePreview data={doc.resume} templateId={doc.templateId} />
          </div>
        )}

        {doc && "coverLetter" in doc && (
          <div className="anim-scale-in overflow-hidden rounded-2xl bg-white p-8 sm:p-12 shadow-[0_50px_100px_-50px_rgba(0,0,0,0.9)] ring-1 ring-black/20">
            <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-8 text-[#111827]" dangerouslySetInnerHTML={{ __html: doc.coverLetter.replace(/\n/g, "<br/>") }} />
          </div>
        )}
      </div>
    </main>
  );
}
