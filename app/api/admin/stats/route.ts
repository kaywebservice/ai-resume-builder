import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  try {
    const { data: events, error: eventsError } = await supabaseAdmin
      .from("events")
      .select("id, event_type, meta, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    const { data: totals, error: totalsError } = await supabaseAdmin
      .from("events")
      .select("event_type");

    const { data: leads, error: leadsError } = await supabaseAdmin
      .from("leads")
      .select("id, email, name, tier, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    const { count: shareCount, error: shareError } = await supabaseAdmin
      .from("shared_resumes")
      .select("slug", { count: "exact", head: true });

    if (eventsError || totalsError || leadsError || shareError) {
      console.error("admin fetch failed:", eventsError?.message ?? totalsError?.message ?? leadsError?.message ?? shareError?.message);
      return NextResponse.json({ success: false, error: "Could not read analytics." }, { status: 500 });
    }

    const totalByType: Record<string, number> = {};
    for (const event of totals ?? []) {
      totalByType[event.event_type] = (totalByType[event.event_type] ?? 0) + 1;
    }

    return NextResponse.json({
      success: true,
      events,
      totals: totalByType,
      shareCount: shareCount ?? 0,
      leads,
    });
  } catch {
    return NextResponse.json({ success: false, error: "Admin read failed." }, { status: 500 });
  }
}