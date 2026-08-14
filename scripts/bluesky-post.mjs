import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const API_BASE = "https://bsky.social/xrpc";
const POOL_FILE = resolve("scripts/post-pool.json");
const STATE_FILE = resolve("scripts/.poster-state.json");

const handle = process.env.BLUESKY_HANDLE;
const password = process.env.BLUESKY_APP_PASSWORD;
const dailyMax = Number(process.env.BLUESKY_DAILY_MAX ?? 6);
const minIntervalHours = Number(process.env.BLUESKY_MIN_INTERVAL_HOURS ?? 3);

function loadState() {
  if (!existsSync(STATE_FILE)) return { postedUrls: [], lastPostAt: null, postedOn: {} };
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { postedUrls: [], lastPostAt: null, postedOn: {} };
  }
}

function saveState(state) {
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function createSession() {
  const response = await fetch(`${API_BASE}/com.atproto.server.createSession`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: handle, password }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`createSession failed (${response.status}): ${body}`);
  }
  return response.json();
}

function byteLength(text) {
  return new TextEncoder().encode(text).length;
}

function buildRecord(text, url) {
  const record = {
    $type: "app.bsky.feed.post",
    text,
    createdAt: new Date().toISOString(),
  };
  if (url) {
    const start = text.indexOf(url);
    if (start >= 0) {
      record.facets = [
        {
          index: { byteStart: byteLength(text.slice(0, start)), byteEnd: byteLength(text.slice(0, start + url.length)) },
          features: [{ $type: "app.bsky.richtext.facet#link", uri: url }],
        },
      ];
      record.embed = {
        $type: "app.bsky.embed.external",
        external: { uri: url, title: "AI Resume Builder — www.airb.duckdns.org", description: "Free AI resume builder with 50+ templates, ATS scoring, and instant PDF export." },
      };
    }
  }
  return record;
}

async function postToBluesky(text, url) {
  const session = await createSession();
  const response = await fetch(`${API_BASE}/com.atproto.repo.createRecord`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessJwt}`,
    },
    body: JSON.stringify({
      repo: session.did,
      collection: "app.bsky.feed.post",
      record: buildRecord(text, url),
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`createRecord failed (${response.status}): ${body}`);
  }
  return response.json();
}

async function main() {
  if (!handle || !password) {
    console.error("[bluesky] BLUESKY_HANDLE / BLUESKY_APP_PASSWORD missing");
    process.exit(1);
  }
  if (!existsSync(POOL_FILE)) {
    console.error("[bluesky] post pool missing — run `node scripts/generate-post-pool.mjs` first");
    process.exit(1);
  }
  const pool = JSON.parse(readFileSync(POOL_FILE, "utf8"));
  const state = loadState();
  const today = todayKey();
  const postedToday = state.postedOn[today] ?? 0;

  const now = Date.now();
  if (state.lastPostAt && now - new Date(state.lastPostAt).getTime() < minIntervalHours * 3600 * 1000) {
    const next = new Date(new Date(state.lastPostAt).getTime() + minIntervalHours * 3600 * 1000);
    console.log(`[bluesky] waiting — next post allowed at ${next.toISOString()}`);
    return;
  }
  if (postedToday >= dailyMax) {
    console.log(`[bluesky] daily budget reached (${postedToday}/${dailyMax}) — done for today`);
    return;
  }

  const candidate = pool.find((post) => !state.postedUrls.includes(post.url ?? post.text));
  if (!candidate) {
    console.log("[bluesky] entire pool posted — run generate-post-pool.mjs to renew it");
    return;
  }

  const text = candidate.url ? `${candidate.text}${candidate.url}` : candidate.text;
  if (text.length > 290) {
    console.error("[bluesky] post exceeds 300 chars — skipped (pool needs fixing)");
    return;
  }

  if (process.argv.includes("--dry-run")) {
    console.log(`[bluesky] would post (${postedToday + 1}/${dailyMax} today):\n${text}`);
    return;
  }

  try {
    const result = await postToBluesky(text, candidate.url);
    state.postedUrls.push(candidate.url ?? candidate.text);
    state.lastPostAt = new Date().toISOString();
    state.postedOn[today] = (state.postedOn[today] ?? 0) + 1;
    saveState(state);
    console.log(`[bluesky] posted (${state.postedOn[today]}/${dailyMax} today): ${result.uri}`);
  } catch (error) {
    console.error(`[bluesky] POST FAILED: ${error.message}`);
  }
}

main();