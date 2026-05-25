import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const readJson = async relativePath => {
  const raw = await readFile(path.join(root, relativePath), 'utf8');
  return JSON.parse(raw);
};

const parseHeroPositions = async () => {
  const text = await readFile(path.join(root, 'src/data/heroPositions.ts'), 'utf8');
  const entries = new Map();

  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*(\d+):\s*\[([^\]]*)\],/);
    if (!match) continue;

    entries.set(
      Number(match[1]),
      [...match[2].matchAll(/'([^']+)'/g)].map(roleMatch => roleMatch[1]),
    );
  }

  return entries;
};

const fallbackRoles = hero => {
  const positions = [];
  const apiRoles = hero.roles;
  const isUniversal = hero.primary_attr === 'all' || hero.primary_attr === 'universal';

  if (apiRoles.includes('Carry')) positions.push('Carry');

  if (apiRoles.includes('Support')) {
    const leansHardSupport = apiRoles.includes('Disabler') && !apiRoles.includes('Escape');
    positions.push(...(leansHardSupport ? ['HardSupport', 'SoftSupport'] : ['SoftSupport', 'HardSupport']));
  }

  if (apiRoles.includes('Nuker') && (hero.primary_attr === 'int' || isUniversal)) positions.push('Mid');
  if (apiRoles.includes('Initiator') && (hero.primary_attr === 'str' || isUniversal)) positions.push('Offlane');

  return positions.length > 0 ? [...new Set(positions)] : ['SoftSupport', 'HardSupport'];
};

const resolveMatchupsForHero = (allMatchups, heroId) => {
  const direct = allMatchups[String(heroId)] || allMatchups[heroId];
  if (direct && direct.length > 0) return direct;

  return Object.entries(allMatchups).flatMap(([sourceHeroId, rows]) => {
    const reverse = rows.find(row => row.hero_id === heroId);
    if (!reverse) return [];

    return [{
      hero_id: Number(sourceHeroId),
      games_played: reverse.games_played,
      wins: reverse.games_played - reverse.wins,
    }];
  });
};

const calculateDraftRecommendations = ({ heroes, allMatchups, heroPositions, enemyIds, targetRole }) => {
  const enemyIdSet = new Set(enemyIds);
  const heroesById = new Map(heroes.map(hero => [hero.id, hero]));
  const scores = new Map();
  let enemiesWithData = 0;

  for (const enemyId of enemyIds) {
    const rows = resolveMatchupsForHero(allMatchups, enemyId);
    if (rows.some(row => row.games_played >= 10)) enemiesWithData += 1;

    for (const row of rows) {
      if (row.games_played < 10 || enemyIdSet.has(row.hero_id)) continue;

      const hero = heroesById.get(row.hero_id);
      if (!hero) continue;

      const heroRoles = heroPositions.get(hero.id) ?? fallbackRoles(hero);
      if (!heroRoles.includes(targetRole)) continue;

      const baseline = hero.pro_pick > 0 ? (hero.pro_win || 0) / hero.pro_pick : 0.5;
      const candidateWinRate = 1 - row.wins / row.games_played;
      const current = scores.get(hero.id) || { totalAdvantage: 0, totalWinRate: 0, matchCount: 0 };

      current.totalAdvantage += candidateWinRate - baseline;
      current.totalWinRate += candidateWinRate;
      current.matchCount += 1;
      scores.set(hero.id, current);
    }
  }

  const threshold = Math.max(1, Math.ceil(Math.max(1, enemiesWithData) * 0.5));

  return [...scores.entries()]
    .filter(([, score]) => score.matchCount >= threshold)
    .map(([heroId, score]) => ({
      hero: heroesById.get(heroId),
      roles: heroPositions.get(heroId) ?? fallbackRoles(heroesById.get(heroId)),
      score: (score.totalAdvantage / score.matchCount) * 100,
      matchCount: score.matchCount,
    }))
    .sort((a, b) => b.score - a.score);
};

const heroes = await readJson('src/data/heroes.json');
const allMatchups = await readJson('src/data/all_matchups.json');
const heroPositions = await parseHeroPositions();
const targetRoles = ['Carry', 'Mid', 'Offlane', 'SoftSupport', 'HardSupport'];
const sampleDraftIds = [1, 13, 14]; // Anti-Mage, Puck, Pudge
const results = [];

for (const targetRole of targetRoles) {
  const recommendations = calculateDraftRecommendations({
    heroes,
    allMatchups,
    heroPositions,
    enemyIds: sampleDraftIds,
    targetRole,
  });

  if (recommendations.length === 0) {
    console.error(`No recommendations for target role ${targetRole}.`);
    process.exit(1);
  }

  const offRolePick = recommendations.slice(0, 10).find(recommendation => !recommendation.roles.includes(targetRole));
  if (offRolePick) {
    console.error(`Off-role recommendation for ${targetRole}: ${offRolePick.hero.localized_name} (${offRolePick.roles.join(', ')})`);
    process.exit(1);
  }

  results.push(`${targetRole}: ${recommendations[0].hero.localized_name}`);
}

console.log(`Role recommendation guard passed for sample draft: ${results.join(', ')}.`);
