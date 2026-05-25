export type MatchStatus = 'live' | 'today' | 'upcoming' | 'recent';
export type TournamentStatus = 'active' | 'upcoming';

export interface MatchPreview {
  id: string;
  status: MatchStatus;
  teamA: string;
  teamB: string;
  tournament: string;
  stage: string;
  format: string;
  offsetMinutes: number;
  note: string;
  watchUrl: string;
}

export interface TournamentPreview {
  id: string;
  status: TournamentStatus;
  name: string;
  region: string;
  dateRange: string;
  prizePool: string;
  format: string;
  teams: string[];
}

export interface TeamPreview {
  id: string;
  name: string;
  region: string;
  form: string;
  nextMatch: string;
  activeTournament: string;
  aliases: string[];
}

const dotaDirectoryUrl = 'https://www.twitch.tv/directory/category/dota-2';

export const matchPreviews: MatchPreview[] = [
  {
    id: 'falcons-liquid',
    status: 'live',
    teamA: 'Team Falcons',
    teamB: 'Team Liquid',
    tournament: 'Major Main Event',
    stage: 'Upper bracket',
    format: 'Bo3',
    offsetMinutes: -32,
    note: 'Game 2 underway',
    watchUrl: dotaDirectoryUrl,
  },
  {
    id: 'betboom-tundra',
    status: 'today',
    teamA: 'BetBoom Team',
    teamB: 'Tundra Esports',
    tournament: 'Major Main Event',
    stage: 'Lower bracket',
    format: 'Bo3',
    offsetMinutes: 95,
    note: 'Next series',
    watchUrl: dotaDirectoryUrl,
  },
  {
    id: 'parivision-xtreme',
    status: 'today',
    teamA: 'PARIVISION',
    teamB: 'Xtreme Gaming',
    tournament: 'Regional Qualifiers',
    stage: 'Group stage',
    format: 'Bo2',
    offsetMinutes: 220,
    note: 'Stream pending',
    watchUrl: dotaDirectoryUrl,
  },
  {
    id: 'gladiators-og',
    status: 'upcoming',
    teamA: 'Gaimin Gladiators',
    teamB: 'OG',
    tournament: 'LAN Playoffs',
    stage: 'Quarterfinal',
    format: 'Bo3',
    offsetMinutes: 1_570,
    note: 'Tomorrow',
    watchUrl: dotaDirectoryUrl,
  },
  {
    id: 'aurora-spirit',
    status: 'recent',
    teamA: 'Aurora',
    teamB: 'Team Spirit',
    tournament: 'Regional Qualifiers',
    stage: 'Group stage',
    format: 'Bo2',
    offsetMinutes: -260,
    note: 'Aurora 1-1 Team Spirit',
    watchUrl: dotaDirectoryUrl,
  },
];

export const tournamentPreviews: TournamentPreview[] = [
  {
    id: 'major-main-event',
    status: 'active',
    name: 'Major Main Event',
    region: 'International',
    dateRange: 'This week',
    prizePool: '$1,000,000',
    format: 'Double-elimination playoffs',
    teams: ['Team Falcons', 'Team Liquid', 'BetBoom Team', 'Tundra Esports'],
  },
  {
    id: 'regional-qualifiers',
    status: 'active',
    name: 'Regional Qualifiers',
    region: 'Multi-region',
    dateRange: 'Today through Sunday',
    prizePool: 'Slots',
    format: 'Round robin into playoffs',
    teams: ['PARIVISION', 'Xtreme Gaming', 'Aurora', 'Team Spirit'],
  },
  {
    id: 'lan-playoffs',
    status: 'upcoming',
    name: 'LAN Playoffs',
    region: 'Europe',
    dateRange: 'Starts next week',
    prizePool: '$500,000',
    format: 'Eight-team bracket',
    teams: ['Gaimin Gladiators', 'OG', 'Tundra Esports', 'Team Liquid'],
  },
];

export const teamPreviews: TeamPreview[] = [
  {
    id: 'team-falcons',
    name: 'Team Falcons',
    region: 'MENA',
    form: '4 wins in last 5',
    nextMatch: 'vs Team Liquid',
    activeTournament: 'Major Main Event',
    aliases: ['Falcons', 'FLCN'],
  },
  {
    id: 'team-liquid',
    name: 'Team Liquid',
    region: 'Western Europe',
    form: '3 wins in last 5',
    nextMatch: 'vs Team Falcons',
    activeTournament: 'Major Main Event',
    aliases: ['Liquid', 'TL'],
  },
  {
    id: 'betboom-team',
    name: 'BetBoom Team',
    region: 'Eastern Europe',
    form: '2 wins in last 5',
    nextMatch: 'vs Tundra Esports',
    activeTournament: 'Major Main Event',
    aliases: ['BetBoom', 'BB'],
  },
  {
    id: 'tundra-esports',
    name: 'Tundra Esports',
    region: 'Western Europe',
    form: '3 wins in last 5',
    nextMatch: 'vs BetBoom Team',
    activeTournament: 'LAN Playoffs',
    aliases: ['Tundra', 'TUND'],
  },
  {
    id: 'parivision',
    name: 'PARIVISION',
    region: 'Eastern Europe',
    form: '4 wins in last 5',
    nextMatch: 'vs Xtreme Gaming',
    activeTournament: 'Regional Qualifiers',
    aliases: ['PARI', 'PV'],
  },
  {
    id: 'xtreme-gaming',
    name: 'Xtreme Gaming',
    region: 'China',
    form: '3 wins in last 5',
    nextMatch: 'vs PARIVISION',
    activeTournament: 'Regional Qualifiers',
    aliases: ['Xtreme', 'XG'],
  },
];
