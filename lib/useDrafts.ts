"use client";

import { useEffect, useState } from "react";

export const DRAFTS_KEY = "resume-drafts";

export interface Draft {
  id: string;
  name: string;
  templateId: string;
  formData: unknown;
  createdAt: number;
  coverLetter?: string;
}

function loadDrafts(): Draft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Draft[]) : [];
  } catch {
    return [];
  }
}

function saveDrafts(drafts: Draft[]) {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } catch {
    // ignore storage-quota errors
  }
}

export function useDrafts() {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDrafts(loadDrafts());
    setReady(true);
  }, []);

  const add = (draft: Omit<Draft, "id" | "createdAt">) => {
    const created: Draft = { ...draft, id: crypto.randomUUID(), createdAt: Date.now() };
    setDrafts((current) => {
      const next = [created, ...current];
      saveDrafts(next);
      return next;
    });
    return created;
  };

  const remove = (id: string) => {
    setDrafts((current) => {
      const next = current.filter((d) => d.id !== id);
      saveDrafts(next);
      return next;
    });
  };

  return { drafts, ready, add, remove };
}
