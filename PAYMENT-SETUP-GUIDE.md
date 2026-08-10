# Developer & Payment Setup Guide
### AI Resume Builder — Web + Desktop (ResumeStudio)

**Goal:** Set up hosting (Vercel), wire environment variables, and configure Creem payments (PRO $14.99 / PRO+ $29.99) that unlock premium templates — for both the web app and the desktop build.

---

## 1. Hosting on Vercel (first time)

| Step | What to do |
|------|-----------|
| 1 | Create a GitHub repo (e.g. `ai-resume-builder`) and push the project: `git init` → `git add .` → `git commit -m "init"` → `git push` |
| 2 | Go to **vercel.com** → **New Project** → **Import** your GitHub repo |
| 3 | Vercel auto-detects Next.js — click **Deploy** |
| 4 | After deploy, you get a URL like: `https://ai-resume-builder.vercel.app` |
| 5 | In Vercel → **Settings → Environment Variables**, add the keys from Section 2 below |
| 6 | **Redeploy** once after adding variables |

> **Note:** GitHub Pages cannot host this app (it needs server-side API routes). Vercel is the correct free host for Next.js.

---

## 2. Environment Variables

### Supabase (copy the exact values already in your local `.env.local`)

| Variable name | Where to find it (Supabase dashboard → Project Settings → API) | What goes here (example) |
|--------------|---------------------------------------------------------------|--------------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" | `https://abcdefghijklmnop.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "anon public" key | `eyJhbGciOiJIUzI1NiIs...` (long JWT string) |
| `SUPABASE_SERVICE_ROLE_KEY` | "service_role" key (click **Reveal**) — 🔒 secret, server-only | `eyJhbGciOiJIUzI1NiIs...service_role...` |

> Copy all 3 values **as-is** from your existing `.env.local` — they are already correct. Paste into Vercel under the same names.
> ⚠️ Never put `SUPABASE_SERVICE_ROLE_KEY` in browser code. Server-only (already handled in `lib/supabaseAdmin.ts`).

### Creem (add after onboarding — get these from creem.io dashboard → **Developers**)

| Variable name | Where to find it | What goes here (example) |
|--------------|------------------|--------------------------|
| `CREEM_API_KEY` | Developers → **API Key** | `creem_test_live_xxxxxxxx` (test mode starts with `creem_test_`; swap to live key when ready to sell) |
| `CREEM_WEBHOOK_SECRET` | Developers → **Webhooks** → Add webhook (URL: `https://ai-resume-builder.vercel.app/api/webhooks/creem`) | `whsec_xxxxxxxxxxxxxxxx` |

> 🔒 Both Creem keys are secrets — server-only, never in browser code.

---

## 3. Creem Product Setup

### Store
| Field | What to put |
|-------|------------|
| Store name | `kaywebservice` |

### Product 1 — AI Resume Builder PRO ($14.99 one-time)
| Field | What to put |
|-------|------------|
| Name | `AI Resume Builder PRO` |
| Short description | `All 30 premium templates + ATS scoring. One-time payment, lifetime access.` |
| Price | `14.99 USD` (one-time) |
| Delivery note | `Access unlocks automatically — after payment, refresh the app and the PRO Suite activates instantly in your browser. No license key needed. If your templates don't unlock within a few minutes, reply to your receipt email with your order ID for instant help.` |
| Custom checkout fields | *(leave empty)* |
| Return URL (test) | `http://localhost:3000/thanks` |
| Return URL (live) | `https://ai-resume-builder.vercel.app/thanks` |

### Product 2 — AI Resume Builder PRO+ ($29.99 one-time)
| Field | What to put |
|-------|------------|
| Name | `AI Resume Builder PRO+` |
| Short description | `Everything in PRO, plus automatic cover letters and AI tailoring for every job.` |
| Price | `29.99 USD` (one-time) |
| Delivery note | `Access unlocks automatically — after payment, refresh the app and the PRO+ Suite activates instantly in your browser. No license key needed. If your templates don't unlock within a few minutes, reply to your receipt email with your order ID for instant help.` |
| Custom checkout fields | *(leave empty)* |
| Return URL (test) | `http://localhost:3000/thanks` |
| Return URL (live) | `https://ai-resume-builder.vercel.app/thanks` |

### After creating each product
- Copy the **Product ID** (`prod_...`) for each — the codebase needs them:
  - `CREEM_PRODUCT_PRO=prod_xxxx` (PRO)
  - `CREEM_PRODUCT_PLUS=prod_xxxx` (PRO+)

---

## 4. Creem Onboarding (KYC — Nigerian individual, no business docs needed)

| Step | What to do |
|------|-----------|
| 1 | Sign up at creem.io → store name: `kaywebservice` |
| 2 | Choose **"I'm still building"** → explore in **test mode** (fake payments) |
| 3 | Create the 2 products above with test mode on |
| 4 | Verify identity (KYC) when ready to sell: government ID + payout bank account **in your own name** (matches your KYC identity) |
| 5 | Switch API key from `creem_test_` to live in Vercel |
| 6 | Payouts: bank transfer (Nigeria supported) or USDC (Polygon) — payouts run on the 1st & 15th of each month, min $50 |

### Test mode (while building)
- Test card: `4111 1111 1111 1111` — any future expiry date, any CVC

---

## 5. Web & Desktop Notes

| Platform | How payments work |
|----------|-------------------|
| Web (Vercel) | Creem hosted checkout → return URL lands on `/thanks` → webhook (`/api/webhooks/creem`) verifies payment server-side → unlock saved |
| Desktop (Electron) | Payment opens in the **system browser** (popup fix needed in `desktop/main.mjs`); unlock verified against the deployed webhook backend — no localhost return URL needed |

---

## 6. Final Checklist

- [ ] GitHub repo created & pushed
- [ ] Vercel project deployed (auto-detected Next.js)
- [ ] 3 Supabase env vars added in Vercel (copied from `.env.local`)
- [ ] Creem store created (`kaywebservice`), 2 products created with descriptions & return URLs
- [ ] Creem API key + webhook secret added in Vercel (`CREEM_API_KEY`, `CREEM_WEBHOOK_SECRET`, `CREEM_PRODUCT_PRO`, `CREEM_PRODUCT_PLUS`)
- [ ] Webhook URL registered in Creem → Developers → Webhooks
- [ ] Tested with test card `4111 1111 1111 1111` in test mode
- [ ] KYC identity verified (ID + bank in own name)
- [ ] Switched to live keys & made first real sale