import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const email = typeof record.email === "string" ? record.email.trim() : "";
    const message = typeof record.message === "string" ? record.message.trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Name, email, and message are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "A valid email is required." }, { status: 400 });
    }
    if (name.length > 200 || email.length > 200 || message.length > 10000) {
      return NextResponse.json({ success: false, error: "Message too long." }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("messages").insert({ name, email, message });
    if (error) {
      console.error("contact insert failed:", error.message);
      return NextResponse.json({ success: false, error: "Could not save your message. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Could not process your message." }, { status: 500 });
  }
}