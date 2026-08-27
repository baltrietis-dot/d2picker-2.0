export type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsParams = Record<string, AnalyticsValue>;

type AnalyticsPayload = Record<string, string | number | boolean>;
type GtagFunction = (command: string, target: string | Date, params?: AnalyticsPayload) => void;
type YandexFunction = (
  counterId: number,
  method: 'hit' | 'reachGoal',
  target?: string,
  params?: AnalyticsPayload,
) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
    ym?: YandexFunction;
  }
}

const YANDEX_COUNTER_ID = 109483423;
const DRAFT_PARAM_KEYS = ['e', 't'] as const;

function cleanAnalyticsParams(params: AnalyticsParams): AnalyticsPayload {
  const cleaned: AnalyticsPayload = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    cleaned[key] = value;
  });

  return cleaned;
}

function normalizePath(pathname: string): string {
  const squashed = pathname.replace(/\/{2,}/g, '/') || '/';
  if (squashed === '/') return squashed;
  return squashed.endsWith('/') ? squashed : `${squashed}/`;
}

export function hasDraftShareParams(search = window.location.search): boolean {
  const params = new URLSearchParams(search);
  return DRAFT_PARAM_KEYS.some((key) => params.has(key));
}

export function getAnalyticsPagePath(location = window.location): string {
  const pathname = normalizePath(location.pathname);

  if (hasDraftShareParams(location.search)) {
    return pathname.startsWith('/ru/') ? '/ru/shared-draft/' : '/shared-draft/';
  }

  return pathname;
}

export function getAnalyticsPageTitle(location = window.location): string {
  if (hasDraftShareParams(location.search)) {
    return 'Shared Dota 2 draft | Dota2Picker';
  }

  if (location.hash === '#guide') {
    return 'Dota 2 counter picker guide | Dota2Picker';
  }

  return document.title;
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}): void {
  if (typeof window === 'undefined') return;

  const payload = cleanAnalyticsParams(params);
  sendGtag('event', eventName, payload);
  window.ym?.(YANDEX_COUNTER_ID, 'reachGoal', eventName, payload);
}

export function trackPageView({
  pagePath,
  pageTitle,
  contentGroup,
  params = {},
}: {
  pagePath?: string;
  pageTitle?: string;
  contentGroup?: string;
  params?: AnalyticsParams;
} = {}): void {
  if (typeof window === 'undefined') return;

  const resolvedPath = pagePath ?? getAnalyticsPagePath();
  const resolvedTitle = pageTitle ?? getAnalyticsPageTitle();
  const pageLocation = `${window.location.origin}${resolvedPath}`;
  const payload = cleanAnalyticsParams({
    page_path: resolvedPath,
    page_title: resolvedTitle,
    page_location: pageLocation,
    content_group: contentGroup,
    ...params,
  });

  sendGtag('event', 'page_view', payload);
  window.ym?.(
    YANDEX_COUNTER_ID,
    'hit',
    pageLocation,
    cleanAnalyticsParams({
      title: resolvedTitle,
      referer: document.referrer,
      content_group: contentGroup,
      ...params,
    }),
  );
}

function sendGtag(command: string, target: string | Date, params?: AnalyticsPayload): void {
  if (window.gtag) {
    window.gtag(command, target, params);
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(params === undefined ? [command, target] : [command, target, params]);
}
