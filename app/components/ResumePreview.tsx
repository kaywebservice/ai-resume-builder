import { Fragment } from "react";
import { getTheme, type ResumeTheme } from "../templates";
import type { ResumeData } from "../types";

export const BODY_SECTIONS = ["summary", "experience", "education", "certifications", "achievements", "languages", "projects"] as const;
export type SectionId = (typeof BODY_SECTIONS)[number];

export interface ResumePreviewProps {
  data: ResumeData;
  templateId: string;
  sectionOrder?: SectionId[];
}

function Section({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6">
      <h2
        className="mb-2 border-b pb-1 text-sm font-bold uppercase tracking-[0.16em]"
        style={{ borderColor: accent, color: accent }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Contact({ data, compact = false }: { data: ResumeData; compact?: boolean }) {
  const details = [data.email, data.phone, data.location];
  const links = [data.linkedin, data.github, data.website, data.twitter, data.instagram, data.facebook].filter(Boolean);
  if (details.length === 0 && links.length === 0) return null;

  return (
    <p className={compact ? "text-xs opacity-85" : "text-sm opacity-80"}>
      {[details.filter(Boolean).join("  •  "), links.join("  •  ")].filter(Boolean).join("  •  ")}
    </p>
  );
}

function bodySections(
  data: ResumeData,
  theme: ResumeTheme,
  compact: boolean
): Record<SectionId, React.ReactNode | null> {
  return {
    summary: data.summary ? (
      <Section title="Professional Summary" accent={theme.accent}>
        <p className="leading-6">{data.summary}</p>
      </Section>
    ) : null,
    experience: data.experience.length > 0 ? (
      <Section title="Experience" accent={theme.accent}>
        <div className="space-y-4">
          {data.experience.map((job, index) => (
            <article key={`${job.company}-${job.role}-${index}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="font-bold">{job.role || "Professional Experience"}</h3>
                {[job.startDate, job.endDate].some(Boolean) && <p className="text-xs uppercase tracking-wide opacity-70">{[job.startDate, job.endDate].filter(Boolean).join(" — ")}</p>}
              </div>
              {job.company && <p className="font-medium" style={{ color: theme.accent }}>{job.company}</p>}
              {job.description && <p className="mt-1 leading-6">{job.description}</p>}
              {job.accomplishments && job.accomplishments.length > 0 && (
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {job.accomplishments.map((item, itemIndex) => <li key={`${item}-${itemIndex}`} className="leading-6">{item}</li>)}
                </ul>
              )}
            </article>
          ))}
        </div>
      </Section>
    ) : null,
    education: data.education.length > 0 ? (
      <Section title="Education" accent={theme.accent}>
        <div className="space-y-2">
          {data.education.map((education, index) => (
            <p key={`${education.institution}-${index}`}>
              <span className="font-semibold">{education.institution}</span>
              {(education.degree || education.year) && <span> — {[education.degree, education.year].filter(Boolean).join(", ")}</span>}
            </p>
          ))}
        </div>
      </Section>
    ) : null,
    certifications: data.certifications.length > 0 ? (
      <Section title="Certifications" accent={theme.accent}>
        <ul className="space-y-1">
          {data.certifications.map((certification, index) => (
            <li key={`${certification.name}-${index}`}>
              <span className="font-semibold">{certification.name}</span>
              {certification.issuer && <span> — {certification.issuer}</span>}
            </li>
          ))}
        </ul>
      </Section>
    ) : null,
    achievements: data.achievements && data.achievements.length > 0 ? (
      <Section title="Achievements" accent={theme.accent}>
        <ul className="list-disc space-y-1 pl-5">
          {data.achievements.map((achievement, index) => <li key={`${achievement}-${index}`}>{achievement}</li>)}
        </ul>
      </Section>
    ) : null,
    languages: data.languages && data.languages.length > 0 ? (
      <Section title="Languages" accent={theme.accent}>
        <ul className="space-y-1">
          {data.languages.map((language, index) => (
            <li key={`${language.name}-${index}`}>
              <span className="font-semibold">{language.name}</span>
              {language.proficiency && <span> — {language.proficiency}</span>}
            </li>
          ))}
        </ul>
      </Section>
    ) : null,
    projects: data.projects && data.projects.length > 0 ? (
      <Section title="Projects" accent={theme.accent}>
        <div className="space-y-3">
          {data.projects.map((project, index) => (
            <div key={`${project.title}-${index}`}>
              <p className="font-bold">{project.title}</p>
              {project.description && <p className="mt-0.5 leading-6">{project.description}</p>}
              {project.link && <a href={project.link} className="text-xs opacity-80 underline" style={{ color: theme.accent }}>{project.link}</a>}
            </div>
          ))}
        </div>
      </Section>
    ) : null,
  };
}

function ResumeBody({
  data,
  theme,
  compact = false,
  sectionOrder,
}: {
  data: ResumeData;
  theme: ResumeTheme;
  compact?: boolean;
  sectionOrder?: SectionId[];
}) {
  const nodes = bodySections(data, theme, compact);
  const order = sectionOrder ?? BODY_SECTIONS;
  return (
    <div className={compact ? "text-sm" : "text-[15px]"}>
      {order.map((id) => nodes[id] ? <Fragment key={id}>{nodes[id]}</Fragment> : null)}
    </div>
  );
}

function Skills({ data, theme }: { data: ResumeData; theme: ResumeTheme }) {
  if (data.skills.length === 0) return null;
  return (
    <Section title="Skills" accent={theme.accent}>
      <div className="flex flex-wrap gap-2">
        {data.skills.map((skill, index) => (
          <span key={`${skill}-${index}`} className="rounded-full border border-blue-200/50 px-2.5 py-1 text-xs font-medium bg-blue-50/50" style={{ borderColor: `${theme.accent}40` }}>
            {skill}
          </span>
        ))}
      </div>
    </Section>
  );
}

function ClassicTemplate({ data, theme, sectionOrder }: { data: ResumeData; theme: ResumeTheme; sectionOrder?: SectionId[] }) {
  return (
    <div className="p-8 sm:p-10" style={{ background: theme.background, color: theme.text, fontFamily: theme.font }}>
      <header className="mb-8 border-b-4 pb-5" style={{ borderColor: theme.accent }}>
        <h1 className="text-3xl font-bold">{data.name || "Your Name"}</h1>
        <p className="mt-1 text-lg font-medium" style={{ color: theme.accent }}>{data.title}</p>
        <div className="mt-3"><Contact data={data} /></div>
      </header>
      <ResumeBody data={data} theme={theme} sectionOrder={sectionOrder} />
      <Skills data={data} theme={theme} />
    </div>
  );
}

function ModernTemplate({ data, theme, sectionOrder }: { data: ResumeData; theme: ResumeTheme; sectionOrder?: SectionId[] }) {
  return (
    <div style={{ background: theme.background, color: theme.text, fontFamily: theme.font }}>
      <header className="p-8 sm:p-10" style={{ background: theme.headerBg, color: theme.headerText }}>
        <h1 className="text-4xl font-bold">{data.name || "Your Name"}</h1>
        <p className="mt-2 text-lg opacity-90">{data.title}</p>
        <div className="mt-4"><Contact data={data} /></div>
      </header>
      <div className="p-8 sm:p-10"><ResumeBody data={data} theme={theme} sectionOrder={sectionOrder} /><Skills data={data} theme={theme} /></div>
    </div>
  );
}

function SidebarTemplate({ data, theme, sectionOrder }: { data: ResumeData; theme: ResumeTheme; sectionOrder?: SectionId[] }) {
  return (
    <div className="grid min-h-[760px] md:grid-cols-[35%_65%]" style={{ background: theme.background, color: theme.text, fontFamily: theme.font }}>
      <aside className="p-7 text-white" style={{ background: theme.headerBg }}>
        <h1 className="text-3xl font-bold leading-tight">{data.name || "Your Name"}</h1>
        <p className="mt-3 text-sm font-medium opacity-90">{data.title}</p>
        <div className="mt-6"><Contact data={data} compact /></div>
        <div className="mt-8">
          {data.skills.length > 0 && <><h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em]">Skills</h2><div className="flex flex-wrap gap-2">{data.skills.map((skill, index) => <span key={`${skill}-${index}`} className="rounded border border-white/40 px-2 py-1 text-xs">{skill}</span>)}</div></>}
        </div>
        {data.certifications.length > 0 && <div className="mt-8"><h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em]">Certifications</h2>{data.certifications.map((certification, index) => <p key={`${certification.name}-${index}`} className="mb-2 text-xs">{certification.name}{certification.issuer ? ` — ${certification.issuer}` : ""}</p>)}</div>}
      </aside>
      <div className="p-8 sm:p-10"><ResumeBody data={{ ...data, certifications: [] }} theme={theme} sectionOrder={sectionOrder} /></div>
    </div>
  );
}

function ExecutiveTemplate({ data, theme, sectionOrder }: { data: ResumeData; theme: ResumeTheme; sectionOrder?: SectionId[] }) {
  return (
    <div className="p-8 sm:p-12" style={{ background: theme.background, color: theme.text, fontFamily: theme.font }}>
      <header className="mb-10 border-y py-6 text-center" style={{ borderColor: theme.headerBg }}>
        <h1 className="text-4xl font-bold tracking-wide">{data.name || "Your Name"}</h1>
        <p className="mt-2 text-base uppercase tracking-[0.2em]" style={{ color: theme.accent }}>{data.title}</p>
        <div className="mt-3"><Contact data={data} /></div>
      </header>
      <div className="grid gap-8 md:grid-cols-[2fr_1fr]"><ResumeBody data={data} theme={theme} sectionOrder={sectionOrder} /><Skills data={data} theme={theme} /></div>
    </div>
  );
}

function MinimalTemplate({ data, theme, sectionOrder }: { data: ResumeData; theme: ResumeTheme; sectionOrder?: SectionId[] }) {
  return (
    <div className="p-8 sm:p-12" style={{ background: theme.background, color: theme.text, fontFamily: theme.font }}>
      <header className="mb-10">
        <h1 className="text-4xl font-light">{data.name || "Your Name"}</h1>
        <p className="mt-2 font-medium">{data.title}</p>
        <div className="mt-2"><Contact data={data} compact /></div>
      </header>
      <ResumeBody data={data} theme={theme} compact sectionOrder={sectionOrder} />
      <Skills data={data} theme={theme} />
    </div>
  );
}

function TechTemplate({ data, theme, sectionOrder }: { data: ResumeData; theme: ResumeTheme; sectionOrder?: SectionId[] }) {
  return (
    <div className="p-6 sm:p-9" style={{ background: theme.background, color: theme.text, fontFamily: theme.font }}>
      <header className="mb-8 rounded-lg p-6" style={{ background: theme.headerBg, color: theme.headerText }}>
        <p className="text-xs uppercase tracking-[0.24em] opacity-75">Professional Profile</p>
        <h1 className="mt-2 text-4xl font-bold">{data.name || "Your Name"}</h1>
        <p className="mt-2" style={{ color: theme.accent }}>{data.title}</p>
        <div className="mt-3"><Contact data={data} compact /></div>
      </header>
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]"><Skills data={data} theme={theme} /><ResumeBody data={data} theme={theme} sectionOrder={sectionOrder} /></div>
    </div>
  );
}

function PremiumTemplate({ data, theme, sectionOrder }: { data: ResumeData; theme: ResumeTheme; sectionOrder?: SectionId[] }) {
  return (
    <div className="p-8 sm:p-12" style={{ background: theme.background, color: theme.text, fontFamily: theme.font }}>
      <header className="mb-9 text-center">
        <div className="mx-auto mb-4 h-px max-w-xs" style={{ background: theme.accent }} />
        <h1 className="text-4xl font-bold">{data.name || "Your Name"}</h1>
        <p className="mt-2 text-lg" style={{ color: theme.accent }}>{data.title}</p>
        <div className="mt-3"><Contact data={data} compact /></div>
        <div className="mx-auto mt-4 h-px max-w-xs" style={{ background: theme.accent }} />
      </header>
      <ResumeBody data={data} theme={theme} sectionOrder={sectionOrder} /><Skills data={data} theme={theme} />
    </div>
  );
}

function CorporateTemplate({ data, theme, sectionOrder }: { data: ResumeData; theme: ResumeTheme; sectionOrder?: SectionId[] }) {
  return (
    <div className="border-l-8 p-8 sm:p-10" style={{ background: theme.background, borderColor: theme.accent, color: theme.text, fontFamily: theme.font }}>
      <header className="mb-8 flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: theme.border }}>
        <div><h1 className="text-4xl font-bold">{data.name || "Your Name"}</h1><p className="mt-1 text-lg font-medium" style={{ color: theme.accent }}>{data.title}</p></div>
        <Contact data={data} compact />
      </header>
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]"><ResumeBody data={data} theme={theme} sectionOrder={sectionOrder} /><Skills data={data} theme={theme} /></div>
    </div>
  );
}

function ElegantTemplate({ data, theme, sectionOrder }: { data: ResumeData; theme: ResumeTheme; sectionOrder?: SectionId[] }) {
  return (
    <div className="p-8 sm:p-12" style={{ background: theme.background, color: theme.text, fontFamily: theme.font }}>
      <header className="mb-10 text-center"><p className="text-xs uppercase tracking-[0.35em]" style={{ color: theme.accent }}>Curriculum Vitae</p><h1 className="mt-3 text-5xl font-bold">{data.name || "Your Name"}</h1><p className="mt-3 italic">{data.title}</p><div className="mt-3"><Contact data={data} compact /></div></header>
      <div className="border-t pt-7" style={{ borderColor: theme.border }}><ResumeBody data={data} theme={theme} sectionOrder={sectionOrder} /><Skills data={data} theme={theme} /></div>
    </div>
  );
}

function ContemporaryTemplate({ data, theme, sectionOrder }: { data: ResumeData; theme: ResumeTheme; sectionOrder?: SectionId[] }) {
  return (
    <div style={{ background: theme.background, color: theme.text, fontFamily: theme.font }}>
      <header className="relative overflow-hidden p-8 sm:p-10" style={{ background: theme.headerBg, color: theme.headerText }}>
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[28px] border-white/15" />
        <div className="relative"><h1 className="text-4xl font-bold">{data.name || "Your Name"}</h1><p className="mt-2 text-lg">{data.title}</p><div className="mt-4"><Contact data={data} compact /></div></div>
      </header>
      <div className="p-8 sm:p-10"><div className="mb-7 border-l-4 pl-5" style={{ borderColor: theme.accent }}>{data.summary && <><h2 className="text-sm font-bold uppercase tracking-[0.16em]" style={{ color: theme.accent }}>Professional Summary</h2><p className="mt-2 leading-6">{data.summary}</p></>}</div><ResumeBody data={{ ...data, summary: "" }} theme={theme} sectionOrder={sectionOrder} /><Skills data={data} theme={theme} /></div>
    </div>
  );
}

type ExtendedTemplateKind = "crimson" | "ocean" | "slate" | "forest" | "rose" | "indigo" | "amber" | "midnight" | "canvas" | "violet";

function ExtendedTemplate({ data, theme, kind, sectionOrder }: { data: ResumeData; theme: ResumeTheme; kind: ExtendedTemplateKind; sectionOrder?: SectionId[] }) {
  const centered = kind === "rose" || kind === "amber" || kind === "midnight";
  const compact = kind === "slate" || kind === "canvas";
  const sidebar = kind === "forest" || kind === "violet";
  const headerStyle = kind === "canvas" ? { background: theme.background, color: theme.headerText, borderColor: theme.accent } : { background: theme.headerBg, color: theme.headerText };

  return (
    <div className={kind === "ocean" ? "overflow-hidden" : ""} style={{ background: theme.background, color: theme.text, fontFamily: theme.font }}>
      <header className={`relative p-8 sm:p-10 ${centered ? "text-center" : ""} ${kind === "canvas" ? "border-b-4" : ""}`} style={headerStyle}>
        {kind === "ocean" && <div className="absolute -bottom-10 -right-8 h-28 w-72 rotate-[-8deg] rounded-full bg-white/15" />}
        {kind === "crimson" && <div className="absolute inset-y-0 left-0 w-3 bg-red-400" />}
        {kind === "indigo" && <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] opacity-75">Professional Resume</p>}
        {kind === "midnight" && <p className="mb-4 text-xs uppercase tracking-[0.32em] text-slate-300">Selected Professional Profile</p>}
        <div className="relative"><h1 className={compact ? "text-3xl font-semibold" : "text-4xl font-bold"}>{data.name || "Your Name"}</h1><p className="mt-2 text-lg opacity-90">{data.title}</p><div className="mt-4"><Contact data={data} compact={compact} /></div></div>
      </header>
      {sidebar ? (
        <div className="grid md:grid-cols-[34%_66%]"><aside className="p-7" style={{ background: `${theme.accent}12` }}><Skills data={data} theme={theme} /><Section title="Contact" accent={theme.accent}><Contact data={data} compact /></Section></aside><div className="p-8 sm:p-10"><ResumeBody data={data} theme={theme} compact={compact} sectionOrder={sectionOrder} /></div></div>
      ) : kind === "indigo" || kind === "canvas" ? (
        <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_2fr]"><Skills data={data} theme={theme} /><ResumeBody data={data} theme={theme} compact={compact} sectionOrder={sectionOrder} /></div>
      ) : (
        <div className="p-8 sm:p-10"><ResumeBody data={data} theme={theme} compact={compact} sectionOrder={sectionOrder} /><Skills data={data} theme={theme} /></div>
      )}
    </div>
  );
}

export function ResumePreview({ data, templateId, sectionOrder }: ResumePreviewProps) {
  const theme = getTheme(templateId);
  const props = { data, theme, sectionOrder };

  switch (theme.id) {
    case "modern": return <ModernTemplate {...props} />;
    case "executive": return <ExecutiveTemplate {...props} />;
    case "minimal": return <MinimalTemplate {...props} />;
    case "creative": return <SidebarTemplate {...props} />;
    case "tech": return <TechTemplate {...props} />;
    case "gold": return <PremiumTemplate {...props} />;
    case "corporate": return <CorporateTemplate {...props} />;
    case "serif": return <ElegantTemplate {...props} />;
    case "contemporary": return <ContemporaryTemplate {...props} />;
    case "crimson": return <ExtendedTemplate {...props} kind="crimson" />;
    case "ocean": return <ExtendedTemplate {...props} kind="ocean" />;
    case "slate": return <ExtendedTemplate {...props} kind="slate" />;
    case "forest": return <ExtendedTemplate {...props} kind="forest" />;
    case "rose": return <ExtendedTemplate {...props} kind="rose" />;
    case "indigo": return <ExtendedTemplate {...props} kind="indigo" />;
    case "amber": return <ExtendedTemplate {...props} kind="amber" />;
    case "midnight": return <ExtendedTemplate {...props} kind="midnight" />;
    case "canvas": return <ExtendedTemplate {...props} kind="canvas" />;
    case "violet": return <ExtendedTemplate {...props} kind="violet" />;
    default: return <ClassicTemplate {...props} />;
  }
}