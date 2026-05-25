import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Buffer } from 'node:buffer';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SUPPORT_ROLES = new Set(['SoftSupport', 'HardSupport']);
const CORE_ROLES = new Set(['Carry', 'Mid', 'Offlane']);

const scenarios = [
  { name: 'magic burst', traits: ['NUKE'] },
  { name: 'evasion carry', traits: ['EVASION', 'CARRY'] },
  { name: 'illusion swarm', traits: ['ILLUSIONIST', 'SUMMONER'] },
  { name: 'physical carry', traits: ['CARRY'] },
  { name: 'lockdown', traits: ['STUNNER'] },
  { name: 'sustain tanks', traits: ['HEALER', 'TANKY_CORE'] },
  { name: 'mobile tank carry', traits: ['ESCAPE', 'CARRY', 'TANKY_CORE'] },
  { name: 'invis pickoff', traits: ['INVISIBILITY', 'PICKOFF', 'ESCAPE', 'CARRY'] },
  {
    name: 'stress mix',
    traits: ['NUKE', 'EVASION', 'ILLUSIONIST', 'SUMMONER', 'INVISIBILITY', 'PICKOFF', 'CARRY', 'ESCAPE', 'STUNNER', 'HEALER', 'TANKY_CORE'],
  },
];

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

const loadSmartBuilds = async () => {
  const source = await readFile(path.join(root, 'src/data/smartBuilds.ts'), 'utf8');
  const result = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
      verbatimModuleSyntax: false,
    },
  });

  return import(`data:text/javascript;base64,${Buffer.from(result.outputText).toString('base64')}`);
};

const hasApiRole = (hero, role) => hero.roles.includes(role);

const isAllowedItem = ({ itemId, role, heroRoles, hero }) => {
  const isSupport = SUPPORT_ROLES.has(role);
  const isCore = CORE_ROLES.has(role);
  const isCarry = role === 'Carry';
  const isMid = role === 'Mid';
  const isOfflane = role === 'Offlane';
  const isHardSupport = role === 'HardSupport';
  const isSoftSupport = role === 'SoftSupport';
  const canBuyAuraItems = isOfflane || isSoftSupport || isHardSupport;
  const canBuySupportAuras = isOfflane || isSoftSupport;
  const isFightStarter = hasApiRole(hero, 'Initiator');
  const isDisabler = hasApiRole(hero, 'Disabler');
  const isDurable = hasApiRole(hero, 'Durable');
  const isFrontliner = isFightStarter || isOfflane || heroRoles.includes('Offlane');
  const hasCoreFlex = heroRoles.some(heroRole => CORE_ROLES.has(heroRole));
  const isBacklineSupport = isSupport && !isFrontliner && !hasCoreFlex;
  const canBuySaveItems = isHardSupport || isBacklineSupport;
  const isRightClickCore = isCarry || (isMid && hasApiRole(hero, 'Carry'));
  const canBuyCatchItems = isFightStarter || (isDisabler && (isMid || isOfflane || isSoftSupport));
  const canBuyUtilityItems = isSupport || isOfflane || isMid;
  const canBuyFrontlineItems = isOfflane || (isMid && (isFightStarter || isDurable));

  switch (itemId) {
    case 'glimmer':
      return canBuySaveItems;
    case 'dust':
      return true;
    case 'sentry':
      return isSupport;
    case 'gem':
      return isOfflane || isSoftSupport || (isMid && isFightStarter);
    case 'pipe':
      return canBuyAuraItems;
    case 'crimson':
      return canBuySupportAuras;
    case 'bkb':
    case 'linkens':
      return isCore;
    case 'blink':
      return canBuyCatchItems;
    case 'euls':
      return canBuyUtilityItems;
    case 'mkb':
    case 'bloodthorn':
    case 'silver':
      return isRightClickCore;
    case 'mjolnir':
    case 'radiance':
    case 'skadi':
      return isCarry;
    case 'ghost':
    case 'force':
      return isSupport;
    case 'halberd':
      return isOfflane;
    case 'lotus':
      return isOfflane || isSupport;
    case 'shiva':
      return canBuyFrontlineItems;
    case 'vessel':
      return !isCarry && canBuyUtilityItems;
    default:
      return false;
  }
};

const heroes = await readJson('src/data/heroes.json');
const heroPositions = await parseHeroPositions();
const { recommendItems } = await loadSmartBuilds();

const errors = [];
let checkedScenarios = 0;
let checkedItems = 0;

for (const hero of heroes) {
  const heroRoles = heroPositions.get(hero.id);

  if (!heroRoles || heroRoles.length === 0) {
    errors.push(`${hero.localized_name} has no manual roles for item recommendation audit.`);
    continue;
  }

  for (const role of heroRoles) {
    for (const scenario of scenarios) {
      checkedScenarios += 1;
      const items = recommendItems(new Set(scenario.traits), {
        targetRole: role,
        heroRoles,
        heroApiRoles: hero.roles,
        heroAttackType: hero.attack_type,
      });

      if (items.length > 4) {
        errors.push(`${hero.localized_name} ${role} ${scenario.name}: returned ${items.length} items.`);
      }

      const itemIds = items.map(item => item.id);
      const duplicate = itemIds.find((itemId, index) => itemIds.indexOf(itemId) !== index);
      if (duplicate) {
        errors.push(`${hero.localized_name} ${role} ${scenario.name}: duplicate ${duplicate}.`);
      }

      for (const item of items) {
        checkedItems += 1;
        if (!isAllowedItem({ itemId: item.id, role, heroRoles, hero })) {
          errors.push(`${hero.localized_name} ${role} ${scenario.name}: disallowed ${item.name} (${item.id}).`);
        }
      }
    }
  }
}

const sandKing = heroes.find(hero => hero.id === 16);
const sandKingRoles = heroPositions.get(16);
const sandKingOfflaneItems = recommendItems(new Set(['EVASION', 'CARRY', 'ESCAPE', 'TANKY_CORE']), {
  targetRole: 'Offlane',
  heroRoles: sandKingRoles,
  heroApiRoles: sandKing.roles,
  heroAttackType: sandKing.attack_type,
});
const sandKingOfflaneIds = sandKingOfflaneItems.map(item => item.id);

if (sandKingOfflaneIds.includes('glimmer')) {
  errors.push('Sand King Offlane regression: Glimmer Cape returned.');
}

if (!sandKingOfflaneIds.includes('blink')) {
  errors.push('Sand King Offlane regression: Blink Dagger missing against mobile enemies.');
}

if (errors.length > 0) {
  console.error(`Item recommendation guard failed with ${errors.length} issue(s):`);
  for (const error of errors.slice(0, 30)) console.error(`- ${error}`);
  if (errors.length > 30) console.error(`...and ${errors.length - 30} more.`);
  process.exit(1);
}

console.log(`Item recommendation guard passed: ${checkedScenarios} hero-role scenarios, ${checkedItems} item suggestions checked.`);
