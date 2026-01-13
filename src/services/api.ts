import axios from 'axios';

const API_BASE_URL = 'https://api.opendota.com/api';
// Using official Valve CDN for reliable images
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

const CACHE_KEY_HEROES = 'dota_heroes_cache_v3'; // Bump version
const CACHE_KEY_MATCHUPS = 'dota_matchups_cache_';
const CACHE_DURATION_HEROES = 24 * 60 * 60 * 1000;
const CACHE_DURATION_MATCHUPS = 60 * 60 * 1000;

import heroesUrl from '../data/heroes.json';

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
        const cacheKey = `${CACHE_KEY_MATCHUPS}${heroId}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION_MATCHUPS) {
                return data;
            }
        }

        try {
            const response = await axios.get<Matchup[]>(`${API_BASE_URL}/heroes/${heroId}/matchups`);
            const data = response.data;
            localStorage.setItem(cacheKey, JSON.stringify({ data, timestamp: Date.now() }));
            return data;
        } catch (error) {
            console.error(`Failed to fetch matchups for hero ${heroId}`, error);
            return [];
        }
    }
};
