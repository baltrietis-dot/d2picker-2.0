
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HEROES_PATH = path.join(__dirname, '../src/data/heroes.json');
const MATCHUPS_OUTPUT_PATH = path.join(__dirname, '../src/data/all_matchups.json');
const META_OUTPUT_PATH = path.join(__dirname, '../src/data/meta.json');
const BUILDS_OUTPUT_PATH = path.join(__dirname, '../src/data/hero_builds.json');
const DURATIONS_OUTPUT_PATH = path.join(__dirname, '../src/data/hero_durations.json');
const ITEMS_OUTPUT_PATH = path.join(__dirname, '../src/data/items.json');

// Simple delay to respect API rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Bucket item popularity data into early/mid/late purchase windows
function summariseItemBuilds(itemPopularityData) {
    const buckets = {
        start: itemPopularityData?.start_game_items || {},
        early: itemPopularityData?.early_game_items || {},
        mid: itemPopularityData?.mid_game_items || {},
        late: itemPopularityData?.late_game_items || {},
    };

    const reduce = (obj) => Object.entries(obj)
        .map(([id, games]) => ({ id: Number(id), games: Number(games) }))
        .sort((a, b) => b.games - a.games)
        .slice(0, 6); // top 6 per bucket

    return {
        start: reduce(buckets.start),
        early: reduce(buckets.early),
        mid: reduce(buckets.mid),
        late: reduce(buckets.late),
    };
}

// Bucket duration win rates into 10-minute windows
function summariseDurations(durationsData) {
    if (!Array.isArray(durationsData)) return {};
    const result = {};
    durationsData.forEach(d => {
        if (d.duration_bin !== undefined && d.games_played > 0) {
            result[String(d.duration_bin)] = {
                winRate: d.wins / d.games_played,
                games: d.games_played,
            };
        }
    });
    return result;
}

async function fetchAllData() {
    try {
        const heroesRaw = fs.readFileSync(HEROES_PATH, 'utf-8');
        const heroes = JSON.parse(heroesRaw);

        console.log(`Found ${heroes.length} heroes. Starting fetch...`);
        const allMatchups = {};
        const allBuilds = {};
        const allDurations = {};

        for (let i = 0; i < heroes.length; i++) {
            const hero = heroes[i];
            console.log(`[${i + 1}/${heroes.length}] Fetching data for ${hero.localized_name} (ID: ${hero.id})...`);

            // Matchups
            try {
                const res = await axios.get(`https://api.opendota.com/api/heroes/${hero.id}/matchups`);
                allMatchups[hero.id] = res.data;
                await delay(250);
            } catch (err) {
                console.error(`  Matchups failed: ${err.message}`);
            }

            // Item popularity (premium data)
            try {
                const res = await axios.get(`https://api.opendota.com/api/heroes/${hero.id}/itemPopularity`);
                allBuilds[hero.id] = summariseItemBuilds(res.data);
                await delay(250);
            } catch (err) {
                console.error(`  Item popularity failed: ${err.message}`);
            }

            // Duration win rates (power spike data — premium)
            try {
                const res = await axios.get(`https://api.opendota.com/api/heroes/${hero.id}/durations`);
                allDurations[hero.id] = summariseDurations(res.data);
                await delay(250);
            } catch (err) {
                console.error(`  Durations failed: ${err.message}`);
            }
        }

        fs.writeFileSync(MATCHUPS_OUTPUT_PATH, JSON.stringify(allMatchups));
        console.log(`✓ Matchups saved → ${MATCHUPS_OUTPUT_PATH}`);

        fs.writeFileSync(BUILDS_OUTPUT_PATH, JSON.stringify(allBuilds));
        console.log(`✓ Item builds saved → ${BUILDS_OUTPUT_PATH}`);

        fs.writeFileSync(DURATIONS_OUTPUT_PATH, JSON.stringify(allDurations));
        console.log(`✓ Durations saved → ${DURATIONS_OUTPUT_PATH}`);

        // Fetch current patch version
        try {
            const patchRes = await axios.get('https://api.opendota.com/api/constants/patch');
            const patches = patchRes.data;
            const latestPatch = patches[patches.length - 1]?.name ?? 'Unknown';
            const meta = { patch: latestPatch, updatedAt: new Date().toISOString() };
            fs.writeFileSync(META_OUTPUT_PATH, JSON.stringify(meta));
            console.log(`✓ Patch version: ${latestPatch}`);
        } catch (err) {
            console.error('Failed to fetch patch version:', err.message);
        }

        // Fetch items constants (id → name/img map) for the Strategy Guide
        try {
            const itemsRes = await axios.get('https://api.opendota.com/api/constants/items');
            const rawItems = itemsRes.data;
            // OpenDota returns items keyed by internal name. We invert to an ID-keyed map.
            const itemMap = {};
            Object.entries(rawItems).forEach(([internalName, data]) => {
                if (data && typeof data.id === 'number') {
                    itemMap[data.id] = {
                        key: internalName,
                        name: data.dname || internalName,
                        img: data.img || `/apps/dota2/images/dota_react/items/${internalName}.png`,
                        cost: data.cost || 0,
                    };
                }
            });
            fs.writeFileSync(ITEMS_OUTPUT_PATH, JSON.stringify(itemMap));
            console.log(`✓ Items constants saved → ${ITEMS_OUTPUT_PATH} (${Object.keys(itemMap).length} items)`);
        } catch (err) {
            console.error('Failed to fetch items constants:', err.message);
        }

    } catch (error) {
        console.error("Fatal error:", error);
    }
}

fetchAllData();
