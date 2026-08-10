import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

const EVENT_LABELS: Record<string, string> = {
  generated: "Resumes generated",
  cover_generated: "Cover letters",
  downloaded_docx: "DOCX downloads",
  downloaded_pdf: "PDF downloads",
  ats_checked: "ATS checks",
  unlocked: "Unlocks",
  shared: "Share links",
  draft_imported: "Draft imports",
  jd_targeted: "JD-tailored generations",
};

const EVENT_COLORS: Record<string, string> = {
  generated: "border-blue-400/40 text-blue-200",
  cover_generated: "border-sky-400/40 text-sky-200",
  downloaded_docx: "border-violet-400/40 text-violet-200",
  downloaded_pdf: "border-rose-400/40 text-rose-200",
  ats_checked: "border-emerald-400/40 text-emerald-200",
  unlocked: "border-amber-400/40 text-amber-200",
  shared: "border-cyan-400/40 text-cyan-200",
  draft_imported: "border-orange-400/40 text-orange-200",
  jd_targeted: "border-indigo-400/40 text-indigo-200",
};

async function readStats() {
  try {
    const [eventsResult, totalsResult, leadsResult, sharesResult] = await Promise.all([
      supabaseAdmin.from("events").select("id, event_type, meta, created_at").order("created_at", { ascending: false }).limit(30),
      supabaseAdmin.from("events").select("event_type"),
      supabaseAdmin.from("leads").select("id, email, name, tier, created_at").order("created_at", { ascending: false }).limit(30),
      supabaseAdmin.from("shared_resumes").select("slug", { count: "exact", head: true }),
    ]);

    const totalByType: Record<string, number> = {};
    for (const event of totalsResult.data ?? []) {
      totalByType[event.event_type] = (totalByType[event.event_type] ?? 0) + 1;
    }

    return {
      events: eventsResult.data ?? [],
      totals: totalByType,
      shareCount: sharesResult.count ?? 0,
      leads: leadsResult.data ?? [],
    };
  } catch {
    return null;
  }
}

export default async function AdminPage() {
  const stats = await readStats();

  return (
    <main className="min-h-screen bg-[#070b16] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <p className="eyebrow">Analytics</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Studio Dashboard</h1>
          </div>
          <a href="/" className="btn-ghost rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-blue-300">← Back to Studio</a>
        </header>

        {!stats && (
          <div className="glass-panel hairline rounded-2xl p-10 text-center text-sm text-rose-300">
            Could not load analytics. Check Supabase connectivity and that the schema is installed.
          </div>
        )}

        {stats && (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.entries(stats.totals).length > 0 ? Object.entries(stats.totals) : [["generated", 0]]).map(([key, value]) => (
                <div key={key} className="glass-panel hairline rounded-2xl p-5">
                  <p className="text-3xl font-black text-white">{value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{EVENT_LABELS[key] ?? key}</p>
                </div>
              ))}
              <div className="glass-panel hairline rounded-2xl p-5">
                <p className="text-3xl font-black text-white">{stats.shareCount}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Active shares</p>
              </div>
            </div>

            <div className="glass-panel hairline mt-8 rounded-2xl p-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-white">Leads</h2>
              {stats.leads.length === 0 ? (
                <p className="text-sm text-slate-500">No leads yet — they appear when a user saves their email after unlocking.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                        <th className="py-2 pr-4">Email</th>
                        <th className="py-2 pr-4">Tier</th>
                        <th className="py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.leads.map((lead) => (
                        <tr key={lead.id} className="border-b border-white/5 text-slate-300">
                          <td className="py-2.5 pr-4">{lead.email}</td>
                          <td className="py-2.5 pr-4">{lead.tier}</td>
                          <td className="py-2.5">{new Date(lead.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="glass-panel hairline mt-6 rounded-2xl p-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-white">Recent Events</h2>
              {stats.events.length === 0 ? (
                <p className="text-sm text-slate-500">No events recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {stats.events.map((event) => (
                    <li key={event.id} className={`flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2 text-xs ${EVENT_COLORS[event.event_type] ?? "border-white/10 text-slate-300"}`}>
                      <span className="font-bold uppercase tracking-[0.14em]">{EVENT_LABELS[event.event_type] ?? event.event_type}</span>
                      <span className="opacity-60">{new Date(event.created_at).toLocaleString()}</span>
                      {event.meta && Object.keys(event.meta).length > 0 && (
                        <span className="text-slate-400">{JSON.stringify(event.meta)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}