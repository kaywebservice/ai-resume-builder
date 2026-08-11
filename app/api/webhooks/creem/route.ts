import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const SIGNATURE_HEADER = "creem-signature";

function payloadOf(object: unknown): Record<string, unknown> {
  return object && typeof object === "object" ? (object as Record<string, unknown>) : {};
}

export async function POST(request: Request) {
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("CREEM_WEBHOOK_SECRET is not set.");
    return NextResponse.json({ error: "Webhook secret missing." }, { status: 500 });
  }

  const rawBody = await request.text();

  const signature = request.headers.get(SIGNATURE_HEADER);
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 401 });
  }

  const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (computed !== signature) {
    console.error("Creem webhook signature mismatch.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  try {
    const payload = payloadOf(JSON.parse(rawBody));
    const eventType = typeof payload.eventType === "string" ? payload.eventType : "";
    const object = payloadOf(payload.object);
    const customer = payloadOf(object.customer);
    const email = typeof customer.email === "string" ? customer.email : "";
    const name = typeof customer.name === "string" ? customer.name : "";

    console.log("Creem webhook:", eventType, email);

    if (eventType === "checkout.completed" || eventType === "subscription.paid" || eventType === "subscription.active") {
      if (email) {
        const { error: leadError } = await supabaseAdmin.from("leads").insert(
          { email, name, tier: "pro", source: "creem" },
        );
        if (leadError && !leadError.message.toLowerCase().includes("duplicate")) {
          console.error("Creem lead insert failed:", leadError.message);
        }
      }
      await supabaseAdmin.from("events").insert({
        event_type: `creem_${eventType.replace(".", "_")}`,
        meta: { event_id: payload.id, email, amount: object.amount ?? null },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Creem webhook processing failed:", error);
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}