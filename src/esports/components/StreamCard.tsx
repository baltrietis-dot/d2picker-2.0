import { Play, X } from 'lucide-react';
import type { Stream } from '../types';
import { channelUrl, embedUrl, thumbnail } from '../lib/twitch';
import { formatViewers, streamDuration } from '../lib/format';

interface Props {
  stream: Stream;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  onThumbnailUnavailable: () => void;
  isStale: boolean;
}

export function StreamCard({
  stream,
  isPlaying,
  onPlay,
  onStop,
  onThumbnailUnavailable,
  isStale,
}: Props) {
  return (
    <article className="stream-card">
      <div className="stream-card__media">
        {isPlaying ? (
          <>
            <iframe
              className="stream-card__iframe"
              src={embedUrl(stream.userLogin)}
              title={`${stream.userName} on Twitch`}
              allowFullScreen
              allow="autoplay; fullscreen"
            />
            <button
              type="button"
              className="stream-card__close"
              onClick={onStop}
              aria-label="Stop watching"
            >
              <X aria-hidden="true" size={16} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="stream-card__play"
            onClick={onPlay}
            aria-label={`Watch ${stream.userName}`}
          >
            <img
              src={thumbnail(stream.thumbnailUrl, 440, 248)}
              alt=""
              loading="lazy"
              width={440}
              height={248}
              onError={onThumbnailUnavailable}
            />
            {isStale ? null : <span className="stream-card__live">LIVE</span>}
            <span className="stream-card__viewers">
              {formatViewers(stream.viewerCount)} viewers
            </span>
            <span className="stream-card__duration">
              {streamDuration(stream.startedAt)}
            </span>
            <span className="stream-card__play-icon" aria-hidden="true">
              <Play size={24} fill="currentColor" strokeWidth={0} />
            </span>
          </button>
        )}
      </div>
      <div className="stream-card__meta">
        <h3 className="stream-card__title" title={stream.title}>
          {stream.title}
        </h3>
        <div className="stream-card__footer">
          <a
            href={channelUrl(stream.userLogin)}
            target="_blank"
            rel="noopener noreferrer"
            className="stream-card__channel"
          >
            {stream.userName}
          </a>
          <span className="stream-card__lang">{stream.language.toUpperCase()}</span>
        </div>
      </div>
    </article>
  );
}
