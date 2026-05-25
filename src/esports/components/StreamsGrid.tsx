import { useMemo, useState } from 'react';
import { useStreams } from '../hooks/useStreams';
import { StreamCard } from './StreamCard';
import { relativeTime, formatViewers } from '../lib/format';
import type { StreamsFeed } from '../types';

type StreamGridColumnCount = 1 | 2 | 3 | 4;
type UnavailableThumbnailState = {
  feedKey: string | null;
  logins: Set<string>;
};

const STALE_FEED_MINUTES = 30;
const LEGACY_FEED_EXPIRY_MINUTES = 30;

function streamGridColumns(itemCount: number): StreamGridColumnCount {
  const maxColumns = 4;
  const rowCount = Math.ceil(itemCount / maxColumns);
  const balancedColumns = Math.ceil(itemCount / rowCount);

  return Math.min(maxColumns, Math.max(1, balancedColumns)) as StreamGridColumnCount;
}

function minutesSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
}

function isExpiredFeed(feed: StreamsFeed): boolean {
  const expiresAt = feed.expiresAt
    ? new Date(feed.expiresAt).getTime()
    : new Date(feed.lastUpdated).getTime() + LEGACY_FEED_EXPIRY_MINUTES * 60_000;

  return Number.isFinite(expiresAt) && Date.now() > expiresAt;
}

export function StreamsGrid() {
  const state = useStreams();
  const [activeStreamLogin, setActiveStreamLogin] = useState<string | null>(null);
  const [unavailableThumbnailState, setUnavailableThumbnailState] = useState<UnavailableThumbnailState>(
    () => ({ feedKey: null, logins: new Set() }),
  );
  const feedKey = state.status === 'ok' ? state.data.lastUpdated : null;
  const unavailableThumbnailLogins = useMemo(
    () =>
      unavailableThumbnailState.feedKey === feedKey
        ? unavailableThumbnailState.logins
        : new Set<string>(),
    [feedKey, unavailableThumbnailState],
  );

  const sorted = useMemo(() => {
    if (state.status !== 'ok') return [];
    return [...state.data.streams].sort((a, b) => b.viewerCount - a.viewerCount);
  }, [state]);

  const visibleStreams = useMemo(
    () => sorted.filter((stream) => !unavailableThumbnailLogins.has(stream.userLogin)),
    [sorted, unavailableThumbnailLogins],
  );

  const totalViewers = useMemo(
    () => visibleStreams.reduce((sum, s) => sum + s.viewerCount, 0),
    [visibleStreams],
  );

  const hideUnavailableStream = (userLogin: string) => {
    if (!feedKey) return;
    if (activeStreamLogin === userLogin) {
      setActiveStreamLogin(null);
    }
    setUnavailableThumbnailState((current) => {
      if (current.feedKey !== feedKey) {
        return { feedKey, logins: new Set([userLogin]) };
      }
      if (current.logins.has(userLogin)) return current;
      const next = new Set(current.logins);
      next.add(userLogin);
      return { feedKey, logins: next };
    });
  };

  if (state.status === 'loading') {
    return <div className="grid-status" role="status">Loading streams...</div>;
  }

  if (state.status === 'error') {
    return (
      <div className="grid-status grid-status--error" role="alert">
        <strong>Couldn't load stream data.</strong>
        <span> Try refreshing in a moment. ({state.error})</span>
      </div>
    );
  }

  const isStale = minutesSince(state.data.lastUpdated) > STALE_FEED_MINUTES;
  const isExpired = isExpiredFeed(state.data);
  const filteredCount = sorted.length - visibleStreams.length;
  const streamCountLabel = isStale ? 'streams' : 'live';

  if (sorted.length === 0 || visibleStreams.length === 0) {
    return (
      <div className="grid-status">
        {sorted.length === 0
          ? 'No Dota 2 streams live right now. Check back soon.'
          : 'No verified live streams in the current snapshot. Waiting for the next Twitch refresh.'}
        {filteredCount > 0 ? (
          <span> Filtered {filteredCount} unavailable streams.</span>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="grid-summary">
        <span>
          <strong>{visibleStreams.length}</strong> {streamCountLabel} | {formatViewers(totalViewers)} total viewers
        </span>
        <span className="grid-summary__updated">
          updated {relativeTime(state.data.lastUpdated)}
        </span>
      </div>
      {isExpired || isStale || filteredCount > 0 ? (
        <div className="grid-warning" role="status">
          {isExpired
            ? `Live stream refresh is delayed. Showing the last verified Twitch snapshot from ${relativeTime(state.data.lastUpdated)}.`
            : isStale
            ? `Stream snapshot may be stale. Last refresh was ${relativeTime(state.data.lastUpdated)}.`
            : 'Some streams in this snapshot no longer look live.'}
          {filteredCount > 0
            ? ` Filtered ${filteredCount} unavailable stream${filteredCount === 1 ? '' : 's'}.`
            : ''}
        </div>
      ) : null}
      <div className={`streams-grid streams-grid--cols-${streamGridColumns(visibleStreams.length)}`}>
        {visibleStreams.map((s) => (
          <StreamCard
            key={s.userLogin}
            stream={s}
            isPlaying={activeStreamLogin === s.userLogin}
            onPlay={() => setActiveStreamLogin(s.userLogin)}
            onStop={() => setActiveStreamLogin(null)}
            onThumbnailUnavailable={() => hideUnavailableStream(s.userLogin)}
            isStale={isStale}
          />
        ))}
      </div>
    </>
  );
}
