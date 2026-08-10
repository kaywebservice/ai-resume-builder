# How to Receive Payments for the AI Resume Builder

> Everything discussed, in one readable place. Read this, pick a route, and tell me which one to build.
> Your situation: based in **Nigeria**, customers **worldwide**, **no Stripe / PayPal**, and payment gateways (like Flutterwave) currently want **company registration** before you can use them.
> **Status:** Card2Crypto flow SHIPPED (June 2026 build). Checkout modal has two tiers, each with its own reusable payment link (below); unlock is the "I've paid → 5:00 confirm window" flow with optional reference capture.

---

## 0. Live payment links (Card2Crypto)

- **PRO $14.99** — https://pay.card2crypto.org/pay.php?address=yFsAReYXhKurv3wNMcRZUttbxMxPOMoT07cAgEiCB6nujWWv52CB8RcfxRJ50laTC3bsNwP9M4T5GhMCLnIYog%3D%3D&amount=14.99&provider=hosted&email=kaywebservice%40gmail.com&currency=USD
- **PRO+ $29.99** — https://pay.card2crypto.org/pay.php?address=9bxSHeILXOruaxlMnzb7Xkumj2jud0QrTetfN52kozXdEPmPWuZN3TCbUXf076henhIv95n38Ad%2F9sDGlMxVLQ%3D%3D&amount=29.99&provider=hosted&email=kaywebservice%40gmail.com&currency=USD
- Both: hosted provider, notify email kaywebservice@gmail.com, settle as USDC on Polygon/BEP20.
- Both links are **reusable** — every buyer pays the same price and it lands in your Card2Crypto balance.
- Verify incoming payments: log in to Card2Crypto and use **Track Payments** (by reference) or check your balance. There is no webhook, so the app cannot auto-verify — hence the 5-minute confirmation window + optional reference field in the UI.

---

## 1. Current paywall situation

- **SHIPPED:** Checkout modal (`app/components/CheckoutModal.tsx`) with two clickable tiers (PRO $14.99 / PRO+ $29.99), each opening its matching Card2Crypto hosted link in a new tab.
- "I've Completed the Payment" starts a **5:00 confirm window** with a countdown and shimmer bar; unlocks happen at 0:00 automatically, persisted via `localStorage` (`c2c-pending-until`, `premium-unlocked`). The pending timer survives refresh.
- Optional **reference field** records the buyer's payment ID for duplicate checks — but verification is inherently trust-based: a visitor can click "I've completed the payment" without paying and get PRO after 5 minutes.
- This is acceptable at launch volumes ($15/$30 one-time). When volume grows, move to Route 4 / Route 5 (server-side wallet watch) or register a company to use Paystack/Flutterwave for true automatic verification.

---

## 2. The Four Routes

### Route A — Manual payment + Activation Code (zero third party)
**How it works**
1. User clicks "Unlock Pro" → a checkout panel shows your payment details and the price.
2. They pay you directly: M-Pesa, bank transfer, Grey USD account, etc.
3. You confirm the money arrived (M-Pesa app / bank app / Grey notification).
4. You issue a **one-time activation code** (site generates it server-side).
5. User enters the code → PRO unlocks in their browser (persists).

**Pros:** No gateway. No registration. No fees. Money lands directly in your pocket.
**Cons:** You must manually verify each payment. Buyers need to be okay sending money without a card page.

**Best for:** Getting started TODAY, before any company registration.

---

### Option B — Paystack (Nigerian card gateway)

**How it works**
1. Customer clicks "Unlock Pro" → Paystack hosted checkout opens.
2. Customer pays by **card anywhere in the world** (Visa, Mastercard, Verve, Amex, UnionPay).
3. Paystack settles the money to your **Nigerian bank account** in NGN.
4. Code verifies payment via webhook → PRO unlocks automatically.

**Requirement:** Like Flutterwave, Paystack asks for business verification/registration (the delay you want to avoid).

**Pros:** True card payments, automatic unlock — the "nicest" UX.
**Cons:** Needs company registration (same blocker).

