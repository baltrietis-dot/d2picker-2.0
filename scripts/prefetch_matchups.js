
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HEROES_PATH = path.join(__dirname, '../src/data/heroes.json');
const MATCHUPS_OUTPUT_PATH = path.join(__dirname, '../src/data/all_matchups.json');

// Simple delay to respect API rate limits
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchAllMatchups() {
    try {
        const heroesRaw = fs.readFileSync(HEROES_PATH, 'utf-8');
        const heroes = JSON.parse(heroesRaw);

        console.log(`Found ${heroes.length} heroes. Starting fetch...`);
        const allMatchups = {};

        for (let i = 0; i < heroes.length; i++) {
            const hero = heroes[i];
            console.log(`[${i + 1}/${heroes.length}] Fetching matchups for ${hero.localized_name} (ID: ${hero.id})...`);

            try {
                const response = await axios.get(`https://api.opendota.com/api/heroes/${hero.id}/matchups`);
                allMatchups[hero.id] = response.data;
                // Wait 100ms between requests to be nice to OpenDota
                await delay(200);
            } catch (err) {
                console.error(`Failed to fetch for ${hero.localized_name}:`, err.message);
            }
        }

        fs.writeFileSync(MATCHUPS_OUTPUT_PATH, JSON.stringify(allMatchups));
        console.log(`Done! Saved all matchups to ${MATCHUPS_OUTPUT_PATH}`);

    } catch (error) {
        console.error("Fatal error:", error);
    }
}

fetchAllMatchups();
