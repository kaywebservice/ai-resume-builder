import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SITEMAP_URL = "https://www.airb.duckdns.org/sitemap.xml";
const OUT_FILE = resolve("scripts/post-pool.json");

const RESUME_HOOKS = [
  (job, city) => `Still sending the same generic resume in ${city}? ${city} recruiters scan ${job} applications in seconds — make yours pass the software first → `,
  (job, city) => `Are you a ${job} looking for work in ${city}? This free guide shows you exactly what to write → `,
  (job, city) => `The secret to a ${job} resume that gets replies in ${city}? It's free — and ready in 5 minutes → `,
  (job, city) => `Hiring managers in ${city} get hundreds of ${job} applications. Stand out without paying a cent → `,
  (job, city) => `New ${job} resume guide for ${city} — tailored bullets, real keywords, instant ATS score → `,
  (job, city) => `Thinking about your ${job} career in ${city}? Your resume comes first. Build it free here → `,
  (job, city) => `Tired of silent rejections in ${city}? Most ${job} resumes fail the ATS check before anyone reads them → `,
  (job, city) => `Free ${job} resume templates with instant ATS scoring — created for ${city} job seekers → `,
  (job, city) => `Your ${job} resume should be one page and keyword-rich. Here's the free ${city} guide → `,
  (job, city) => `Applying to ${job} roles in ${city}? Skip expensive services — build a scored resume for free → `,
  (job, city) => `What ${city} hiring managers notice in ${job} resumes — and how to get there in 5 minutes → `,
  (job, city) => `AI + ${city} + ${job} = a resume that actually sounds human. Try it free → `,
];

const HUB_HOOKS = [
  (label, extra) => `All ${label} resume guides in one place — ${extra}, each with a free ATS score. Explore them → `,
  (label, extra) => `Free ${label} resume guides are ready — ${extra}. Pick yours and score it in minutes → `,
  (label, extra) => `No more guessing what to write. Browse ${label} resume guides — ${extra} — all free → `,
];

const GENERIC_POSTS = [
  "75% of resumes are rejected by software before a human reads them. Test yours for free and fix it in minutes → https://www.airb.duckdns.org",
  "Your resume has about 7 seconds with a recruiter. Make it count — write it with AI, score it, export it. Free → https://www.airb.duckdns.org",
  "Nobody should pay for a resume template. 50+ free ones, AI writing help, instant ATS score → https://www.airb.duckdns.org",
  "Stuck on your resume? Describe your work in plain words — the AI turns it into recruiter-ready bullets → https://www.airb.duckdns.org",
  "Before your next application, do this 2-minute check: upload your resume and see its ATS score. Free → https://www.airb.duckdns.org",
  "One-page resume, right keywords, real numbers. That's the formula — and this tool walks you through it free → https://www.airb.duckdns.org",
  "Applied to 100 jobs with no replies? First, fix the resume — 4 out of 5 fail the software scan. Free fixer → https://www.airb.duckdns.org",
  "CV templates are a commodity. Standing out is strategy — get both free at AI Resume Builder → https://www.airb.duckdns.org",
  "Your next interview starts with your resume passing the machine. Build, score, and send — all free → https://www.airb.duckdns.org",
  "Made a resume builder that's actually free — AI writing, 50+ templates, cover letter, ATS score. Give it to a job seeker you know → https://www.airb.duckdns.org",
  "Free resume templates done right — clean, ATS-safe, and made for real recruiters. No paywall, no catch → https://www.airb.duckdns.org",
  "What if your resume could tell you where it's weak? This one scores it before recruiters do → https://www.airb.duckdns.org",
  "The cover letter is back in style — generate a matching one with your resume in seconds → https://www.airb.duckdns.org",
  "Job search math: 100 generic applications < 10 tailored ones. Tailoring is now free → https://www.airb.duckdns.org",
  "I built a free AI resume builder after watching friends get ghosted. It writes, scores, and exports in minutes → https://www.airb.duckdns.org",
];

function hashCode(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function humanize(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function humanizeJob(slug) {
  const map = {
    "ai-ml-engineer": "AI/ML engineer",
    "ux-ui-designer": "UX/UI designer",
    "caregiver": "caregiver or CNA",
    "csr": "customer service representative",
    "cfo": "CFO",
    "ceo": "CEO",
    "cto": "CTO",
    "cmo": "CMO",
    "hr-manager": "HR manager",
    "hr-generalist": "HR generalist",
  };
  return map[slug] ?? humanize(slug).toLowerCase();
}

async function fetchPages() {
  try {
    const response = await fetch(SITEMAP_URL, { signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`sitemap status ${response.status}`);
    const xml = await response.text();
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    if (urls.length < 500) throw new Error(`unexpected url count ${urls.length}`);
    return urls;
  } catch (error) {
    console.warn(`[pool] sitemap fetch failed (${error.message}) — using offline fallback`);
    const cities = ["new-york", "london", "toronto", "dubai", "sydney", "singapore", "berlin", "chicago"];
    const jobs = ["software-engineer", "registered-nurse", "electrician", "project-manager", "graphic-designer", "tutor"];
    const urls = [];
    for (const city of cities) {
      for (const job of jobs) urls.push(`https://www.airb.duckdns.org/resume/${job}-resume-in-${city}`);
    }
    for (const job of jobs) urls.push(`https://www.airb.duckdns.org/resume/jobs/${job}`);
    for (const city of cities) urls.push(`https://www.airb.duckdns.org/resume/cities/${city}`);
    return urls;
  }
}

function buildPool(urls) {
  const pool = [];
  for (const url of urls) {
    const resumeMatch = url.match(/\/resume\/(.+)-resume-in-([a-z-]+)$/);
    if (resumeMatch) {
      const job = humanizeJob(resumeMatch[1]);
      const city = humanize(resumeMatch[2]);
      const hook = RESUME_HOOKS[hashCode(url) % RESUME_HOOKS.length];
      pool.push({ text: hook(job, city), url });
      continue;
    }
    const jobHubMatch = url.match(/\/resume\/jobs\/([a-z-]+)$/);
    if (jobHubMatch) {
      const job = humanizeJob(jobHubMatch[1]);
      const hook = HUB_HOOKS[hashCode(url) % HUB_HOOKS.length];
      pool.push({ text: hook(job, `60+ cities covered`), url });
      continue;
    }
    const cityHubMatch = url.match(/\/resume\/cities\/([a-z-]+)$/);
    if (cityHubMatch) {
      const city = humanize(cityHubMatch[1]);
      const hook = HUB_HOOKS[hashCode(url) % HUB_HOOKS.length];
      pool.push({ text: hook(`${city} job seeker`, `60 different careers covered`), url });
      continue;
    }
  }
  for (let i = 0; i < GENERIC_POSTS.length; i++) {
    pool.splice((i * 17) % (pool.length + 1), 0, { text: GENERIC_POSTS[i], url: null });
  }
  return pool;
}

const pool = buildPool(await fetchPages());
writeFileSync(OUT_FILE, JSON.stringify(pool, null, 2), "utf8");
console.log(`[pool] wrote ${pool.length} posts to ${OUT_FILE}`);