---

### Option C — Grey (grey.co) hybrid (no gateway)

Grey gives you **virtual USD/EUR/GBP accounts** and lets you receive international transfers, then convert to NGN.

**How it works for us:**
- Customer selects "Pay manually" → sees your Grey USD details + price.
- They send a transfer from their bank/PayPal account.
- You get a Grey notification → confirm → hand out an activation code.
- Zero gateway, zero company registration.

**Pros:** Real foreign-currency receiving without any processor registration.
**Cons:** Manual verification for each buyer; no automatic card checkout.

---

### Option D — Crypto (zero paperwork, worldwide)

There are two sub-routes:

**D1: Pure wallet-to-wallet (free of company)**
- You receive **stablecoins** (USDT on TRC‑20 or USDC) on a wallet address you control.
- Customer pays from their wallet → you verify on a block explorer (free API) → auto-unlock (or manual confirm).
- For **card buyers**: you add a "Buy with card" hint that links to a card→crypto on top (Binance, MoonPay, Transak, Simplex, KuCoin). The buyer purchases crypto there with their card, then transfers to your address.
- **No company registration needed.** You are just an address holder.

**D2: Crypto processors with card-to-checkout**
- ⚠️ **Correction (verified Aug 2026):** Cryptomus is **NOT light-KYC** — it now requires mandatory full KYC (ID + selfie, KYB for businesses since Feb 2025), is Russia-linked/Canada-registered, and holds the largest FINTRAC AML penalty (~CAD 177M) — do not rely on it.
- **The brutal truth:** a fully KYC-free "customer pays by card → you receive crypto" flow does NOT exist in 2026. Card networks/acquirers require identity at the fiat layer, period.
- **How card→crypto really works:** on-ramp aggregators — the customer pays their card with a licensed partner (MoonPay, Transak, Simplex, Coinbase Pay, Ramp, Banxa), the partner converts it to crypto and streams it to **your wallet address**. KYC happens on the *customer* side, not yours.
- **Card2Crypto (card2crypto.org)** packages this: give a USDC wallet address, their 26+ onramps take card / Apple Pay / Google Pay worldwide, you receive crypto — no company KYB on your part.
- Lighter alternatives with SOME ID but NO company registration: CoinRemitter, NOWPayments (light tier), 0xProcessing. Caveat: limits ramp up and docs are requested as volume grows; some "no-KYC" processors carry regulatory risk (Cryptomus, Heleket flagged).

**Cost / tradeoffs of D1:**
- Card-to-crypto on-ramps charge the buyer ~2–5% (they bear it, not you, since you price in crypto).
- Stablecoin (USDT/USDC) keeps the value stable — avoid Bitcoin/ETH volatility.
- Crypto is legal to hold/send in Nigeria (cash trades are common; keep stablecoins).

**Pros:** Real card ability (via onramps), fully global, no paperwork for you.
**Cons:** Slightly clunkier UX, customer needs the apps, 2–5% buyer-side fee. And you market it carefully.

---

## 3. Which one should you pick?

Quick decision matrix:

| Goal | Best pick |
|------|-----------|
| Start now, zero paperwork | **A (manual + codes)** or **D1 (crypto)** |
| Cards from worldwide buyers, no company | **D1** (crypto) with on-ramp links (MoonPay/Transak/Coinbase Pay) or **Card2Crypto** aggregator |
| Nigerian card users (local) | A or D1 while you process Flutterwave later |
| Automatic unlock (one click) | D1 with explorer verification, or paystack/flutterwave after registration |

**My suggestion for you right now:**
1. **Start with D1-Smooth** — white-label card checkout (buyer sees normal payment), funds land as USDT/USDC in your wallet, server auto-unlocks on confirmation.
2. **Add A in parallel** — sell activation codes that can be paid via Grey or bank transfer for users without cards.
3. **Plan a "later" roadmap:** once you register a company (or find a lighter processor), swap in Paystack/Flutterwave for fully regulated card UX.

---

## 4. What I'd build on each route (when you pick)

