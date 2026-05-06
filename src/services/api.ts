
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

export interface ItemBucket {
    id: number;
    games: number;
}

export interface HeroBuild {
    start: ItemBucket[];
    early: ItemBucket[];
    mid: ItemBucket[];
    late: ItemBucket[];
}

export interface DurationBin {
    winRate: number;
    games: number;
}

export type HeroDurations = Record<string, DurationBin>;

export interface ItemMeta {
    key: string;
    name: string;
    img: string;   // Path starting with /apps/dota2/... — prepend CDN_BASE_URL when rendering
    cost: number;
}

export type ItemsMap = Record<string, ItemMeta>;

// Lazy-loaded matchups — not bundled in the initial chunk
let matchupsCache: Record<string, Matchup[]> | null = null;
let buildsCache: Record<string, HeroBuild> | null = null;
let durationsCache: Record<string, HeroDurations> | null = null;
let itemsCache: ItemsMap | null = null;

const loadMatchups = async (): Promise<Record<string, Matchup[]>> => {
    if (!matchupsCache) {
        const raw = await import('../data/all_matchups.json');
        matchupsCache = raw.default as unknown as Record<string, Matchup[]>;
    }
    return matchupsCache;
};

const loadBuilds = async (): Promise<Record<string, HeroBuild>> => {
    if (!buildsCache) {
        try {
            const raw = await import('../data/hero_builds.json');
            buildsCache = raw.default as unknown as Record<string, HeroBuild>;
        } catch {
            buildsCache = {};
        }
    }
    return buildsCache;
};

const loadDurations = async (): Promise<Record<string, HeroDurations>> => {
    if (!durationsCache) {
        try {
            const raw = await import('../data/hero_durations.json');
            durationsCache = raw.default as unknown as Record<string, HeroDurations>;
        } catch {
            durationsCache = {};
        }
    }
    return durationsCache;
};

const loadItems = async (): Promise<ItemsMap> => {
    if (!itemsCache) {
        try {
            const raw = await import('../data/items.json');
            itemsCache = raw.default as unknown as ItemsMap;
        } catch {
            itemsCache = {};
        }
    }
    return itemsCache;
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
    },

    fetchBuild: async (heroId: number): Promise<HeroBuild | null> => {
        const allBuilds = await loadBuilds();
        return allBuilds[heroId.toString()] || allBuilds[heroId] || null;
    },

    fetchDurations: async (heroId: number): Promise<HeroDurations> => {
        const allDurations = await loadDurations();
        return allDurations[heroId.toString()] || allDurations[heroId] || {};
    },

    fetchItems: async (): Promise<ItemsMap> => {
        return loadItems();
    },

    resolveItemImg: (meta: ItemMeta | undefined): string => {
        if (!meta) return '';
        if (meta.img.startsWith('http')) return meta.img;
        return `${CDN_BASE_URL}${meta.img}`;
    }
};
