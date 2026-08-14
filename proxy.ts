import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PORTFOLIO_URL = "https://kaywebservice.duckdns.org/portfolio";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host.startsWith("airb.") && request.nextUrl.pathname === "/portfolio") {
    return NextResponse.redirect(PORTFOLIO_URL, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/portfolio",
};