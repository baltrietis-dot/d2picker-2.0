
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
import allMatchupsRaw from '../data/all_matchups.json';

const allMatchups = allMatchupsRaw as unknown as Record<string, Matchup[]>;

export const api = {
    fetchHeroes: async (): Promise<Hero[]> => {
        // Use local data instead of fetching
        // We still need to map the CDN URLs because the raw JSON has partial paths
        const data = (heroesUrl as any[]).map((hero: any) => ({
            ...hero,
            img: `${CDN_BASE_URL}${hero.img}`,
            icon: `${CDN_BASE_URL}${hero.icon}`
        }));

        return data;
    },

    fetchMatchups: async (heroId: number): Promise<Matchup[]> => {
        // Instant return from local data
        const data = allMatchups[heroId.toString()] || allMatchups[heroId];
        return data || [];
    }
};
