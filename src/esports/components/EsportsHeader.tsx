import type { MouseEvent } from 'react';
import {
  CalendarDays,
  Radio,
  Swords,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { APP_ROUTES, type AppRoute, type AppRouteId } from '../routes';

interface Props {
  activeRouteId: AppRouteId;
  onNavigate: (route: AppRoute, event: MouseEvent<HTMLAnchorElement>) => void;
}

const routeIcons: Record<AppRouteId, LucideIcon> = {
  live: Radio,
  matches: CalendarDays,
  tournaments: Trophy,
  teams: Users,
};

export function EsportsHeader({ activeRouteId, onNavigate }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-obsidian-900/80 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_14px_38px_-28px_rgba(0,0,0,0.9)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <a
          href="/"
          className="flex min-w-0 items-center gap-3 text-white no-underline"
          aria-label="Dota2Picker home"
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-[0_0_0_1px_rgba(180,83,9,0.7),0_12px_28px_-18px_rgba(251,191,36,0.9),inset_0_1px_0_rgba(253,230,138,0.45)]">
            <Trophy className="h-5 w-5 text-obsidian-900 drop-shadow-sm" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-[19px] font-bold tracking-wide text-white">
              Dota2Picker
            </span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/45">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
                Esports Hub
              </span>
            </span>
          </span>
        </a>

        <nav className="flex flex-wrap items-center gap-2 lg:justify-end" aria-label="Esports navigation">
          <a
            className="toolbar-button min-h-[34px] border-radiant-500/25 bg-radiant-900/15 px-2.5 py-2 text-radiant-300 no-underline hover:border-radiant-500/45 hover:bg-radiant-900/25"
            href="/"
          >
            <Swords className="h-3.5 w-3.5" />
            Picker
          </a>
          {APP_ROUTES.map((route) => {
            const Icon = routeIcons[route.id];
            const isActive = route.id === activeRouteId;

            return (
              <a
                key={route.id}
                className={`toolbar-button min-h-[34px] px-2.5 py-2 no-underline ${
                  isActive
                    ? 'border-gold-500/45 bg-gold-500/15 text-gold-200 shadow-[0_10px_24px_-18px_rgba(251,191,36,0.9)]'
                    : ''
                }`}
                href={route.path}
                onClick={(event) => onNavigate(route, event)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-3.5 w-3.5" />
                {route.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
