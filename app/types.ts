export interface Experience {
  company: string;
  role: string;
  description: string;
  startDate?: string;
  endDate?: string;
  accomplishments?: string[];
}

export interface Language {
  name: string;
  proficiency?: string;
}

export interface Project {
  title: string;
  description?: string;
  link?: string;
}

export interface Education {
  institution: string;
  degree?: string;
  year?: string;
}

export interface Certification {
  name: string;
  issuer?: string;
}

export interface ResumeData {
  name: string;
  title: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  achievements?: string[];
  languages?: Language[];
  projects?: Project[];
}

export interface ResumeFormData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  twitter: string;
  instagram: string;
  facebook: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  certifications: string;
  achievements: string;
  languages: string;
  projects: string;
  targetJob: string;
  jobDescription: string;
  language: string;
}

export interface AtsResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  summary: string;
}
