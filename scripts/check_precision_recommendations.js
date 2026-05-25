import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const readJson = async relativePath => {
  const raw = await readFile(path.join(root, relativePath), 'utf8');
  return JSON.parse(raw);
};

const importTsDataModule = async relativePath => {
  const source = await readFile(path.join(root, relativePath), 'utf8');
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: false,
    },
  });

  return import(`data:text/javascript;base64,${Buffer.from(result.outputText).toString('base64')}`);
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

const traitPressure = count => Math.min(2, Math.max(1, 1 + (count - 1) * 0.25));

const buildEnemyTraitCounts = (enemyIds, HERO_TAGS) => {
  const counts = new Map();

  for (const enemyId of enemyIds) {
    for (const [tag, heroIds] of Object.entries(HERO_TAGS)) {
      if (!heroIds.includes(enemyId)) continue;
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return counts;
};

const applyHeuristic = ({ candidateId, enemyTraitCounts, COUNTER_TAGS, HEURISTIC_WEIGHTS }) => {
  const reasons = [];
  let bonus = 0;

  const add = (enemyTag, counterTag, weight, reason) => {
    const enemyCount = enemyTraitCounts.get(enemyTag) ?? 0;
    if (enemyCount === 0 || !COUNTER_TAGS[counterTag]?.includes(candidateId)) return;

    bonus += weight * traitPressure(enemyCount);
    if (!reasons.includes(reason)) reasons.push(reason);
  };

  add('ILLUSIONIST', 'ANTI_ILLUSION', HEURISTIC_WEIGHTS.ANTI_ILLUSION, 'AoE vs Multiple Units');
  add('SUMMONER', 'ANTI_ILLUSION', HEURISTIC_WEIGHTS.ANTI_ILLUSION, 'AoE vs Multiple Units');
  add('HEALER', 'ANTI_HEALER', HEURISTIC_WEIGHTS.ANTI_HEALER, 'Cuts Healing');
  add('TANKY_CORE', 'ANTI_TANK', HEURISTIC_WEIGHTS.ANTI_TANK, 'Counters Tanks');
  add('INVISIBILITY', 'ANTI_INVIS', HEURISTIC_WEIGHTS.ANTI_INVIS, 'Reveals invis heroes');
  add('ESCAPE', 'ANTI_ESCAPE', HEURISTIC_WEIGHTS.ANTI_ESCAPE, 'Catches mobile heroes');
  add('ESCAPE', 'LOCKDOWN', HEURISTIC_WEIGHTS.LOCKDOWN, 'Reliable lockdown');
  add('PICKOFF', 'ANTI_PICKOFF', HEURISTIC_WEIGHTS.ANTI_PICKOFF, 'Stops pickoffs');

  return { bonus, reasons };
};

const calculateDraftRecommendations = ({
  heroes,
  allMatchups,
  heroPositions,
  enemyIds,
  targetRole,
  HERO_TAGS,
  COUNTER_TAGS,
  HEURISTIC_WEIGHTS,
}) => {
  const enemyIdSet = new Set(enemyIds);
  const heroesById = new Map(heroes.map(hero => [hero.id, hero]));
  const enemyTraitCounts = buildEnemyTraitCounts(enemyIds, HERO_TAGS);
  const scores = new Map();
  let enemiesWithData = 0;

  for (const enemyId of enemyIds) {
    const rows = resolveMatchupsForHero(allMatchups, enemyId);
    if (rows.some(row => row.games_played >= 10)) enemiesWithData += 1;

    for (const row of rows) {
      if (row.games_played < 10 || enemyIdSet.has(row.hero_id)) continue;

      const hero = heroesById.get(row.hero_id);
      if (!hero) continue;

      const heroRoles = heroPositions.get(hero.id);
      if (!heroRoles?.includes(targetRole)) continue;

      const baseline = hero.pro_pick > 0 ? (hero.pro_win || 0) / hero.pro_pick : 0.5;
      const candidateWinRate = 1 - row.wins / row.games_played;
      const current = scores.get(hero.id) || {
        totalAdvantage: 0,
        totalWinRate: 0,
        matchCount: 0,
        heuristicBonus: 0,
        reasons: [],
      };

      if (current.matchCount === 0) {
        const heuristic = applyHeuristic({
          candidateId: hero.id,
          enemyTraitCounts,
          COUNTER_TAGS,
          HEURISTIC_WEIGHTS,
        });
        current.heuristicBonus = heuristic.bonus;
        current.reasons.push(...heuristic.reasons);
      }

      current.totalAdvantage += candidateWinRate - baseline;
      current.totalWinRate += candidateWinRate;
      current.matchCount += 1;
      scores.set(hero.id, current);
    }
  }

  const threshold = Math.max(1, Math.ceil(Math.max(1, enemiesWithData) * 0.5));

  return [...scores.entries()]
    .filter(([, score]) => score.matchCount >= threshold)
    .map(([heroId, score]) => {
      const hero = heroesById.get(heroId);
      return {
        hero,
        score: ((score.totalAdvantage / score.matchCount) + score.heuristicBonus) * 100,
        roles: heroPositions.get(heroId),
        reasons: [...new Set(score.reasons)],
      };
    })
    .sort((a, b) => b.score - a.score);
};

const heroes = await readJson('src/data/heroes.json');
const allMatchups = await readJson('src/data/all_matchups.json');
const heroPositions = await parseHeroPositions();
const { HERO_TAGS, COUNTER_TAGS } = await importTsDataModule('src/data/heroTags.ts');
const { HEURISTIC_WEIGHTS } = await importTsDataModule('src/config/heuristics.ts');

const stealthPickoffDraft = [32, 62, 56, 63, 9]; // Riki, Bounty Hunter, Clinkz, Weaver, Mirana
const expectations = [
  { role: 'Offlane', heroId: 28, name: 'Slardar', maxRank: 3 },
  { role: 'Mid', heroId: 22, name: 'Zeus', maxRank: 5 },
  { role: 'HardSupport', heroId: 87, name: 'Disruptor', maxRank: 5 },
];

const failures = [];
const summaries = [];

for (const expectation of expectations) {
  const recommendations = calculateDraftRecommendations({
    heroes,
    allMatchups,
    heroPositions,
    enemyIds: stealthPickoffDraft,
    targetRole: expectation.role,
    HERO_TAGS,
    COUNTER_TAGS,
    HEURISTIC_WEIGHTS,
  });

  const rankIndex = recommendations.findIndex(recommendation => recommendation.hero.id === expectation.heroId);
  const topNames = recommendations.slice(0, 5).map(recommendation => recommendation.hero.localized_name).join(', ');

  summaries.push(`${expectation.role}: ${topNames}`);

  if (rankIndex === -1 || rankIndex + 1 > expectation.maxRank) {
    failures.push(
      `${expectation.name} should be top ${expectation.maxRank} for ${expectation.role}; got ${
        rankIndex === -1 ? 'missing' : `rank ${rankIndex + 1}`
      }. Top 5: ${topNames}`,
    );
  }
}

if (failures.length > 0) {
  console.error(`Precision recommendation guard failed for stealth pickoff draft:`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Precision recommendation guard passed for stealth pickoff draft. ${summaries.join(' | ')}`);
