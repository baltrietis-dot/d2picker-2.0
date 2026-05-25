import { useEffect, useState } from 'react';
import type { StreamsFeed } from '../types';

type State =
  | { status: 'loading' }
  | { status: 'ok'; data: StreamsFeed }
  | { status: 'error'; error: string };

/**
 * Fetches the streams feed produced by the GitHub Actions workflow.
 * Falls back to /streams.json (committed sample in dev, refreshed JSON in prod).
 */
export function useStreams(pollMs: number = 60_000): State {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/streams.json?t=${Date.now()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: StreamsFeed = await res.json();
        if (!cancelled) setState({ status: 'ok', data });
      } catch (err) {
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
