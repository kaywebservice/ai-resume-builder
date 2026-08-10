"use client";

import Link from "next/link";
import { useEffect, useState, type ChangeEvent } from "react";
import jsPDF from "jspdf";
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { ResumePreview, type SectionId } from "./components/ResumePreview";
import { SplashScreen } from "./components/SplashScreen";
import { CheckoutModal } from "./components/CheckoutModal";
import { ThemeToggle } from "./components/ThemeToggle";
import { trackEvent } from "@/lib/track";
import { resumeThemes, getTheme } from "./templates";
import { useDrafts } from "@/lib/useDrafts";
import type { AtsResult, Certification, Education, Experience, Language, Project, ResumeData, ResumeFormData } from "./types";

const emptyForm: ResumeFormData = {
  fullName: "", jobTitle: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "",
  twitter: "", instagram: "", facebook: "",
  summary: "", experience: "", education: "", skills: "", certifications: "", achievements: "", languages: "", projects: "", targetJob: "", jobDescription: "", language: "English",
};

const SECTION_LABELS: Record<SectionId, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  certifications: "Certifications",
  achievements: "Achievements",
  languages: "Languages",
  projects: "Projects",
};

const DEFAULT_ORDER: SectionId[] = ["summary", "experience", "education", "certifications", "achievements", "languages", "projects"];

const LANGUAGES = ["English", "French", "German", "Spanish", "Portuguese", "Arabic", "Dutch", "Yoruba", "Igbo", "Hausa", "Swahili"];

const STRONG_VERBS = /\b(led|built|created|designed|developed|managed|launched|improved|increased|reduced|automated|delivered|spearheaded|established|implemented|introduced|optimized|optimised|drove|scaled|engineered|streamlined)\b/i;
const WEAK_PATTERNS = /\b(was responsible for|worked on|helped|assisted|participated in|did some|was in charge|made sure|tried to)\b/i;

function scoreBullets(text: string) {
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return { score: 0, weak: [] as string[] };
  const weak = lines.filter((line) => WEAK_PATTERNS.test(line) || line.length > 150);
  const strong = lines.filter((line) => STRONG_VERBS.test(line));
  const score = Math.max(0, Math.min(100, Math.round(35 + (strong.length / lines.length) * 55 - weak.length * 12)));
  return { score, weak };
}

const initialResume: ResumeData = {
  name: "", title: "", summary: "", skills: [], experience: [], education: [], certifications: [], achievements: [], languages: [], projects: [],
};

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeResume(value: unknown, form: ResumeFormData): ResumeData {
  const candidate = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const skills = asArray(candidate.skills).map(asString).filter(Boolean);
  const experience: Experience[] = asArray(candidate.experience).map((item) => {
    const job = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return {
      company: asString(job.company), role: asString(job.role), description: asString(job.description),
      startDate: asString(job.startDate) || undefined, endDate: asString(job.endDate) || undefined,
      accomplishments: asArray(job.accomplishments).map(asString).filter(Boolean),
    };
  }).filter((item) => item.company || item.role || item.description);
  const education: Education[] = asArray(candidate.education).map((item) => {
    const entry = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return { institution: asString(entry.institution), degree: asString(entry.degree) || undefined, year: asString(entry.year) || undefined };
  }).filter((item) => item.institution || item.degree || item.year);
  const certifications: Certification[] = asArray(candidate.certifications).map((item) => {
    const entry = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return { name: asString(entry.name), issuer: asString(entry.issuer) || undefined };
  }).filter((item) => item.name || item.issuer);
  const achievements = asArray(candidate.achievements).map(asString).filter(Boolean);
  const languages: Language[] = asArray(candidate.languages).map((item) => {
    const entry = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return { name: asString(entry.name), proficiency: asString(entry.proficiency) || undefined };
  }).filter((item) => item.name);
  const projects: Project[] = asArray(candidate.projects).map((item) => {
    const entry = item && typeof item === "object" ? item as Record<string, unknown> : {};
    return { title: asString(entry.title), description: asString(entry.description) || undefined, link: asString(entry.link) || undefined };
  }).filter((item) => item.title || item.description);

  return {
    name: asString(candidate.name) || form.fullName,
    title: asString(candidate.title) || form.jobTitle,
    email: form.email,
    phone: form.phone,
    location: form.location,
    linkedin: asString(candidate.linkedin) || form.linkedin,
    github: asString(candidate.github) || form.github,
    website: asString(candidate.website) || form.website,
    twitter: asString(candidate.twitter) || form.twitter,
    instagram: asString(candidate.instagram) || form.instagram,
    facebook: asString(candidate.facebook) || form.facebook,
    summary: asString(candidate.summary) || form.summary,
    skills,
    experience,
    education,
    certifications,
    achievements,
    languages,
    projects,
  };
}

