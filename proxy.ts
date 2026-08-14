import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAirbHost, PORTFOLIO_URL } from "@/lib/seo/site";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (isAirbHost(host) && request.nextUrl.pathname === "/portfolio") {
    return NextResponse.redirect(PORTFOLIO_URL, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/portfolio",
};