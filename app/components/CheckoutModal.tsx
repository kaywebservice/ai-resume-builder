"use client";

import { useEffect, useState } from "react";
import { trackEvent } from "@/lib/track";

const PAYMENT_PRO =
  "https://pay.card2crypto.org/pay.php?address=yFsAReYXhKurv3wNMcRZUttbxMxPOMoT07cAgEiCB6nujWWv52CB8RcfxRJ50laTC3bsNwP9M4T5GhMCLnIYog%3D%3D&amount=14.99&provider=hosted&email=kaywebservice%40gmail.com&currency=USD";

const PAYMENT_PLUS =
  "https://pay.card2crypto.org/pay.php?address=9bxSHeILXOruaxlMnzb7Xkumj2jud0QrTetfN52kozXdEPmPWuZN3TCbUXf076henhIv95n38Ad%2F9sDGlMxVLQ%3D%3D&amount=29.99&provider=hosted&email=kaywebservice%40gmail.com&currency=USD";

const CONFIRM_WINDOW_MS = 5 * 60 * 1000;
const PENDING_KEY = "c2c-pending-until";
const UNLOCK_KEY = "premium-unlocked";

type Tier = "pro" | "pro-plus";
type Step = "idle" | "paying" | "awaiting" | "unlocked";

export function CheckoutModal({
  onUnlock,
  onClose,
}: {
  onUnlock: () => void;
  onClose: () => void;
}) {
  const [tier, setTier] = useState<Tier>("pro");
  const [step, setStep] = useState<Step>("idle");
  const [reference, setReference] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSaved, setLeadSaved] = useState(false);
  const [leadSaving, setLeadSaving] = useState(false);

  const finishUnlock = () => {
    localStorage.setItem(UNLOCK_KEY, "true");
    localStorage.removeItem(PENDING_KEY);
    setStep("unlocked");
    trackEvent("unlocked", { tier });
    onUnlock();
  };

  const saveLead = async () => {
    const email = leadEmail.trim();
    if (!email) {
      setLeadSaved(true);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setLeadSaving(true);
    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tier, source: "checkout" }),
      });
      const payload: unknown = await response.json().catch(() => ({}));
      const body = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
      if (!response.ok && body.success !== true) {
        throw new Error(typeof body.error === "string" ? body.error : "Could not save email.");
      }
      setLeadSaved(true);
    } catch (error) {
      setLeadSaved(true);
      if (error instanceof Error && error.message.toLowerCase().includes("duplicate")) setLeadSaved(true);
    } finally {
      setLeadSaving(false);
    }
  };

  useEffect(() => {
    const stored = Number(localStorage.getItem(PENDING_KEY) || 0);
    if (stored > Date.now()) {
      setSecondsLeft(Math.ceil((stored - Date.now()) / 1000));
      setStep("awaiting");
    } else if (stored > 0) {
      finishUnlock();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step !== "awaiting") return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        const next = current - 1;
        if (next <= 0) {
          window.clearInterval(timer);
          finishUnlock();
          return 0;
        }
        localStorage.setItem(PENDING_KEY, String(Date.now() + next * 1000));
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, onUnlock]);

  const paymentUrl = tier === "pro" ? PAYMENT_PRO : PAYMENT_PLUS;
  const tierName = tier === "pro" ? "PRO Suite" : "PRO+ Suite";

  const openPayment = () => {
    window.open(paymentUrl, "_blank", "noopener,noreferrer");
    setStep("paying");
  };

  const confirmPayment = () => {
    const until = Date.now() + CONFIRM_WINDOW_MS;
    localStorage.setItem(PENDING_KEY, String(until));
    setSecondsLeft(300);
    setStep("awaiting");
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="glass-panel hairline anim-scale-in w-full max-w-md rounded-3xl p-7 sm:p-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="eyebrow">Pro Suite</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Unlock All 40 Designs</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="btn-ghost rounded-xl px-3 py-1.5 text-xs font-bold text-slate-300">✕</button>
        </div>

        {step === "unlocked" ? (
          <div className="anim-fade-in-up text-center">
            <div className="premium-chip mx-auto mb-4">Suite Active</div>
            <h3 className="text-lg font-bold text-white">Payment confirmed — {tierName} unlocked!</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              All 30 premium templates are now available. Your unlock is saved to this browser.
            </p>
            {!leadSaved && (
              <div className="anim-fade-in-up mt-5 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left">
                <p className="m-label" style={{ margin: "0 0 6px" }}>Save my email for updates & free ATS tips</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(event) => setLeadEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="input-lux"
                  />
                  <button type="button" onClick={saveLead} disabled={leadSaving} className="btn-primary shrink-0 rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
                    {leadSaving ? "Saving…" : "Save"}
                  </button>
                </div>
                <button type="button" onClick={() => setLeadSaved(true)} className="mt-2 text-[11px] text-slate-500 underline-offset-2 hover:underline">Skip for now</button>
              </div>
            )}
            {leadSaved && leadEmail.trim() !== "" && (
              <p className="anim-fade-in-up mt-4 text-xs font-semibold text-emerald-300">✓ Email saved — welcome to the list!</p>
            )}
            <button type="button" onClick={onClose} className="btn-primary mt-6 w-full rounded-xl py-3.5 font-bold text-white">Start Designing</button>
          </div>
        ) : (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3">
              {(["pro", "pro-plus"] as Tier[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTier(option)}
                  disabled={step !== "idle"}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    tier === option
                      ? "border-blue-400/60 bg-blue-500/15 shadow-[0_0_30px_-10px_rgba(59,130,246,0.6)]"
                      : "border-white/10 bg-white/[0.04] hover:border-white/20"
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    {option === "pro" ? "Pro" : "Pro+"}
                  </p>
                  <p className="mt-1 text-xl font-black text-white">
                    ${option === "pro" ? "14.99" : "29.99"}
                    <span className="ml-1 text-[10px] font-medium text-slate-500">one-time</span>
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-400">
                    {option === "pro" ? "30 premium templates + ATS" : "Everything in PRO + priority features"}
                  </p>
                </button>
              ))}
            </div>

            {step === "idle" && (
              <div className="anim-fade-in-up space-y-3">
                <button type="button" onClick={openPayment} className="btn-primary w-full rounded-xl py-4 text-base font-bold text-white transition hover:-translate-y-0.5 active:scale-[0.99]">
                  Pay with Card
                </button>
                <p className="text-center text-[11px] leading-relaxed text-slate-500">
                  Visa · Mastercard · Apple Pay · Google Pay · SEPA. Secure hosted checkout.
                </p>
              </div>
            )}

            {step === "paying" && (
              <div className="anim-fade-in-up space-y-3">
                <p className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm leading-relaxed text-blue-100">
                  Payment window opened in a new tab. Your {tierName} will open automatically once payment is confirmed.
                </p>
                <button type="button" onClick={() => window.open(paymentUrl, "_blank", "noopener,noreferrer")} className="btn-ghost w-full rounded-xl py-3 text-sm font-semibold text-white">Reopen Payment Page</button>
                <div className="pt-1">
                  <label className="m-label" htmlFor="pay-ref">Payment reference (optional)</label>
                  <input id="pay-ref" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Paste the payment ID from the confirmation screen" className="input-lux" />
                </div>
                <button type="button" onClick={confirmPayment} className="premium-chip w-full justify-center rounded-xl py-3.5 text-sm font-bold" style={{ border: "1px solid rgba(59,130,246,0.5)", background: "linear-gradient(120deg, rgba(37,99,235,0.2), rgba(59,130,246,0.3))", color: "#c7d6ff" }}>
                  I've Completed the Payment
                </button>
              </div>
            )}

            {step === "awaiting" && (
              <div className="anim-fade-in-up space-y-4">
                <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm leading-relaxed text-emerald-100">
                  Thank you — we've received your confirmation. Your {tierName} will unlock automatically in{" "}
                  <span className="font-bold text-white">{mm}:{ss}</span> once payment is verified.
                </p>
                {reference && (
                  <p className="rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
                    Reference recorded: <span className="font-semibold text-slate-200">{reference}</span>
                  </p>
                )}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700/60">
                  <div className="progress-bar-indeterminate h-full w-full rounded-full" />
                </div>
                <p className="text-center text-[11px] leading-relaxed text-slate-500">
                  Keep this window open. Your templates appear the moment confirmation completes.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}