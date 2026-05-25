export interface Stream {
  userLogin: string;
  userName: string;
  title: string;
  viewerCount: number;
  language: string;
  startedAt: string;
  /** Twitch thumbnail URL with `{width}x{height}` placeholders that must be substituted. */
  thumbnailUrl: string;
}

export interface StreamsFeed {
  lastUpdated: string;
  expiresAt?: string;
  gameId: string;
  gameName: string;
  source?: string;
  streams: Stream[];
}
