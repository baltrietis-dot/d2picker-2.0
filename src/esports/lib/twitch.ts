/**
 * Twitch embed helpers.
 * The embed iframe requires `parent=<host>` for anti-clickjacking.
 * We derive the parent from window.location so dev (localhost) and prod
 * (dota2picker.com / its subdomain) both work without config.
 */

export function parentParam(): string {
  if (typeof window === 'undefined') return 'localhost';
  // Twitch wants just the hostname, no port, no scheme.
  return window.location.hostname || 'localhost';
}

export function embedUrl(channel: string, opts: { muted?: boolean } = {}): string {
  const params = new URLSearchParams({
    channel,
    parent: parentParam(),
    muted: opts.muted === false ? 'false' : 'true',
  });
  return `https://player.twitch.tv/?${params.toString()}`;
}

export function thumbnail(template: string, width: number, height: number): string {
  return template
    .replace('{width}', String(width))
    .replace('{height}', String(height));
}

export function channelUrl(channel: string): string {
  return `https://twitch.tv/${channel}`;
}
