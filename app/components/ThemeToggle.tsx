"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "theme";

export function getStoredTheme(): "dark" | "light" | "system" {
  if (typeof window === "undefined") return "system";
  const value = localStorage.getItem(STORAGE_KEY);
  if (value === "dark" || value === "light") return value;
  return "system";
}

export function applyTheme(theme: "dark" | "light" | "system"): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  const resolved = theme === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : theme;
  document.documentElement.setAttribute("data-theme", resolved);
  localStorage.setItem(STORAGE_KEY, theme);
  return resolved;
}

const OPTIONS: { value: "dark" | "light" | "system"; label: string }[] = [
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
];

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light" | "system">("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = getStoredTheme();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  const change = (next: "dark" | "light" | "system") => {
    setTheme(next);
    applyTheme(next);
  };

  if (!mounted) return null;
  const current = OPTIONS.find((o) => o.value === theme)?.label ?? "System";

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] p-1">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-label={`Use ${option.label} theme`}
          onClick={() => change(option.value)}
          className={`rounded-md px-2.5 py-1.5 text-[11px] font-bold transition ${
            theme === option.value
              ? "bg-blue-500/30 text-blue-100"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {option.label}
        </button>
      ))}
      <span className="sr-only">Theme: {current}</span>
    </div>
  );
}
