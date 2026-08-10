import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { randomBytes } from "node:crypto";

const SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const MAX_DATA_BYTES = 60_000;

function makeSlug(length = 9) {
  const bytes = randomBytes(length);
  let slug = "";
  for (let i = 0; i < length; i += 1) {
    slug += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
  }
  return slug;
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const data = record.data;

    if (!data || typeof data !== "object") {
      return NextResponse.json({ success: false, error: "Resume data is required." }, { status: 400 });
    }

    const json = JSON.stringify(data);
    if (json.length > MAX_DATA_BYTES) {
      return NextResponse.json({ success: false, error: "Resume data is too large to share." }, { status: 413 });
    }

    let slug = makeSlug();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const { data: existing } = await supabaseAdmin.from("shared_resumes").select("slug").eq("slug", slug).maybeSingle();
      if (!existing) break;
      slug = makeSlug();
    }

    const { error } = await supabaseAdmin.from("shared_resumes").insert({ slug, data });
    if (error) {
      console.error("share insert failed:", error.message);
      return NextResponse.json({ success: false, error: "Could not create share link." }, { status: 500 });
    }

    return NextResponse.json({ success: true, slug });
  } catch {
    return NextResponse.json({ success: false, error: "Share failed." }, { status: 400 });
  }
}