function safeFileName(name: string) {
  return (name || "Resume").replace(/[\\/:*?"<>|]/g, "-").trim() || "Resume";
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"resume" | "cover">("resume");
  const [form, setForm] = useState<ResumeFormData>(emptyForm);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("ats");
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("");
  const [showSplash, setShowSplash] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ats, setAts] = useState<AtsResult | null>(null);
  const [draftText, setDraftText] = useState("");
  const [showDraftImport, setShowDraftImport] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [usedTailored, setUsedTailored] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(DEFAULT_ORDER);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [shareStatus, setShareStatus] = useState("");
  const drafts = useDrafts();

  useEffect(() => {
    const premium = localStorage.getItem("premium-unlocked") === "true";
    setIsPremiumUnlocked(premium);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tpl = params.get("template");
    if (tpl && resumeThemes.some((t) => t.id === tpl)) {
      const theme = resumeThemes.find((t) => t.id === tpl)!;
      if (theme.premium && !isPremiumUnlocked) return;
      setSelectedTemplate(tpl);
    }
    const stored = localStorage.getItem("selected-template");
    if (stored && resumeThemes.some((t) => t.id === stored)) {
      const theme = resumeThemes.find((t) => t.id === stored)!;
      if (!theme.premium || isPremiumUnlocked) setSelectedTemplate(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremiumUnlocked]);

  useEffect(() => {
    const saved = localStorage.getItem("resume-draft");
    if (saved) {
      try {
        const parsed: unknown = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setForm((current) => ({ ...current, ...(parsed as Partial<ResumeFormData>) }));
        }
      } catch {
        // ignore corrupt drafts
      }
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem("resume-draft", JSON.stringify(form));
      } catch {
        // storage full — ignore
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [form]);

  const handleUnlock = () => {
    setIsPremiumUnlocked(true);
    localStorage.setItem("premium-unlocked", "true");
    setShowCheckout(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 5000);
    return () => window.clearTimeout(timer);
  }, []);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const buildPrompt = () => {
    const tailors = form.jobDescription.trim() !== "";
    const hasDraft = draftText.trim() !== "";
    return `
Create a professional ATS-friendly resume written entirely in ${form.language}.${tailors ? ` Tailor the resume specifically for the job posting below, prioritizing the skills and responsibilities it calls for.` : ""}${hasDraft ? ` The "Old Resume Draft" below is the user's existing resume: rewrite and upgrade it — keep every fact true, improve structure, wording and action verbs.` : ""} Return only the JSON object described in your instructions.

    Name: ${form.fullName}
Professional Title: ${form.jobTitle}
Email: ${form.email}
Phone: ${form.phone}
Location: ${form.location}
LinkedIn: ${form.linkedin}
GitHub: ${form.github}
Website: ${form.website}
Twitter: ${form.twitter}
Instagram: ${form.instagram}
Facebook: ${form.facebook}
Professional Summary: ${form.summary}
Work Experience: ${form.experience}
Education: ${form.education}
Skills: ${form.skills}
Certifications: ${form.certifications}
Achievements: ${form.achievements}
Languages: ${form.languages}
Projects: ${form.projects}
Target Job: ${form.targetJob}
${tailors ? `Job Description:\n${form.jobDescription}` : ""}
${hasDraft ? `Old Resume Draft:\n${draftText}` : ""}
    `;
  };

  const moveSection = (from: number, to: number) => {
    setSectionOrder((current) => {
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  async function generateResume() {
    if (activeTab === "cover" && !form.jobDescription.trim()) {
      return setStatus("Paste a job description to tailor the cover letter.");
    }
    setIsGenerating(true);
    setStatus("");
    try {
      const endpoint = activeTab === "cover" ? "/api/cover-letter" : "/api/generate";
      const body: Record<string, unknown> =
        activeTab === "cover" ? { ...form } : { prompt: buildPrompt() };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload: unknown = await response.json();
      const bodyResp = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
      const result = asString(bodyResp.result);
      if (!response.ok) throw new Error(asString(bodyResp.error) || "The AI service could not generate a document.");
      if (!result) throw new Error("The AI service could not generate a document.");
      const parsed: unknown = JSON.parse(result);

      if (activeTab === "resume") {
        setResume(normalizeResume(parsed, form));
        const tailored = form.jobDescription.trim() !== "";
        setUsedTailored(tailored);
        setStatus(`Resume generated successfully.${tailored ? " (tailored to the job posting)" : ""}`);
        trackEvent(tailored ? "jd_targeted" : "generated", { template: selectedTemplate });
        if (draftText.trim() !== "") trackEvent("draft_imported", {});
      } else {
        const content = parsed && typeof parsed === "object" ? asString((parsed as Record<string, unknown>).content) : "";
        if (!content) throw new Error("The AI service returned an invalid cover letter.");
        setCoverLetter(content);
        setStatus("Cover letter generated successfully.");
        trackEvent("cover_generated", { tailored: !!form.jobDescription.trim() });
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function analyzeDocument() {
    if (activeTab === "cover") return analyzeCoverLetter();
    if (!resume) return setStatus("Please generate a resume first.");
    setIsAnalyzing(true);
    setStatus("");
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, jobDescription: form.jobDescription }),
      });
      const payload: unknown = await response.json();
      const body = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
      const result = asString(body.result);
      if (!response.ok) throw new Error(asString(body.error) || "The AI service could not analyze the resume.");
      if (!result) throw new Error("The AI service could not analyze the resume.");
      const parsed: unknown = JSON.parse(result);
      const object = parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {};
      const rawScore = Number(object.score);
      setAts({
        score: Number.isFinite(rawScore) ? Math.max(0, Math.min(100, Math.round(rawScore))) : 0,
        summary: asString(object.summary),
        matchedKeywords: asArray(object.matchedKeywords).map(asString).filter(Boolean),
        missingKeywords: asArray(object.missingKeywords).map(asString).filter(Boolean),
        suggestions: asArray(object.suggestions).map(asString).filter(Boolean),
      });
      setStatus("ATS analysis complete.");
      trackEvent("ats_checked", { score: Math.max(0, Math.min(100, Math.round(rawScore))) });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function analyzeCoverLetter() {
    if (!coverLetter) return setStatus("Please generate a cover letter first.");
    if (!form.jobDescription.trim()) return setStatus("Paste a job description to score the cover letter against it.");
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setStatus("");
    setTimeout(() => {
      const jd = form.jobDescription
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4);
      const text = coverLetter.toLowerCase();
      const unique = new Set<string>();
      const matched: string[] = [];
      const missing: string[] = [];
      for (const word of jd) {
        if (unique.has(word)) continue;
        unique.add(word);
        if (text.includes(word)) matched.push(word);
        else missing.push(word);
      }
      const percent = jd.length === 0 ? 0 : Math.round((unique.size - missing.length) / Math.max(1, unique.size) * 100);
      setAts({
        score: Math.max(0, Math.min(100, percent)),
        summary: `${matched.length} of ${unique.size} job keywords appear in your cover letter.`,
        matchedKeywords: matched.slice(0, 12),
        missingKeywords: missing.slice(0, 12),
        suggestions: missing.length
          ? [`Add ${missing.slice(0, 4).join(", ")} naturally into your letter.`]
          : ["Good keyword match. Keep it tailored to the role."],
      });
      setStatus("Cover letter ATS score complete.");
      trackEvent("ats_checked", { score: Math.max(0, Math.min(100, percent)), document: "cover" });
      setIsAnalyzing(false);
    }, 250);
  }

  async function downloadDOCX() {
    if (activeTab === "cover") {
      if (!coverLetter) return setStatus("Please generate a cover letter first.");
      const doc = new Document({ sections: [{ children: coverLetter.split(/\n\s*\n/).map((paragraph) => new Paragraph({ text: paragraph })) }] });
      saveAs(await Packer.toBlob(doc), `${safeFileName(form.fullName || "Cover Letter")}-cover-letter.docx`);
      return;
    }
    if (!resume) return setStatus("Please generate a resume first.");

    const theme = getTheme(selectedTemplate);
    const accent = theme.accent.replace("#", "");
    const contactLine = [resume.email, resume.phone, resume.location, resume.linkedin, resume.github, resume.website, resume.twitter, resume.instagram, resume.facebook].filter(Boolean).join(" | ");
    const doc = new Document({
      sections: [{ children: [
        new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: resume.name || "Your Name", bold: true, size: 34, color: accent })] }),
        new Paragraph({ children: [new TextRun({ text: resume.title || "", italics: true })] }),
        new Paragraph({ text: contactLine }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Professional Summary" }), new Paragraph({ text: resume.summary }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Skills" }),
        ...resume.skills.map((skill) => new Paragraph({ text: `• ${skill}` })),
        new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Experience" }),
        ...resume.experience.flatMap((job) => {
          const dateRange = [job.startDate, job.endDate].filter(Boolean).join(" — ");
          return [
            new Paragraph({ children: [new TextRun({ text: job.company, bold: true })] }),
            new Paragraph({ text: [job.role, dateRange].filter(Boolean).join(" | ") }),
            ...(job.description ? [new Paragraph({ text: job.description })] : []),
            ...(job.accomplishments ?? []).map((item) => new Paragraph({ text: `• ${item}` })),
          ];
        }),
        new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Education" }),
        ...resume.education.map((education) => new Paragraph({ text: [education.institution, education.degree, education.year].filter(Boolean).join(" — ") })),
        new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Certifications" }),
        ...resume.certifications.map((certification) => new Paragraph({ text: [certification.name, certification.issuer].filter(Boolean).join(" — ") })),
        ...(resume.languages?.length ? [new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Languages" }), ...resume.languages.map((language) => new Paragraph({ text: [language.name, language.proficiency].filter(Boolean).join(" — ") }))] : []),
        ...(resume.projects?.length ? [new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Projects" }), ...resume.projects.flatMap((project) => [new Paragraph({ children: [new TextRun({ text: project.title, bold: true })] }), new Paragraph({ text: [project.description, project.link].filter(Boolean).join(" — ") })])] : []),
        ...(resume.achievements?.length ? [new Paragraph({ heading: HeadingLevel.HEADING_1, text: "Achievements" }), ...resume.achievements.map((achievement) => new Paragraph({ text: `• ${achievement}` }))] : []),
      ] }],
    });
    saveAs(await Packer.toBlob(doc), `${safeFileName(resume.name)}.docx`);
    trackEvent("downloaded_docx", { template: selectedTemplate });
  }

  function downloadPDF() {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageHeight = 280;
    let y = 18;
    const write = (text: string, size = 11, bold = false, indent = 20) => {
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(size);
      const lines = pdf.splitTextToSize(text, 170 - (indent - 20));
      if (y + lines.length * 5.5 > pageHeight) { pdf.addPage(); y = 18; }
      pdf.text(lines, indent, y); y += lines.length * 5.5 + 3;
    };
    if (activeTab === "cover") {
      if (!coverLetter) return setStatus("Please generate a cover letter first.");
      coverLetter.split(/\n\s*\n/).forEach((paragraph) => write(paragraph, 11));
      pdf.save(`${safeFileName(form.fullName || "Cover Letter")}-cover-letter.pdf`);
      return;
    }
    if (!resume) return setStatus("Please generate a resume first.");
    const theme = getTheme(selectedTemplate);
    pdf.setTextColor(theme.accent);
    write(resume.name || "Your Name", 22, true);
    write(resume.title, 13);
    pdf.setTextColor("#111827");
    write([resume.email, resume.phone, resume.location, resume.linkedin, resume.github, resume.website, resume.twitter, resume.instagram, resume.facebook].filter(Boolean).join(" | "), 10);
    const section = (title: string) => { y += 2; pdf.setTextColor(theme.accent); write(title, 14, true); pdf.setTextColor("#111827"); };
    if (resume.summary) { section("Professional Summary"); write(resume.summary); }
    if (resume.skills.length) { section("Skills"); write(resume.skills.join(" • ")); }
    if (resume.experience.length) { section("Experience"); resume.experience.forEach((job) => { const dateRange = [job.startDate, job.endDate].filter(Boolean).join(" — "); write(`${job.role}${job.company ? ` — ${job.company}` : ""}${dateRange ? ` (${dateRange})` : ""}`, 11, true); if (job.description) write(job.description); (job.accomplishments ?? []).forEach((item) => write(`• ${item}`, 10)); }); }
    if (resume.education.length) { section("Education"); resume.education.forEach((education) => write([education.institution, education.degree, education.year].filter(Boolean).join(" — "))); }
    if (resume.certifications.length) { section("Certifications"); resume.certifications.forEach((certification) => write([certification.name, certification.issuer].filter(Boolean).join(" — "))); }
    if (resume.languages?.length) { section("Languages"); resume.languages.forEach((language) => write([language.name, language.proficiency].filter(Boolean).join(" — "))); }
    if (resume.projects?.length) { section("Projects"); resume.projects.forEach((project) => write([project.title, project.description, project.link].filter(Boolean).join(" — "), 11, true)); }
    if (resume.achievements?.length) { section("Achievements"); resume.achievements.forEach((achievement) => write(`• ${achievement}`)); }
    pdf.save(`${safeFileName(resume.name)}.pdf`);
    trackEvent("downloaded_pdf", { template: selectedTemplate });
  }

  async function shareResume() {
    if (activeTab === "cover" ? !coverLetter : !resume) return setStatus("Please generate a document first.");
    setShareStatus("Creating share link…");
    try {
      const document = activeTab === "cover" ? { coverLetter, form } : { resume, templateId: selectedTemplate };
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: { document } }),
      });
      const payload: unknown = await response.json();
      const body = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
      if (!response.ok || body.success !== true) throw new Error(asString(body.error) || "Could not create share link.");
      const url = `${window.location.origin}/share/${asString(body.slug)}`;
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        // clipboard unavailable
      }
      trackEvent("shared", { template: selectedTemplate, document: activeTab });
      setShareStatus(`Share link copied: ${url}`);
    } catch (error) {
      setShareStatus(error instanceof Error ? error.message : "Sharing failed.");
    }
  }

  function saveDraft() {
    if (!resume) return setStatus("Generate a resume first to save it as a draft.");
    drafts.add({
      name: `${form.fullName || "Draft"} — ${resume.title || form.jobTitle || "Resume"}`.trim(),
      templateId: selectedTemplate,
      formData: form,
      coverLetter,
    });
    trackEvent("draft_saved", { template: selectedTemplate });
    setStatus("Draft saved to My Drafts.");
  }

  const previewData = resume ?? { ...initialResume, name: form.fullName, title: form.jobTitle, email: form.email, phone: form.phone, location: form.location, linkedin: form.linkedin, github: form.github, website: form.website, twitter: form.twitter, instagram: form.instagram, facebook: form.facebook, summary: form.summary };

  const bulletScore = scoreBullets(form.experience);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070b16]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="aurora aurora-blue -left-40 -top-32 h-[34rem] w-[34rem]" />
        <div className="aurora aurora-violet -right-48 top-80 h-[38rem] w-[38rem]" />
        <div className="aurora aurora-blue bottom-[-14rem] left-1/3 h-[30rem] w-[30rem]" style={{ animationDelay: "5s" }} />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.55) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      </div>

      {showSplash && <SplashScreen />}
      {showCheckout && <CheckoutModal onUnlock={handleUnlock} onClose={() => setShowCheckout(false)} />}

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 py-6 md:px-10 md:py-10">
        <header className="glass-panel hairline anim-fade-in-down flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-3.5">
          <div className="flex items-center gap-3">
            <div className="logo-tile"><span className="text-sm font-black tracking-tight text-white">CV</span></div>
            <div>
              <p className="text-sm font-bold tracking-[0.16em] text-white">AI RESUME BUILDER</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Kaywebservice Est.</p>
            </div>
          </div>
          <div className="seg">
            <div className="seg-indicator" style={{ transform: activeTab === "cover" ? "translateX(100%)" : "translateX(0%)" }} />
            <button type="button" data-active={activeTab === "resume"} onClick={() => setActiveTab("resume")}>Resume</button>
            <button type="button" data-active={activeTab === "cover"} onClick={() => setActiveTab("cover")}>Cover Letter</button>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/templates" className="btn-ghost rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-blue-300 transition hover:bg-blue-500/10">Templates</Link>
            <ThemeToggle />
            <button type="button" onClick={() => !isPremiumUnlocked && setShowCheckout(true)} className={`premium-chip ${isPremiumUnlocked ? "cursor-default" : "cursor-pointer"}`}>{isPremiumUnlocked ? "PRO ACTIVE" : "FREE TIER"}</button>
            <span className="text-[11px] tracking-[0.14em] text-slate-500">50 DESIGNS</span>
          </div>
        </header>

        <section className="anim-fade-in-up mt-10 md:mt-14">
          <p className="eyebrow">Artisan CV Studio</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <h1 className="max-w-2xl text-4xl font-black leading-[1.04] tracking-tight text-white md:text-6xl">
              Resumes that command{" "}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-300 bg-clip-text text-transparent">the interview</span>.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-slate-400">
              An AI studio that tailors your story to each role, scores it against the job posting, and exports pixel-perfect
              documents — all in seconds.
            </p>
          </div>
          <div className="mt-7 flex flex-wrap gap-3">
            <span className="stat-chip"><b>50</b> Tailored Designs</span>
            <span className="stat-chip"><b>ATS</b> Match Scoring</span>
            <span className="stat-chip"><b>AI</b> Keyword Optimisation</span>
            <span className="stat-chip"><b>DOCX · PDF</b> One-Click Export</span>
          </div>
        </section>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section className="glass-panel hairline anim-fade-in-up rounded-3xl p-6 md:p-9" style={{ animationDelay: "0.08s" }}>
            <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-6">
              <div>
                <p className="eyebrow">Editor</p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-white">Compose Your Profile</h2>
              </div>
              <span className="hidden sm:block premium-chip">SECURE</span>
            </div>

            <div className="space-y-12">
              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="section-num">01</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Identity</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  {([["fullName", "Full Name"], ["jobTitle", "Professional Title"], ["email", "Email"], ["phone", "Phone"], ["location", "Location"], ["linkedin", "LinkedIn"], ["github", "GitHub"], ["website", "Portfolio / Website"]] as const).map(([name, label]) => (
                    <div key={name} className="anim-stagger-item">
                      <label className="m-label" htmlFor={`f-${name}`}>{label}</label>
                      <input id={`f-${name}`} name={name} placeholder={label} value={form[name]} onChange={handleChange} className="input-lux" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="section-num">02</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Social Presence</h3>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
                <p className="mb-5 text-xs leading-relaxed text-slate-500">Optional — link your professional networks so recruiters can reach you anywhere.</p>
                <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  {([["twitter", "Twitter / X"], ["instagram", "Instagram"], ["facebook", "Facebook"]] as const).map(([name, label]) => (
                    <div key={name}>
                      <label className="m-label" htmlFor={`s-${name}`}>{label}</label>
                      <input id={`s-${name}`} name={name} placeholder={`https://${name}.com/yourhandle`} value={form[name]} onChange={handleChange} className="input-lux" />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="section-num">03</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Narrative</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="space-y-6">
                  {([["summary", "Professional Summary", "Tell us about yourself...", "h-32"], ["experience", "Work Experience", "Company, Position, Dates, Responsibilities...", "h-40"], ["education", "Education", "School, Degree, Graduation Year...", "h-32"], ["skills", "Skills", "React, Next.js, PHP, Linux...", "h-28"], ["certifications", "Certifications", "AWS Cloud Practitioner...", "h-24"], ["achievements", "Achievements", "Built 50+ websites...", "h-24"], ["languages", "Languages", "English (Fluent), French (Intermediate)...", "h-24"], ["projects", "Projects", "Project Name: Description (link optional)...", "h-28"]] as const).map(([name, label, placeholder, height]) => (
                    <div key={name}>
                      <label className="m-label" htmlFor={`n-${name}`}>{label}</label>
                      <textarea id={`n-${name}`} name={name} value={form[name]} onChange={handleChange} placeholder={placeholder} className={`input-lux resize-none ${height}`} />
                      {name === "experience" && bulletScore.score > 0 && (
                        <p className={`anim-fade-in-up mt-2 text-[11px] font-semibold ${bulletScore.score >= 70 ? "text-emerald-300" : bulletScore.score >= 40 ? "text-amber-300" : "text-rose-300"}`}>
                          {bulletScore.score >= 70
                            ? "✓ Bullets look strong — action verbs throughout."
                            : bulletScore.score >= 40
                              ? "~ Some bullets could be sharper: lead each with an action verb (built, led, improved…)."
                              : "! Weak bullets detected — start each line with an action verb and cut passive phrases."}
                          <span className="block font-normal text-slate-500">One point per line parses best in ATS systems.</span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="section-num">04</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Optimisation</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="m-label" htmlFor="targetJob">Target Job Title</label>
                    <input id="targetJob" name="targetJob" placeholder="Senior Frontend Developer" value={form.targetJob} onChange={handleChange} className="input-lux" />
                  </div>
                  <div>
                    <label className="m-label" htmlFor="jobDescription">Job Description</label>
                    <textarea id="jobDescription" name="jobDescription" placeholder="Paste the full job posting here — your resume will be tailored to it, then scored for keyword match." value={form.jobDescription} onChange={handleChange} className="input-lux h-40 resize-none" />
                  </div>
                  <div>
                    <label className="m-label" htmlFor="language">Output Language</label>
                    <select id="language" name="language" value={form.language} onChange={handleChange} className="input-lux">
                      {LANGUAGES.map((language) => <option key={language}>{language}</option>)}
                    </select>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Import Old Resume</p>
                      <button type="button" onClick={() => setShowDraftImport((visible) => !visible)} className="text-xs font-semibold text-blue-300 underline-offset-2 hover:underline">{showDraftImport ? "Hide" : "Paste draft"}</button>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500">Paste an existing resume and the AI rewrites it — facts stay true, wording gets upgraded.</p>
                    {showDraftImport && (
                      <textarea value={draftText} onChange={(event) => setDraftText(event.target.value)} placeholder="Paste your old resume here…" className="input-lux anim-fade-in-up mt-3 h-32 resize-none" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-5 flex items-center gap-3">
                  <span className="section-num">05</span>
                  <h3 className="text-xs font-bold uppercase tracking-[0.26em] text-white">Layout Order</h3>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>
                <p className="mb-4 text-xs leading-relaxed text-slate-500">Drag to reorder the blocks on your resume sheet, or use the arrows.</p>
                <div className="space-y-2">
                  {sectionOrder.map((id, index) => (
                    <div
                      key={id}
                      draggable
                      onDragStart={(event) => { setDragIndex(index); event.dataTransfer.effectAllowed = "move"; }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => { event.preventDefault(); if (dragIndex !== null) moveSection(dragIndex, index); setDragIndex(null); }}
                      className={`flex cursor-grab items-center gap-3 rounded-xl border px-4 py-2.5 transition ${dragIndex === index ? "border-blue-400/60 bg-blue-500/10" : "border-white/10 bg-white/[0.04] hover:border-white/20"}`}
                    >
                      <span className="text-sm text-slate-500">⠿</span>
                      <span className="text-sm font-semibold text-slate-200">{SECTION_LABELS[id]}</span>
                      <span className="ml-auto text-[10px] font-bold text-slate-500">#{index + 1}</span>
                      <div className="flex gap-1">
                        <button type="button" aria-label={`Move ${SECTION_LABELS[id]} up`} disabled={index === 0} onClick={() => moveSection(index, index - 1)} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/10 disabled:opacity-30">↑</button>
                        <button type="button" aria-label={`Move ${SECTION_LABELS[id]} down`} disabled={index === sectionOrder.length - 1} onClick={() => moveSection(index, index + 1)} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/10 disabled:opacity-30">↓</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 border-t border-white/5 pt-7">
              <button type="button" disabled={isGenerating} onClick={generateResume} className={`btn-primary w-full rounded-2xl py-4 text-base font-bold tracking-wide text-white transition hover:-translate-y-0.5 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${isGenerating ? "anim-border-glow" : ""}`}>
                {isGenerating ? <span className="inline-flex items-center justify-center gap-2"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /><span className="ml-1">Generating…</span></span> : `Generate ${activeTab === "resume" ? "Resume" : "Cover Letter"}${form.jobDescription.trim() ? " · Tailored" : ""}`}
              </button>
              {isGenerating && <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-700/60"><div className="progress-bar-indeterminate h-full w-full rounded-full" /></div>}
              {status && <p role="status" className="anim-fade-in-up mt-4 text-sm text-blue-200/80">{status}</p>}
            </div>
          </section>

          <div className="space-y-6">
            <div className="doc-window hairline anim-fade-in-up rounded-3xl" style={{ animationDelay: "0.15s" }}>
              <div className="flex items-center gap-3 border-b border-white/5 bg-white/[0.03] px-5 py-3">
                <span className="doc-dot" /><span className="doc-dot" /><span className="doc-dot" />
                <div className="doc-url">resume.studio/{selectedTemplate || "ats"}{resumeThemes.find((t) => t.id === selectedTemplate)?.premium ? " ◆ PRO" : ""}</div>
                <div className="ml-auto flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-0.5">
                  {[0.5, 0.75, 1].map((factor) => (
                    <button key={factor} type="button" onClick={() => setZoom(factor)} className={`rounded-md px-2 py-1 text-[10px] font-bold transition ${zoom === factor ? "bg-blue-500/30 text-blue-100" : "text-slate-500 hover:text-slate-300"}`}>{Math.round(factor * 100)}%</button>
                  ))}
                </div>
                <span className="hidden text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:block">{activeTab === "resume" ? "Document" : "Letter"}</span>
              </div>
              <div className="p-5 sm:p-7">
                <div key={activeTab === "resume" ? (resume ? "generated" : "empty") : (coverLetter ? "letter" : "letter-empty")} className="anim-scale-in max-h-[820px] overflow-auto rounded-xl bg-white shadow-[0_50px_100px_-50px_rgba(0,0,0,0.9)] ring-1 ring-black/20" style={{ animationDelay: "0.2s" }}>
                  <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
                  {activeTab === "resume" ? (
                    <ResumePreview data={previewData} templateId={selectedTemplate} sectionOrder={sectionOrder} />
                  ) : coverLetter ? (
                    <div className="whitespace-pre-wrap p-10 leading-8 text-gray-700">{coverLetter}</div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
                      <span className="rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 px-6 py-4 text-2xl font-black text-blue-300">✦</span>
                      <p className="text-sm font-semibold text-gray-800">Your document appears here</p>
                      <p className="text-xs text-gray-400">Fill the editor and press Generate — a tailored draft lands right in this sheet.</p>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-panel hairline anim-fade-in-up rounded-2xl p-5" style={{ animationDelay: "0.2s" }}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white">Design System</p>
                {!isPremiumUnlocked
                  ? <button type="button" onClick={() => setShowCheckout(true)} className="premium-chip">Unlock Pro Suite</button>
                  : <button type="button" onClick={() => setShowCheckout(false)} className="premium-chip">★ Suite Active</button>}
              </div>
              <select id="resume-template" value={selectedTemplate} onChange={(event) => { const theme = resumeThemes.find((t) => t.id === event.target.value); if (theme?.premium && !isPremiumUnlocked && event.target.value !== selectedTemplate) return; setSelectedTemplate(event.target.value); }} className="input-lux">
                <option value="">Select a design…</option>
                {resumeThemes.filter((t) => !t.premium).map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
                {!isPremiumUnlocked && <option value="" disabled>── PRO LOCKED ──</option>}
                {resumeThemes.filter((t) => t.premium).map((theme) => <option key={theme.id} value={theme.id} disabled={!isPremiumUnlocked}>{theme.name}{isPremiumUnlocked ? "" : " · PRO"}</option>)}
              </select>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">20 classic layouts included; unlock 30 more in the PRO suite.</p>
              {isPremiumUnlocked && <p className="anim-fade-in-up mt-2 text-[11px] font-semibold tracking-[0.14em] text-amber-300">✓ PRO SUITE UNLOCKED</p>}
              {selectedTemplate && resumeThemes.find((t) => t.id === selectedTemplate)?.premium && !isPremiumUnlocked && (
                <p className="anim-fade-in-up mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">This design is part of the PRO suite — tap “Unlock Pro Suite” to preview it.</p>
              )}
            </div>

            <div className="glass-panel hairline anim-fade-in-up flex flex-wrap items-center gap-3 rounded-2xl p-5" style={{ animationDelay: "0.25s" }}>
                <p className="mr-auto text-xs font-bold uppercase tracking-[0.24em] text-white">Toolbox</p>
                <button type="button" onClick={downloadDOCX} className="btn-primary rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:-translate-y-0.5">DOCX</button>
                <button type="button" onClick={downloadPDF} className="btn-ghost rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-rose-300 transition hover:bg-rose-500/10">PDF</button>
                <button type="button" disabled={isAnalyzing || (activeTab === "resume" && !resume) || (activeTab === "cover" && !coverLetter) || (form.jobDescription.trim() === "")} onClick={analyzeDocument} className="btn-ghost rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-emerald-300 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-40">{isAnalyzing ? "Scoring…" : "ATS Score"}</button>
                <button type="button" disabled={activeTab === "resume" ? !resume : !coverLetter} onClick={shareResume} className="btn-ghost rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-cyan-300 transition hover:bg-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-40">Share</button>
                <button type="button" disabled={!resume} onClick={saveDraft} className="btn-ghost rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-violet-300 transition hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-40">Save Draft</button>
              </div>
              {shareStatus && <p className="anim-fade-in-up mt-2 text-xs text-cyan-200/80">{shareStatus}</p>}

              {drafts.drafts.length > 0 && (
                <div className="glass-panel hairline anim-fade-in-up mt-4 rounded-2xl p-4">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-white">My Drafts</p>
                  <ul className="space-y-2">
                    {drafts.drafts.map((draft) => (
                      <li key={draft.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
                        <button
                          type="button"
                          onClick={() => { setSelectedTemplate(draft.templateId); setForm(draft.formData as ResumeFormData); if (draft.coverLetter) setCoverLetter(draft.coverLetter); setStatus(`Loaded "${draft.name}" (template: ${draft.templateId}).`); }}
                          className="text-left font-medium text-blue-200 hover:text-blue-100"
                        >
                          {draft.name}
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${draft.name}`}
                          onClick={() => drafts.remove(draft.id)}
                          className="text-xs text-rose-400/70 hover:text-rose-300"
                          title="Delete draft"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

             {ats && (
              <div className="glass-panel hairline anim-fade-in-up rounded-2xl p-5" style={{ animationDelay: "0.3s" }}>
                <div className="flex items-center gap-6">
                  <div className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-4 ${ats.score >= 70 ? "border-emerald-400 text-emerald-300" : ats.score >= 45 ? "border-amber-400 text-amber-300" : "border-rose-400 text-rose-300"}`}>
                    <span className="text-3xl font-bold">{ats.score}</span>
                    <span className="text-[10px] uppercase tracking-wide">Score</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-white">ATS Match</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-300">{ats.summary || "No summary."}</p>
                  </div>
                </div>
                {ats.matchedKeywords.length > 0 && <div className="mt-4"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">Matched</p><div className="flex flex-wrap gap-2">{ats.matchedKeywords.map((keyword) => <span key={keyword} className="anim-fade-in-up rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-200">{keyword}</span>)}</div></div>}
                {ats.missingKeywords.length > 0 && <div className="mt-4"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-300">Missing</p><div className="flex flex-wrap gap-2">{ats.missingKeywords.map((keyword) => <span key={keyword} className="anim-fade-in-up rounded-full border border-rose-400/40 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-200">{keyword}</span>)}</div></div>}
                {ats.suggestions.length > 0 && <div className="mt-4"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Suggestions</p><ul className="space-y-1.5">{ats.suggestions.map((suggestion, index) => <li key={`${suggestion}-${index}`} className="anim-fade-in-up text-sm text-slate-200" style={{ animationDelay: `${index * 0.05}s` }}>• {suggestion}</li>)}</ul></div>}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="relative z-10 mt-4 border-t border-white/5 py-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">Designed by <span className="auth-gradient auth-gradient-animated bg-clip-text font-bold text-transparent">Kaywebservice Enterprise Solutions</span></p>
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-slate-500">
          <Link href="/portfolio" className="transition hover:text-slate-300">Portfolio</Link>
          <span className="text-slate-700">·</span>
          <Link href="/privacy" className="transition hover:text-slate-300">Privacy Policy</Link>
          <span className="text-slate-700">·</span>
          <Link href="/terms" className="transition hover:text-slate-300">Terms of Service</Link>
        </div>
      </footer>
    </main>
  );
}
