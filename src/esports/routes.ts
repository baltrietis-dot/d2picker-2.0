export const ESPORTS_BASE_PATH = '/esports';

export const APP_ROUTES = [
  {
    id: 'live',
    label: 'Live',
    path: ESPORTS_BASE_PATH,
    title: 'Dota 2 live streams',
    description:
      "Verified Twitch Dota 2 streams, from pub grinders to tournament casters. Click any thumbnail to watch without leaving the page.",
  },
  {
    id: 'matches',
    label: 'Matches',
    path: `${ESPORTS_BASE_PATH}/matches`,
    title: 'Dota 2 matches',
    description:
      'Today, next up, and recently finished matches with tournament context and watch links.',
  },
  {
    id: 'tournaments',
    label: 'Tournaments',
    path: `${ESPORTS_BASE_PATH}/tournaments`,
    title: 'Dota 2 tournaments',
    description:
      'Active and upcoming event context, prize pools, regions, formats, and participating teams.',
  },
  {
    id: 'teams',
    label: 'Teams',
    path: `${ESPORTS_BASE_PATH}/teams`,
    title: 'Dota 2 teams',
    description:
      'Team context for rosters, regions, upcoming matches, recent form, and common aliases.',
  },
] as const;

export type AppRoute = (typeof APP_ROUTES)[number];
export type AppRouteId = AppRoute['id'];

export function getRouteById(routeId: AppRouteId): AppRoute {
  return APP_ROUTES.find((route) => route.id === routeId) ?? APP_ROUTES[0];
}

export function getRouteFromPathname(pathname: string): AppRoute {
  const normalized = normalizePath(pathname);
  const route = APP_ROUTES.find((candidate) => {
    if (candidate.path === ESPORTS_BASE_PATH) {
      return normalized === ESPORTS_BASE_PATH || normalized === `${ESPORTS_BASE_PATH}/live`;
    }
    return normalized === candidate.path || normalized.startsWith(`${candidate.path}/`);
  });

  return route ?? APP_ROUTES[0];
}

function normalizePath(pathname: string): string {
  const withoutTrailingSlash = pathname.replace(/\/+$/, '');
  return (withoutTrailingSlash || '/').toLowerCase();
}
