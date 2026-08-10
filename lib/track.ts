export function trackEvent(eventType: string, meta: Record<string, unknown> = {}) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, meta }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // analytics must never break the app
  }
}