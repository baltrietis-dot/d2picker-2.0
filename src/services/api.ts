
const CDN_BASE_URL = 'https://cdn.cloudflare.steamstatic.com';

export interface Hero {
    id: number;
    name: string;
    localized_name: string;
    primary_attr: string;
    attack_type: string;
    roles: string[];
    img: string;
    icon: string;
    pro_pick?: number;
    pro_win?: number;
    pub_pick?: number;
    pub_win?: number;
}

export interface Matchup {
    hero_id: number;
    games_played: number;
    wins: number;
}

import heroesUrl from '../data/heroes.json';

// Lazy-loaded matchups — not bundled in the initial chunk
let matchupsCache: Record<string, Matchup[]> | null = null;

const loadMatchups = async (): Promise<Record<string, Matchup[]>> => {
    if (!matchupsCache) {
        const raw = await import('../data/all_matchups.json');
        matchupsCache = raw.default as unknown as Record<string, Matchup[]>;
    }
    return matchupsCache;
};

export const api = {
    fetchHeroes: async (): Promise<Hero[]> => {
        // We still need to map the CDN URLs because the raw JSON has partial paths
        const data = (heroesUrl as any[]).map((hero: any) => ({
            ...hero,
            img: `${CDN_BASE_URL}${hero.img}`,
            icon: `${CDN_BASE_URL}${hero.icon}`
        }));

        return data;
    },

    fetchMatchups: async (heroId: number): Promise<Matchup[]> => {
        const allMatchups = await loadMatchups();
        return allMatchups[heroId.toString()] || allMatchups[heroId] || [];
    }
};
