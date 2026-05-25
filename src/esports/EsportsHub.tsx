import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { EsportsHeader } from './components/EsportsHeader';
import { StreamsGrid } from './components/StreamsGrid';
import {
  matchPreviews,
  teamPreviews,
  tournamentPreviews,
  type MatchPreview,
  type MatchStatus,
  type TeamPreview,
  type TournamentStatus,
} from './data/esports';
import {
  getRouteById,
  getRouteFromPathname,
  type AppRoute,
  type AppRouteId,
} from './routes';
import './EsportsHub.css';

const matchStatusLabels: Record<MatchStatus, string> = {
  live: 'Live',
  today: 'Today',
  upcoming: 'Upcoming',
  recent: 'Recent',
};

const tournamentStatusLabels: Record<TournamentStatus, string> = {
  active: 'Active',
  upcoming: 'Upcoming',
};

export function EsportsHub() {
  const [activeRoute, setActiveRoute] = useState(() =>
    getRouteFromPathname(window.location.pathname),
  );

  useEffect(() => {
    const handlePopState = () => {
      setActiveRoute(getRouteFromPathname(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    document.title = `${activeRoute.title} | Dota2Picker Esports Hub`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', activeRoute.description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', `${activeRoute.title} | Dota2Picker Esports Hub`);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute('content', activeRoute.description);
    document
      .querySelector('meta[name="twitter:title"]')
      ?.setAttribute('content', `${activeRoute.title} | Dota2Picker Esports Hub`);
    document
      .querySelector('meta[name="twitter:description"]')
      ?.setAttribute('content', activeRoute.description);
  }, [activeRoute]);

  const handleNavigate = (route: AppRoute, event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (window.location.pathname !== route.path) {
      window.history.pushState(null, '', route.path);
    }
    setActiveRoute(route);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="esports-hub flex min-h-screen flex-col bg-obsidian-900 text-white selection:bg-gold-500 selection:text-white">
      <EsportsHeader activeRouteId={activeRoute.id} onNavigate={handleNavigate} />
      {renderRoute(activeRoute.id)}
      <footer className="site-footer">
        <span>Stream data from Twitch</span>
        <span>Refreshed regularly</span>
        <span>
          Part of <a href="/">dota2picker.com</a>
        </span>
      </footer>
    </div>
  );
}

function renderRoute(routeId: AppRouteId): ReactNode {
  switch (routeId) {
    case 'matches':
      return <MatchesPage />;
    case 'tournaments':
      return <TournamentsPage />;
    case 'teams':
      return <TeamsPage />;
    case 'live':
      return <LivePage />;
  }
}

function LivePage() {
  return (
    <PageShell routeId="live">
      <StreamsGrid />
    </PageShell>
  );
}

function MatchesPage() {
  const now = useMemo(() => new Date(), []);
  const groups = useMemo(
    () =>
      (Object.keys(matchStatusLabels) as MatchStatus[]).map((status) => ({
        status,
        matches: matchPreviews.filter((match) => match.status === status),
      })),
    [],
  );

  return (
    <PageShell routeId="matches">
      <div className="section-summary">
        <span>
          <strong>{matchPreviews.length}</strong> seed matches
        </span>
        <span>Timezone local</span>
      </div>
      <div className="match-board">
        {groups.map((group) => (
          <section className="match-group" key={group.status}>
            <h2>{matchStatusLabels[group.status]}</h2>
            <div className="match-group__list">
              {group.matches.map((match) => (
                <MatchCard key={match.id} match={match} now={now} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

function MatchCard({ match, now }: { match: MatchPreview; now: Date }) {
  const startTime = addMinutes(now, match.offsetMinutes);

  return (
    <article className={`match-card match-card--${match.status}`}>
      <div className="match-card__topline">
        <span>{match.format}</span>
        <span>{formatStartDelta(startTime, now)}</span>
      </div>
      <h3 className="match-card__teams">
        <span>{match.teamA}</span>
        <span className="match-card__versus">vs</span>
        <span>{match.teamB}</span>
      </h3>
      <div className="match-card__meta">
        <span>{match.tournament}</span>
        <span>{match.stage}</span>
      </div>
      <div className="match-card__footer">
        <span>{formatScheduledTime(startTime)}</span>
        <a href={match.watchUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-3 w-3" />
          Watch
        </a>
      </div>
      <p className="match-card__note">{match.note}</p>
    </article>
  );
}

function TournamentsPage() {
  return (
    <PageShell routeId="tournaments">
      <div className="section-summary">
        <span>
          <strong>{tournamentPreviews.length}</strong> seed tournaments
        </span>
        <span>Active and upcoming</span>
      </div>
      <div className="tournament-grid">
        {tournamentPreviews.map((tournament) => (
          <article className="tournament-card" key={tournament.id}>
            <div className="tournament-card__topline">
              <span className={`status-dot status-dot--${tournament.status}`} />
              <span>{tournamentStatusLabels[tournament.status]}</span>
            </div>
            <h2>{tournament.name}</h2>
            <dl className="detail-list">
              <div>
                <dt>Region</dt>
                <dd>{tournament.region}</dd>
              </div>
              <div>
                <dt>Dates</dt>
                <dd>{tournament.dateRange}</dd>
              </div>
              <div>
                <dt>Prize</dt>
                <dd>{tournament.prizePool}</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>{tournament.format}</dd>
              </div>
            </dl>
            <div className="entity-list">
              {tournament.teams.map((team) => (
                <span key={team}>{team}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

function TeamsPage() {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const teams = teamPreviews.filter((team) => matchesTeam(team, normalizedQuery));

  return (
    <PageShell routeId="teams">
      <div className="directory-toolbar">
        <div className="section-summary section-summary--inline">
          <span>
            <strong>{teams.length}</strong> seed teams
          </span>
          <span>Roster context next</span>
        </div>
        <label className="visually-hidden" htmlFor="team-search">
          Search teams
        </label>
        <div className="team-search-wrap">
          <Search className="team-search-wrap__icon" aria-hidden="true" />
          <input
            id="team-search"
            className="team-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search teams"
          />
        </div>
      </div>
      <div className="team-grid">
        {teams.map((team) => (
          <article className="team-card" key={team.id}>
            <div className="team-card__header">
              <div>
                <h2>{team.name}</h2>
                <p>{team.region}</p>
              </div>
              <span>{team.form}</span>
            </div>
            <dl className="detail-list detail-list--compact">
              <div>
                <dt>Next</dt>
                <dd>{team.nextMatch}</dd>
              </div>
              <div>
                <dt>Event</dt>
                <dd>{team.activeTournament}</dd>
              </div>
            </dl>
            <div className="entity-list">
              {team.aliases.map((alias) => (
                <span key={alias}>{alias}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

function PageShell({ routeId, children }: { routeId: AppRouteId; children: ReactNode }) {
  const route = getRouteById(routeId);

  return (
    <main className="page">
      <section className="page__hero surface">
        <p className="page__eyebrow label-sm">{route.label}</p>
        <h1 className="font-display">{route.title}</h1>
        <p>{route.description}</p>
      </section>
      {children}
    </main>
  );
}

function matchesTeam(team: TeamPreview, query: string): boolean {
  if (!query) return true;
  const haystack = [team.name, team.region, team.activeTournament, ...team.aliases]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

function formatScheduledTime(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatStartDelta(date: Date, now: Date): string {
  const diffMinutes = Math.round((date.getTime() - now.getTime()) / 60_000);
  const absMinutes = Math.abs(diffMinutes);
  if (absMinutes < 1) return 'now';

  const unit =
    absMinutes >= 60
      ? `${Math.floor(absMinutes / 60)}h${absMinutes % 60 ? ` ${absMinutes % 60}m` : ''}`
      : `${absMinutes}m`;

  return diffMinutes > 0 ? `in ${unit}` : `${unit} ago`;
}

export default EsportsHub;