**Route A (manual+codes):**
- Server (`/api/unlock`) that issues and validates one-time activation codes
- Checkout panel with your payment details printed + code entry box
- Panel shows: price, your M-Pesa/bank/Grey details, user pastes transaction reference + phone

**Route D1-Smooth (recommended build):**
- Checkout panel styled like a normal product payment (your brand, price in USD/₦, "Pay with Card")
- White-label on-ramp embed (Transak/MoonPay) — buyer enters card, on-ramp converts to USDT/USDC and sends to your wallet
- Server watches your wallet address via free block explorer API → confirms payment → PRO unlocks automatically
- Secondary collapsible "pay directly in crypto" option (hidden by default)

**Route D1-SMOOTH (the one you asked about — see Section 7 below):**
- Buyer only ever sees a normal card payment page. No crypto, no wallets, no addresses — the on-ramp handles everything invisibly.

---

## 7. The "Smooth Card Flow" design (buyer never sees crypto)

This is the recommended build. The buyer's perception = "I paid for the product with my card." Everything else is invisible infrastructure.

### The flow (what the USER sees)
1. User clicks **"Unlock Pro — $X"**
2. A payment panel opens in-app: product name, price **in USD/₦**, big **"Pay with Card"** button (Visa / Mastercard / Apple Pay / Google Pay)
3. They type card details in a form that looks like your brand — exactly like any normal product purchase
4. `Payment successful` → within ~30–60s **PRO unlocks automatically**

No crypto, wallet, or address text ever appears in the buyer's journey.

### What happens underneath (invisible to them)
- The on-ramp partner (white-label mode, e.g., Transak) receives the card payment, converts to USDT/USDC, and deposits straight into **your wallet address**
- My server watches for that deposit on the blockchain, confirms it, and flips the PRO flag on
- Buyer thinks "I paid with my card" — which is true. The settlement rails are ours, not theirs.

### Honest caveats (so you're not surprised)
- The on-ramp does **KYC on the buyer** in some countries (a small "verify identity" step may appear for certain cards/regions — standard for card payments everywhere)
- ~2–6% fee on the card leg — either absorb it into the price or add it transparently
- Receipts/emails from the on-ramp occasionally say "crypto purchase" — edge case, rarely seen at your embedded step

### What you need from your side (individual-level, no company)
1. A **Transak or MoonPay merchant account** (email + ID — not company) → gives you the white-label embed link/key
2. Their **"buy crypto" widget config** set to: fiat amount = your price, crypto = USDT/USDC, deposit address = your wallet
3. Optionally: also show a small secondary link "pay directly in crypto" for users who prefer it (hidden by default)

**Route D2 (Cryptom/CoinGate):**
- Same screens, but a "Card > Crypto" skips the onramp: user just pays by card
- Requires your chosen processor account (email-level KYC for Cryptom)

---

## 5. What you must do on my end (before I can start the payment route)

- **D1 / D1-Smooth:** Nothing structural — you need: (a) a wallet address (USDT TRC-20 preferred) to receive funds, (b) a Transak or MoonPay merchant account (individual, email+ID) for the white-label card button, (c) decide the price in USD/₦. No company registration.
- **D2:** Not recommended — Cryptomus and similar now require mandatory full KYC and carry regulatory risk.
- **A/Grey:** Decide price in NGN/USD and share your payment details flavor (M-Pesa / Grey USD / bank).
- **Flutterwave/Paystack (later):** register + verify the business + keys + webhook secret.

---

## 6. My recommended first stack (regardless of choice)

1. **Server** `/api/unlock` — issues & validates codes (or) verifies crypto tx hash.
2. **UI** — "Unlock Pro Suite" panel → shows payment options (crypto address / card-onramp link / Grey details), input for code/tx hash → activates.
3. **Activation persists in localStorage keyed to a browser + tied to a hash/email if we add auth later.
4. **Splash screen** — redesign to match the new studio UI (aurora, logo tile, shimmer bar).

---

*Note: this file is for you to read and decide; no code has been changed yet.*