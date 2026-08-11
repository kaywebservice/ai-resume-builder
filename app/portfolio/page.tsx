"use client";

import { useState } from "react";
import Link from "next/link";

const SKILLS = [
  { name: "React", level: "Expert" },
  { name: "Next.js", level: "Expert" },
  { name: "Node.js", level: "Expert" },
  { name: "PHP", level: "Advanced" },
  { name: "Python", level: "Advanced" },
  { name: "HTML / CSS", level: "Expert" },
  { name: "Tailwind CSS", level: "Expert" },
  { name: "WordPress", level: "Expert" },
  { name: "Databases", level: "Expert" },
  { name: "Firebase", level: "Advanced" },
  { name: "Supabase", level: "Advanced" },
  { name: "Git & GitHub", level: "Expert" },
];

const PROJECTS = [
  {
    title: "AI Resume Builder",
    tag: "SaaS · Next.js · AI",
    description: "The app you're in right now — AI-powered resume & cover letter generation, ATS scoring, 50 templates, PDF/DOCX export, share links, and secure one-time payments.",
    link: "/",
    highlight: true,
  },
  {
    title: "Photoshop Clone",
    tag: "Image Editor",
    description: "A browser-based image editor with layers, filters, cropping, and export workflows.",
    link: "https://github.com/kaywebservice",
  },
  {
    title: "AI Image Generator",
    tag: "AI · Design",
    description: "AI-powered image generation tool with prompt-based workflows and gallery management.",
    link: "https://github.com/kaywebservice",
  },
  {
    title: "Behavioral Profiling SaaS Demo",
    tag: "Full-Stack SaaS · Stripe",
    description: "Full-stack SaaS platform: dynamic questionnaire, automatic behavioral profile generation, Stripe payments, and token-based access control.",
    link: "https://github.com/kaywebservice/behavioral-profiling-saas-demo",
  },
  {
    title: "Behavioural Questionnaire App",
    tag: "React",
    description: "React web app delivering a dynamic multiple-choice questionnaire that generates personalized behavioral profiles instantly.",
    link: "https://github.com/kaywebservice/Behavioural-Questionnaire-App",
  },
  {
    title: "Token-Based Access Control System",
    tag: "Node.js · Security",
    description: "Node.js backend demonstrating token-based access control for business users — authentication, token balances, and access management.",
    link: "https://github.com/kaywebservice/Token-Based-Access-Control-System",
  },
  {
    title: "ERC-20 Kaykay Token",
    tag: "Solidity · Blockchain",
    description: "A fully functional ERC-20 token smart contract in Solidity, ready for deployment on Ethereum-compatible chains.",
    link: "https://github.com/kaywebservice/erc20-kaykay-token",
  },
  {
    title: "Responsive Portfolio Website",
    tag: "HTML · CSS",
    description: "A clean, fully responsive portfolio website built with pure HTML and CSS.",
    link: "https://github.com/kaywebservice/responsive-portfolio-website",
  },
];

const WEBSITES = [
  { name: "predictorama.com", url: "https://predictorama.com" },
  { name: "cistudios.com", url: "https://cistudios.com" },
  { name: "luxurylifemag.co.uk", url: "https://luxurylifemag.co.uk" },
  { name: "ecabinets.com", url: "https://ecabinets.com" },
  { name: "indieauthoralley.com", url: "https://indieauthoralley.com" },
];

const WEBSITE_SERVICES = [
  { name: "Landing Page", price: "$150–$400", description: "A single high-converting page for a product, campaign, or personal brand." },
  { name: "Business Website", price: "$300–$800", description: "Multi-page site with services, about, testimonials, and contact." },
  { name: "Portfolio Website", price: "$250–$550", description: "Showcase your work with project galleries and case studies." },
  { name: "E-Commerce Store", price: "$600–$1,500", description: "Online store with cart, checkout, and payments — Shopify, WooCommerce, or custom." },
  { name: "Restaurant & Café Website", price: "$200–$450", description: "Menus, reservations, photo galleries, and location details." },
  { name: "Real Estate Website", price: "$600–$1,500", description: "Property listings, filters, agent profiles, and inquiry forms." },
  { name: "School & Education Website", price: "$400–$1,000", description: "Admissions, courses, events, and news for schools and tutors." },
  { name: "Church & Community Website", price: "$200–$500", description: "Events, sermons and media, donations, and announcements." },
  { name: "News, Blog & Magazine", price: "$300–$800", description: "CMS-powered publishing with SEO, categories, and author pages." },
  { name: "Booking & Reservation Site", price: "$400–$900", description: "Appointments, availability calendars, and instant confirmations." },
  { name: "Event & Registration Website", price: "$300–$700", description: "Event pages, ticketing, RSVPs, and attendee management." },
  { name: "Directory & Listing Website", price: "$700–$2,000", description: "Searchable business or service directories with profiles and reviews." },
];

