import { NextResponse } from "next/server";

export function GET() {
  const apiKey = process.env.CREEM_API_KEY ?? "";
  return NextResponse.json({
    creem_env: process.env.CREEM_ENV ?? "(unset → prod)",
    api_key: apiKey ? { prefix: apiKey.slice(0, 9), suffix: apiKey.slice(-4), length: apiKey.length } : null,
    product_pro: process.env.CREEM_PRODUCT_PRO ? { length: process.env.CREEM_PRODUCT_PRO.length } : null,
    product_plus: process.env.CREEM_PRODUCT_PLUS ? { length: process.env.CREEM_PRODUCT_PLUS.length } : null,
  });
}