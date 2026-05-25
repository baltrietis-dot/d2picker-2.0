import { useEffect, useState } from 'react';
import type { StreamsFeed } from '../types';

const LOCAL_STREAMS_URL = '/streams.json';
const REMOTE_STREAMS_URL =
  'https://raw.githubusercontent.com/baltrietis-dot/d2picker-2.0/main/public/streams.json';
const LOCAL_PREVIEW_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

type State =
  | { status: 'loading' }
  | { status: 'ok'; data: StreamsFeed }
  | { status: 'error'; error: string };

function withCacheBust(url: string): string {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
}

async function fetchFeed(url: string): Promise<StreamsFeed> {
  const res = await fetch(withCacheBust(url));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<StreamsFeed>;
}

function feedTime(feed: StreamsFeed): number {
  const time = new Date(feed.lastUpdated).getTime();
  return Number.isFinite(time) ? time : 0;
}

function isNewerFeed(candidate: StreamsFeed, current: StreamsFeed): boolean {
  return feedTime(candidate) > feedTime(current);
}

function shouldUseRemoteFeed(): boolean {
  return typeof window !== 'undefined' && !LOCAL_PREVIEW_HOSTS.has(window.location.hostname);
}

/**
 * Fetches the streams feed produced by the GitHub Actions workflow.
 * Production prefers the newest feed between the deployed JSON and the committed
 * GitHub JSON, so stream refresh commits do not have to wait for a full Pages rebuild.
 */
export function useStreams(pollMs: number = 60_000): State {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const localFeed = await fetchFeed(LOCAL_STREAMS_URL);
        let data = localFeed;

        if (shouldUseRemoteFeed()) {
          try {
            const remoteFeed = await fetchFeed(REMOTE_STREAMS_URL);
            if (isNewerFeed(remoteFeed, localFeed)) {
              data = remoteFeed;
            }
          } catch {
            data = localFeed;
          }
        }

        if (!cancelled) setState({ status: 'ok', data });
      } catch (err) {
        if (shouldUseRemoteFeed()) {
          try {
            const data = await fetchFeed(REMOTE_STREAMS_URL);
            if (!cancelled) setState({ status: 'ok', data });
            return;
          } catch {
            // Report the original local fetch error below; it is usually the page-serving failure.
          }
        }

        if (!cancelled) {
          setState({
            status: 'error',
            error: err instanceof Error ? err.message : 'unknown',
          });
        }
      }
    }

    load();
    const id = window.setInterval(load, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollMs]);

  return state;
}
