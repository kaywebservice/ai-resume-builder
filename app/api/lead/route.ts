import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const email = typeof record.email === "string" ? record.email.trim() : "";

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ success: false, error: "A valid email is required." }, { status: 400 });
    }

    const name = typeof record.name === "string" ? record.name.slice(0, 80) : "";
    const tier = record.tier === "pro-plus" ? "pro-plus" : "pro";
    const source = typeof record.source === "string" ? record.source.slice(0, 40) : "checkout";

    const { error } = await supabaseAdmin.from("leads").insert({ email, name, tier, source });

    if (error) {
      const message = (error as { message?: string }).message ?? "Could not save email.";
      if (message.toLowerCase().includes("duplicate")) {
        return NextResponse.json({ success: true, duplicate: true });
      }
      console.error("lead insert failed:", message);
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/lead] catch:", error);
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }
}