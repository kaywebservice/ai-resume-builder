import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ALLOWED_EVENT_TYPES = new Set([
  "generated",
  "cover_generated",
  "downloaded_docx",
  "downloaded_pdf",
  "ats_checked",
  "unlocked",
  "shared",
  "draft_imported",
  "jd_targeted",
  "viewed_template",
  "draft_saved",
]);

const MAX_META_KEYS = 8;

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const record = body && typeof body === "object" ? body as Record<string, unknown> : {};
    const eventType = record.eventType;
    const meta = record.meta && typeof record.meta === "object" ? (record.meta as Record<string, unknown>) : {};

    if (typeof eventType !== "string" || !ALLOWED_EVENT_TYPES.has(eventType)) {
      return NextResponse.json({ success: false, error: "Unknown event type." }, { status: 400 });
    }

    const safeMeta = Object.fromEntries(
      Object.entries(meta).slice(0, MAX_META_KEYS).map(([key, value]) => [
        key.slice(0, 32),
        typeof value === "string" ? value.slice(0, 200) : value,
      ])
    );

    const { error } = await supabaseAdmin.from("events").insert({ event_type: eventType, meta: safeMeta });

    if (error) {
      console.error("trackEvent insert failed:", error.message);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/track] catch:", error);
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }
}
