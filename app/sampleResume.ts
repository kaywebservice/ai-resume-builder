import type { ResumeData } from "./types";

export const SAMPLE_RESUME: ResumeData = {
  name: "Alex Morgan",
  title: "Senior Product Designer",
  email: "alex.morgan@example.com",
  phone: "+1 (415) 555-0123",
  location: "San Francisco, CA",
  linkedin: "linkedin.com/in/alexmorgan",
  github: "github.com/alexmorgan",
  website: "alexmorgan.design",
  twitter: "twitter.com/alexmorgan",
  instagram: "",
  facebook: "",
  summary:
    "Product design lead with 8+ years building customer-centric digital products. Passionate about turning complex problems into intuitive, high-impact experiences used by millions.",
  skills: ["Figma", "Design Systems", "User Research", "Prototyping", "Framer", "React Basics", "Accessibility", "Stakeholder Workshops"],
  experience: [
    {
      company: "Acme Co",
      role: "Senior Product Designer",
      startDate: "2020",
      endDate: "Present",
      description: "Led design for the core dashboard serving 2M+ monthly active users.",
      accomplishments: [
        "Designed a unified design system adopted across 12 products, cutting dev time by 35%.",
        "Ran 40+ moderated usability sessions that surfaced accessibility gaps shipped in the next release.",
        "Mentored 5 designers and established the team's design-review process.",
      ],
    },
    {
      company: "Nebula Studios",
      role: "Product Designer",
      startDate: "2017",
      endDate: "2020",
      description: "Designed mobile and web experiences for fintech products.",
      accomplishments: [
        "Created the onboarding flow that increased activation by 22%.",
        "Proposed and shipped a dark mode that improved retention in low-light usage by 14%.",
      ],
    },
  ],
  education: [
    { institution: "Rhode Island School of Design", degree: "BFA, Graphic Design", year: "2016" },
  ],
  certifications: [{ name: "Google UX Design Certificate", issuer: "Google" }],
  achievements: ["Speaker at Design Week 2023 — 'Designing for Trust.'"],
  languages: [{ name: "English", proficiency: "Native" }, { name: "Spanish", proficiency: "Professional working proficiency" }],
  projects: [
    { title: "Palette", description: "Open-source color-contrast checker.", link: "https://github.com/alexmorgan/palette" },
  ],
};
