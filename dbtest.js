// DB integration test for AI Resume Builder (Node-side; JSON built in code)
// Run: node dbtest.js
const fs = require("fs");
const http = require("http");
const https = require("https");

const env = {};
fs.readFileSync("C:/ai-resume-builder/.env.local", "utf8").split("\n").forEach((line) => {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^"|"$/g, "");
});
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const svc = env.SUPABASE_SERVICE_ROLE_KEY;
const stamp = Date.now();

let failures = 0;
function note(ok, label, extra = "") {
  if (ok) console.log("[PASS] " + label + (extra || ""));
  else { console.log("[FAIL] " + label + (extra || "")); failures++; }
}

function rest(method, path, key, body, query) {
  const payload = body !== undefined ? JSON.stringify(body) : undefined;
  const href = url + "/rest/v1/" + path + (query || "");
  return new Promise((resolve) => {
    const req = https.request(href, {
      method,
      headers: Object.assign(
        { apikey: key, Authorization: "Bearer " + key },
        payload ? { "Content-Type": "application/json", Prefer: "return=representation" } : {}
      ),
    });
    const chunks = [];
    req.on("response", (res) => {
      const parts = [];
      res.on("data", (c) => parts.push(Buffer.from(c)));
      res.on("end", () => {
        const raw = Buffer.concat(parts).toString("utf8");
        let parsed;
        try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = raw; }
        resolve({ status: res.statusCode || 0, body: parsed });
      });
    });
    req.on("error", (e) => resolve({ status: 0, body: String(e) }));
    if (payload) req.write(payload);
    req.end();
  });
}

function local(method, path, body) {
  const payload = body !== undefined ? JSON.stringify(body) : null;
  return new Promise((resolve) => {
    const headers = { "Content-Type": "application/json" };
    if (payload) headers["Content-Length"] = Buffer.byteLength(payload);
    const req = http.request("http://127.0.0.1:3000" + path, { method, headers });
    const chunks = [];
    req.on("response", (res) => {
      const parts = [];
      res.on("data", (c) => parts.push(Buffer.from(c)));
      res.on("end", () => {
        const raw = Buffer.concat(parts).toString("utf8");
        let parsed;
        try { parsed = raw ? JSON.parse(raw) : {}; } catch { parsed = raw; }
        resolve({ status: res.statusCode || 0, body: parsed });
      });
    });
    req.on("error", (e) => resolve({ status: 0, body: String(e) }));
    if (payload) req.write(payload);
    req.end();
  });
}

const slug = "dbtest" + stamp;

console.log("== 1. anon INSERT shared_resumes (expect 201) ==");
rest("POST", "shared_resumes", anon, { slug: slug, data: { name: "Test User", title: "Engineer" } }).then((s1) => {
  note(s1.status === 201, "anon share insert", " -> " + s1.status);
  console.log("== 2. anon SELECT shared_resumes (expect 200) ==");
  rest("GET", "shared_resumes", anon, undefined, "?select=slug&limit=1").then((s2) => {
    note(s2.status === 200 && Array.isArray(s2.body), "anon share read", " -> " + s2.status);
    console.log("== 3. anon READ events must be denied (expect 200 empty or 403) ==");
    rest("GET", "events", anon, undefined, "?select=id&limit=1").then((bE) => {
      note((bE.status === 200 && Array.isArray(bE.body) && bE.body.length === 0) || bE.status === 403, "anon events blocked", " -> " + bE.status);
      console.log("== 4. anon INSERT events (expect 403/401, NOT 201) ==");
      rest("POST", "events", anon, { event_type: "generated", meta: { t: 1 } }).then((eI) => {
        note(eI.status !== 201, "anon events insert properly denied", " -> " + eI.status + " " + JSON.stringify(eI.body).slice(0, 80));
        console.log("== 5. svc read events (expect 200) ==");
        rest("GET", "events", svc, undefined, "?select=event_type&limit=3").then((rE) => {
          note(rE.status === 200 && Array.isArray(rE.body), "svc events read", " -> " + rE.status);
          console.log("== 6. svc read leads (expect 200) ==");
          rest("GET", "leads", svc, undefined, "?select=email&limit=3").then((rL) => {
            note(rL.status === 200 && Array.isArray(rL.body), "svc leads read", " -> " + rL.status);
            console.log("== 7. /api/lead (expect 200) ==");
            local("POST", "/api/lead", { email: "node" + stamp + "@example.com", tier: "pro", source: "dbtest" }).then((lE) => {
              note(lE.status === 200 && lE.body && lE.body.success === true, "api/lead", " -> " + lE.status + " " + JSON.stringify(lE.body));
              console.log("== 8. /api/track valid (expect 200) ==");
              local("POST", "/api/track", { eventType: "generated", meta: { node: true } }).then((t1) => {
                note(t1.status === 200 && t1.body && t1.body.success === true, "api/track valid", " -> " + t1.status + " " + JSON.stringify(t1.body));
                console.log("== 9. /api/track invalid (expect 400) ==");
                local("POST", "/api/track", { eventType: "evil_type" }).then((t2) => {
                  note(t2.status === 400, "api/track rejects bad type", " -> " + t2.status);
                  console.log("== 10. pages (expect 200) ==");
                  local("GET", "/admin", undefined).then((ad) => {
                    note(ad.status === 200, "/admin", " -> " + ad.status);
                    local("GET", "/share/x", undefined).then((sh) => {
                      note(sh.status === 200, "/share/x", " -> " + sh.status);
                      console.log("== CLEANUP ==");
                      rest("DELETE", "shared_resumes", svc, undefined, "?slug=eq." + slug).then((c1) => {
                        rest("DELETE", "events", svc, undefined, "?meta->>node=eq.true").then((c2) => {
                          rest("DELETE", "leads", svc, undefined, "?source=eq.dbtest").then((c3) => {
                            console.log("cleanup: shares=" + c1.status + " events=" + c2.status + " leads=" + c3.status);
                            console.log("\n== RESULT: " + (failures === 0 ? "ALL PASS" : failures + " FAILURE(S)") + " ==");
                            process.exit(failures === 0 ? 0 : 1);
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});