const SAAS_SERVICES = [
  { name: "SaaS MVP", price: "from $1,500", description: "Your core product built fast — enough to validate with real users." },
  { name: "SaaS + Payment Integration", price: "from $2,500", description: "Subscriptions or one-time payments (Stripe, Creem) with webhooks and access control." },
  { name: "AI-Powered SaaS", price: "from $3,000", description: "LLM features like AI generation, scoring, chat, and automation — similar to this resume builder." },
  { name: "Dashboard & Admin Panel", price: "from $1,200", description: "Internal tools, analytics dashboards, and user management." },
  { name: "CRM & Customer Management", price: "from $1,500", description: "Leads, pipelines, follow-ups, and team collaboration." },
  { name: "Booking & Scheduling Platform", price: "from $1,800", description: "Multi-user scheduling with calendars, reminders, and payments." },
  { name: "Automation & API Integrations", price: "from $1,000", description: "Connecting your tools, building workflows, and third-party APIs." },
  { name: "Mobile-Ready Web App (PWA)", price: "from $1,200", description: "Installable, offline-capable web app that feels like a native mobile app." },
];

export default function PortfolioPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  const submit = async () => {
    setStatus("sending");
    setErrorText("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const payload: unknown = await response.json();
      const body = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
      if (!response.ok) {
        setStatus("error");
        setErrorText(typeof body.error === "string" ? body.error : "Could not send your message.");
        return;
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
      setErrorText("Could not reach the server. Please try again.");
    }
  };

  return (
    <main className="min-h-screen theme-bg theme-text">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <header className="glass-panel hairline mb-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-5 py-3.5">
          <Link href="/" className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300 transition hover:text-blue-200">← Back to Studio</Link>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-500">
            <span className="premium-chip">Portfolio</span>
            <a href="https://github.com/kaywebservice" target="_blank" rel="noopener noreferrer" className="transition hover:text-slate-300">GitHub</a>
          </div>
        </header>

        <section className="anim-fade-in-up text-center">
          <div className="logo-tile mx-auto mb-5"><span className="text-xl font-black text-white">KW</span></div>
          <p className="eyebrow">Hello, I am</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">
            <span className="auth-gradient auth-gradient-animated bg-clip-text text-transparent">Kaywebservice</span>
          </h1>
          <p className="mt-4 text-lg text-slate-300 sm:text-xl">Senior Full-Stack Engineer &amp; SaaS Founder</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
            14+ years building software and SaaS products — from privacy-first AI architectures to fully monetized platforms.
            I design, build, and ship products end-to-end.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href="#contact" className="btn-primary rounded-xl px-6 py-3 text-sm font-bold text-white">Contact Me</a>
            <a href="https://github.com/kaywebservice" target="_blank" rel="noopener noreferrer" className="btn-ghost rounded-xl px-6 py-3 text-sm font-bold text-cyan-300">View GitHub →</a>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="section-title text-center">About Me</h2>
          <div className="glass-panel hairline mx-auto max-w-3xl rounded-2xl px-6 py-6 text-sm leading-relaxed text-slate-300">
            <p>
              I am a Senior Full-Stack Engineer &amp; SaaS Founder with <strong className="text-white">14 years of experience</strong> in
              programming and software-as-a-service. I specialize in privacy-first, local AI agent architectures, automated B2B
              developer utilities, and building complete products from the first line of code to paid customers.
            </p>
            <p className="mt-3">
              My work spans web applications, desktop software, blockchain contracts, AI tooling, and full SaaS platforms —
              including payment integrations, token-based access control, and behavioral profiling systems.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-slate-400">
              <span className="premium-chip">🎓 Education: Caleb University</span>
              <span className="premium-chip">💼 14+ Years Experience</span>
              <span className="premium-chip">🌍 Remote · Freelance · Partnerships</span>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="section-title text-center">Skills</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {SKILLS.map((skill) => (
              <div key={skill.name} className="glass-panel hairline rounded-2xl px-4 py-4 text-center transition hover:-translate-y-0.5">
                <p className="text-sm font-bold text-white">{skill.name}</p>
                <p className={`mt-1 text-[10px] font-bold uppercase tracking-[0.2em] ${skill.level === "Expert" ? "text-emerald-300" : "text-blue-300"}`}>
                  {skill.level}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="section-title text-center">Projects</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {PROJECTS.map((project) => (
              <a
                key={project.title}
                href={project.link}
                target={project.link.startsWith("http") ? "_blank" : undefined}
                rel={project.link.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`glass-panel hairline block rounded-2xl px-5 py-5 transition hover:-translate-y-0.5 ${
                  project.highlight ? "ring-1 ring-blue-400/40" : ""
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">{project.tag}</p>
                <h3 className="mt-2 text-lg font-black text-white">{project.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{project.description}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="section-title text-center">Websites I Designed</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {WEBSITES.map((site) => (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-panel hairline flex items-center justify-between rounded-2xl px-5 py-4 transition hover:-translate-y-0.5"
              >
                <span className="text-sm font-bold text-white">{site.name}</span>
                <span className="text-slate-500">↗</span>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="section-title text-center">Services &amp; Pricing</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-slate-400">
            Every project includes responsive design, SEO basics, and revisions until you are happy. Prices are starting
            points — final quotes depend on scope.
          </p>

          <h3 className="mt-10 text-center text-xs font-black uppercase tracking-[0.26em] text-blue-300">Websites</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WEBSITE_SERVICES.map((service) => (
              <div key={service.name} className="glass-panel hairline flex flex-col rounded-2xl px-5 py-5 transition hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-black text-white">{service.name}</h4>
                  <span className="shrink-0 text-xs font-black text-blue-200">{service.price}</span>
                </div>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-400">{service.description}</p>
                <a href="#contact" className="mt-4 inline-block text-[10px] font-bold uppercase tracking-[0.18em] text-blue-300 transition hover:text-blue-200">Request this service →</a>
              </div>
            ))}
          </div>

          <h3 className="mt-12 text-center text-xs font-black uppercase tracking-[0.26em] text-violet-300">SaaS &amp; Web Apps</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SAAS_SERVICES.map((service) => (
              <div key={service.name} className="glass-panel hairline flex flex-col rounded-2xl px-5 py-5 transition hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-black text-white">{service.name}</h4>
                  <span className="shrink-0 text-xs font-black text-violet-200">{service.price}</span>
                </div>
                <p className="mt-2 flex-1 text-xs leading-relaxed text-slate-400">{service.description}</p>
                <a href="#contact" className="mt-4 inline-block text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300 transition hover:text-violet-200">Request this service →</a>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href="#contact" className="btn-primary inline-block rounded-xl px-8 py-4 text-sm font-bold text-white">Get a Free Quote →</a>
          </div>
        </section>

        <section id="contact" className="mt-16 scroll-mt-8">
          <h2 className="section-title text-center">Contact Me</h2>
          <div className="glass-panel hairline mx-auto max-w-2xl rounded-2xl p-6 sm:p-8">
            {status === "sent" ? (
              <div className="anim-fade-in-up text-center py-6">
                <div className="premium-chip mx-auto mb-4">✓</div>
                <h3 className="text-lg font-bold text-white">Message sent!</h3>
                <p className="mt-2 text-sm text-slate-400">Thank you — I will get back to you soon.</p>
                <button type="button" onClick={() => setStatus("idle")} className="btn-primary mt-6 rounded-xl px-6 py-3 text-sm font-bold text-white">Send Another</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="pf-name" className="m-label" style={{ margin: "0 0 6px" }}>Your Name</label>
                    <input id="pf-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="John Doe" className="input-lux" />
                  </div>
                  <div>
                    <label htmlFor="pf-email" className="m-label" style={{ margin: "0 0 6px" }}>Your Email</label>
                    <input id="pf-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="input-lux" />
                  </div>
                </div>
                <div>
                  <label htmlFor="pf-message" className="m-label" style={{ margin: "0 0 6px" }}>Message</label>
                  <textarea id="pf-message" rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell me about your project…" className="input-lux w-full resize-none" />
                </div>
                {status === "error" && (
                  <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">{errorText}</p>
                )}
                <button type="button" onClick={submit} disabled={status === "sending"} className="btn-primary w-full rounded-xl py-4 text-base font-bold text-white disabled:opacity-60">
                  {status === "sending" ? "Sending…" : "Send Message"}
                </button>
                <p className="text-center text-[11px] text-slate-500">Or email me directly: <a href="mailto:kaywebservice@gmail.com" className="text-blue-300 underline">kaywebservice@gmail.com</a></p>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-16 border-t border-white/5 py-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
            © 2026 <span className="auth-gradient auth-gradient-animated bg-clip-text font-bold text-transparent">Kaywebservice Enterprise Solutions</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500">
            <a href="https://github.com/kaywebservice" target="_blank" rel="noopener noreferrer" className="transition hover:text-slate-300">GitHub</a>
            <span className="text-slate-700">·</span>
            <span>Kaywebservice</span>
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