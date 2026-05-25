import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const readJson = async (relativePath) => {
  const raw = await readFile(path.join(root, relativePath), 'utf8');
  return JSON.parse(raw);
};

const resolveMatchupsForHero = (allMatchups, heroId) => {
  const direct = allMatchups[String(heroId)] || allMatchups[heroId];
  if (direct && direct.length > 0) return direct;

  return Object.entries(allMatchups).flatMap(([sourceHeroId, rows]) => {
    const reverse = rows.find((row) => row.hero_id === heroId);
    if (!reverse) return [];

    return [{
      hero_id: Number(sourceHeroId),
      games_played: reverse.games_played,
      wins: reverse.games_played - reverse.wins,
    }];
  });
};

const calculateDraftRecommendations = (heroes, allMatchups, enemyIds) => {
  const enemyIdSet = new Set(enemyIds);
  const scores = new Map();
  let enemiesWithData = 0;

  for (const enemyId of enemyIds) {
    const rows = resolveMatchupsForHero(allMatchups, enemyId);
    if (rows.some((row) => row.games_played >= 10)) enemiesWithData += 1;

    for (const row of rows) {
      if (row.games_played < 10 || enemyIdSet.has(row.hero_id)) continue;

      const hero = heroes.find((candidate) => candidate.id === row.hero_id);
      const baseline = hero?.pro_pick > 0 ? (hero.pro_win || 0) / hero.pro_pick : 0.5;
      const candidateWinRate = 1 - row.wins / row.games_played;
      const current = scores.get(row.hero_id) || { totalAdvantage: 0, totalWinRate: 0, matchCount: 0 };

      current.totalAdvantage += candidateWinRate - baseline;
      current.totalWinRate += candidateWinRate;
      current.matchCount += 1;
      scores.set(row.hero_id, current);
    }
  }

  const threshold = Math.max(1, Math.ceil(Math.max(1, enemiesWithData) * 0.5));

  return [...scores.entries()]
    .filter(([, score]) => score.matchCount >= threshold)
    .map(([heroId, score]) => ({
      heroId,
      score: (score.totalAdvantage / score.matchCount) * 100,
      matchCount: score.matchCount,
    }))
    .sort((a, b) => b.score - a.score);
};

const heroes = await readJson('src/data/heroes.json');
const allMatchups = await readJson('src/data/all_matchups.json');

const heroesWithoutResolvableMatchups = heroes
  .filter((hero) => resolveMatchupsForHero(allMatchups, hero.id).length === 0)
  .map((hero) => `${hero.localized_name} (${hero.id})`);

if (heroesWithoutResolvableMatchups.length > 0) {
  console.error('Matchup data cannot be resolved for:');
  console.error(heroesWithoutResolvableMatchups.join('\n'));
  process.exit(1);
}

const screenshotDraftIds = [102, 68, 87]; // Abaddon, Ancient Apparition, Disruptor
const screenshotDraftRecommendations = calculateDraftRecommendations(heroes, allMatchups, screenshotDraftIds);

if (screenshotDraftRecommendations.length === 0) {
  console.error('Regression: Abaddon + Ancient Apparition + Disruptor produced no recommendations.');
  process.exit(1);
}

const topPick = heroes.find((hero) => hero.id === screenshotDraftRecommendations[0].heroId);
console.log(`Matchup guard passed: ${heroes.length} heroes resolvable, screenshot draft top pick ${topPick?.localized_name || screenshotDraftRecommendations[0].heroId}.`);
