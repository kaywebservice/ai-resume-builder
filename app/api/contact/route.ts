import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const TO_EMAIL = "kaywebservice@gmail.com";
const FROM_EMAIL = "AI Resume Builder <onboarding@resend.dev>";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const name = typeof record.name === "string" ? record.name.trim() : "";
    const email = typeof record.email === "string" ? record.email.trim() : "";
    const message = typeof record.message === "string" ? record.message.trim() : "";
    const subject = typeof record.subject === "string" ? record.subject.trim() : "";

    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Name, email, and message are required." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "A valid email is required." }, { status: 400 });
    }
    if (name.length > 200 || email.length > 200 || message.length > 10000 || subject.length > 200) {
      return NextResponse.json({ success: false, error: "Message too long." }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set.");
      return NextResponse.json(
        { success: false, error: "Email service is not configured." },
        { status: 500 },
      );
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
        subject: subject ? `${subject} — from ${name}` : `New portfolio message from ${name}`,
        text: `New message from the portfolio contact form.\n\nName: ${name}\nEmail: ${email}${subject ? `\nRequest: ${subject}` : ""}\n\n${message}`,
      }),
    });

    if (!resendResponse.ok) {
      const detail = await resendResponse.text();
      console.error("Resend failed:", resendResponse.status, detail);
      return NextResponse.json({ success: false, error: "Could not deliver your message." }, { status: 502 });
    }

    await supabaseAdmin.from("messages").insert({ name, email, message });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Could not process your message." }, { status: 500 });
  }
}