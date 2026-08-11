import { NextResponse } from "next/server";

const CREEM_BASE = process.env.CREEM_ENV === "test" ? "https://test-api.creem.io/v1" : "https://api.creem.io/v1";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const tier = record.tier === "pro-plus" ? "pro-plus" : "pro";

    const apiKey = process.env.CREEM_API_KEY;
    const productId = (tier === "pro-plus" ? process.env.CREEM_PRODUCT_PLUS : process.env.CREEM_PRODUCT_PRO) ?? "";
    if (!apiKey || !productId) {
      return NextResponse.json({ success: false, error: "Creem is not configured yet." }, { status: 500 });
    }

    const origin = request.headers.get("origin") || "https://ai-resume-builder-chi-orcin.vercel.app";
    const email = typeof record.email === "string" ? record.email.trim() : "";

    const creemResponse = await fetch(`${CREEM_BASE}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        product_id: productId,
        units: 1,
        ...(email ? { customer: { email } } : {}),
        success_url: `${origin}/?creem_checkout=done&tier=${tier}`,
        metadata: { tier },
      }),
    });

    if (!creemResponse.ok) {
      const detail = await creemResponse.text().catch(() => "");
      console.error("Creem checkout failed:", creemResponse.status, detail);
      return NextResponse.json(
        { success: false, error: `Could not start the payment (Creem ${creemResponse.status}).` },
        { status: 502 },
      );
    }

    const payload: unknown = await creemResponse.json();
    const checkout = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const url = typeof checkout.checkout_url === "string" ? checkout.checkout_url : "";

    if (!url) {
      return NextResponse.json({ success: false, error: "Creem did not return a checkout URL." }, { status: 502 });
    }

    return NextResponse.json({ success: true, url, checkoutId: checkout.id });
  } catch (error) {
    console.error("[/api/creem/checkout] catch:", error);
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }
}