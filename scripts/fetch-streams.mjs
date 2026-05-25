#!/usr/bin/env node
/**
 * Fetch live Dota 2 streams from Twitch Helix and write them to public/streams.json.
 *
 * Requires env vars:
 *   TWITCH_CLIENT_ID
 *   TWITCH_CLIENT_SECRET
 *
 * Run locally:
 *   Copy .env.example to .env.local, fill in Twitch credentials, then run:
 *   npm run streams:refresh
 *
 * In CI, the GitHub Actions workflow (.github/workflows/streams.yml) sets these
 * from repo secrets and commits the resulting JSON.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(__dirname, '..', 'public', 'streams.json');

const GAME_ID = '29595'; // Dota 2 on Twitch
const MAX_STREAMS = 100; // Helix max per page
const VERIFY_CHUNK_SIZE = 100; // Helix accepts up to 100 user_login filters.

async function loadLocalEnv() {
  for (const envFile of ['.env.local', '.env']) {
    const envPath = resolve(__dirname, '..', envFile);

    try {
      const body = await readFile(envPath, 'utf8');
      for (const line of body.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        if (!match) continue;

        const [, key, rawValue] = match;
        if (process.env[key] != null) continue;

        let value = rawValue.trim();
        const hasDoubleQuotes = value.startsWith('"') && value.endsWith('"');
        const hasSingleQuotes = value.startsWith("'") && value.endsWith("'");
        if (hasDoubleQuotes || hasSingleQuotes) {
          value = value.slice(1, -1);
        }

        process.env[key] = value;
      }
    } catch (err) {
      if (err?.code !== 'ENOENT') throw err;
    }
  }
}

await loadLocalEnv();

const FEED_TTL_MINUTES = Number(process.env.STREAM_FEED_TTL_MINUTES ?? 60);

const clientId = process.env.TWITCH_CLIENT_ID?.trim();
const clientSecret = process.env.TWITCH_CLIENT_SECRET?.trim();

if (!clientId || !clientSecret) {
  console.error('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET');
  process.exit(1);
}

async function getAppToken() {
  const res = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    const hint = res.status === 400 && body.includes('invalid client')
      ? '\nCheck that TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET are copied from the same Twitch Developer Console app. If you generated a new secret, use that newest secret.'
      : '';
    throw new Error(`Token request failed: ${res.status} ${body}${hint}`);
  }
  const { access_token } = await res.json();
  return access_token;
}

async function fetchStreams(token) {
  const url = new URL('https://api.twitch.tv/helix/streams');
  url.searchParams.set('game_id', GAME_ID);
  url.searchParams.set('first', String(MAX_STREAMS));

  const res = await fetch(url, {
    headers: {
      'Client-Id': clientId,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Streams request failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function fetchStreamsByLogin(token, logins) {
  const url = new URL('https://api.twitch.tv/helix/streams');
  for (const login of logins) {
    url.searchParams.append('user_login', login);
  }
  url.searchParams.set('first', String(Math.min(MAX_STREAMS, logins.length)));

  const res = await fetch(url, {
    headers: {
      'Client-Id': clientId,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Stream verification request failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function verifyLiveStreams(token, streams) {
  const verified = [];
  const seen = new Set();
  const logins = streams
    .map((stream) => stream.user_login)
    .filter(Boolean);

  for (let index = 0; index < logins.length; index += VERIFY_CHUNK_SIZE) {
    const chunk = logins.slice(index, index + VERIFY_CHUNK_SIZE);
    const { data } = await fetchStreamsByLogin(token, chunk);

    for (const stream of data) {
      const loginKey = stream.user_login.toLowerCase();
      if (seen.has(loginKey)) continue;
      if (stream.type !== 'live') continue;
      if (stream.game_id !== GAME_ID) continue;
      seen.add(loginKey);
      verified.push(stream);
    }
  }

  return verified.sort((a, b) => b.viewer_count - a.viewer_count);
}

function toStream(s) {
  return {
    userLogin: s.user_login,
    userName: s.user_name,
    title: s.title,
    viewerCount: s.viewer_count,
    language: s.language,
    startedAt: s.started_at,
    thumbnailUrl: s.thumbnail_url,
  };
}

async function main() {
  console.log('Requesting Twitch app token...');
  const token = await getAppToken();
  console.log('Fetching live Dota 2 streams...');
  const { data } = await fetchStreams(token);
  console.log(`Got ${data.length} candidate streams`);
  console.log('Verifying streams are still live...');
  const verifiedStreams = await verifyLiveStreams(token, data);
  const filteredCount = data.length - verifiedStreams.length;
  console.log(`Verified ${verifiedStreams.length} live streams (${filteredCount} filtered)`);

  const lastUpdated = new Date();
  const expiresAt = new Date(lastUpdated.getTime() + FEED_TTL_MINUTES * 60_000);

  const feed = {
    lastUpdated: lastUpdated.toISOString(),
    expiresAt: expiresAt.toISOString(),
    gameId: GAME_ID,
    gameName: 'Dota 2',
    source: 'twitch-helix',
    streams: verifiedStreams.map(toStream),
  };

  await mkdir(dirname(OUT_PATH), { recursive: true });
  await writeFile(OUT_PATH, JSON.stringify(feed, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${OUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
