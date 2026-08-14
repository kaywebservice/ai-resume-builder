import { headers } from "next/headers";

export const PRIMARY_SITE_URL = "https://www.airb.duckdns.org";

export const PORTFOLIO_URL = "https://kaywebservice.duckdns.org/portfolio";

export function isAirbHost(host: string): boolean {
  return host.startsWith("airb.") || host.startsWith("www.airb.");
}

export async function getRequestSiteUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "";
  if (!host) return PRIMARY_SITE_URL;
  if (host.includes("localhost")) return `http://${host}`;
  const proto = h.get("x-forwarded-proto");
  const scheme = proto && proto.startsWith("http") ? proto.split(",")[0].trim() : "https";
  return `${scheme}://${host}`;
}

export async function isAirbRequest(): Promise<boolean> {
  const h = await headers();
  const host = h.get("host") ?? "";
  return isAirbHost(host);
}