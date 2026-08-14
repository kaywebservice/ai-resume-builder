"use client";

import { useState } from "react";

export function ResumeQuoteForm({ jobName, cityName }: { jobName: string; cityName: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  const submit = async () => {
    setStatus("sending");
    setErrorText("");
    if (!name.trim() || !email.trim() || !details.trim()) {
      setStatus("error");
      setErrorText("Please fill in your name, email, and details.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error");
      setErrorText("Please enter a valid email address.");
      return;
    }
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject: `Quote request: ${jobName} resume in ${cityName}`,
          message: `Role: ${jobName}\nLocation: ${cityName}\n\nDetails:\n${details.trim()}`,
        }),
      });
      const payload: unknown = await response.json();
      const body = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
      if (!response.ok) {
        setStatus("error");
        setErrorText(typeof body.error === "string" ? body.error : "Could not send your request.");
        return;
      }
      setStatus("sent");
      setName("");
      setEmail("");
      setDetails("");
    } catch {
      setStatus("error");
      setErrorText("Could not reach the server. Please try again.");
    }
  };

  if (status === "sent") {
    return (
      <div className="anim-fade-in-up mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-4">
        <p className="text-sm font-bold text-emerald-300">✓ Request sent!</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Thank you — I will get back to you within 24 hours about your {jobName} resume in {cityName}.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div>
        <label htmlFor="rq-name" className="m-label" style={{ margin: "0 0 6px" }}>Your Name *</label>
        <input id="rq-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="John Doe" className="input-lux" />
      </div>
      <div>
        <label htmlFor="rq-email" className="m-label" style={{ margin: "0 0 6px" }}>Your Email *</label>
        <input id="rq-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="input-lux" />
      </div>
      <div>
        <label htmlFor="rq-details" className="m-label" style={{ margin: "0 0 6px" }}>Details *</label>
        <textarea id="rq-details" rows={4} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Tell me about your experience level, target companies, or what help you need…" className="input-lux w-full resize-none" />
      </div>
      {status === "error" && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">{errorText}</p>
      )}
      <button type="button" onClick={submit} disabled={status === "sending"} className="btn-primary w-full rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-60">
        {status === "sending" ? "Sending…" : "Get My Free Quote →"}
      </button>
      <p className="text-center text-[10px] text-slate-500">Emailed straight to me — I reply within 24 hours.</p>
    </div>
  );
}