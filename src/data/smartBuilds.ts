
import type { Position } from './heroPositions';

export interface ItemRecommendation {
    id: string; // internal id or name
    name: string;
    img: string; // We will use a reliable CDN path or local if available. 
    // Dota 2 Wiki CDN: https://liquipedia.net/commons/images/dota2/f/f8/Black_King_Bar_icon.png
    // Or we can use the valve CDN used in the API: 
    // https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/{item_name}.png
    reason: string;
}

export interface SkillPriority {
    skillName: string; // Generic like "Stun", "Nuke", or specific if we had data. 
    // Since we don't have per-hero skill names easily, we might fallback to "Max First Ability" or heuristics.
    reason: string;
}

const CDN_ITEM_BASE = 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items';

// Known Item Map to CDN Name
const ITEMS = {
    BKB: { name: 'Black King Bar', img: 'black_king_bar.png' },
    BLINK: { name: 'Blink Dagger', img: 'blink.png' },
    DUST: { name: 'Dust of Appearance', img: 'dust.png' },
    SENTRY: { name: 'Sentry Ward', img: 'ward_sentry.png' },
    GEM: { name: 'Gem of True Sight', img: 'gem.png' },
    MKB: { name: 'Monkey King Bar', img: 'monkey_king_bar.png' },
    PIPE: { name: 'Pipe of Insight', img: 'pipe.png' },
    CRIMSON: { name: 'Crimson Guard', img: 'crimson_guard.png' },
    VESSEL: { name: 'Spirit Vessel', img: 'spirit_vessel.png' },
    SHIVA: { name: "Shiva's Guard", img: 'shivas_guard.png' },
    LOTUS: { name: 'Lotus Orb', img: 'lotus_orb.png' },
    EULS: { name: "Eul's Scepter", img: 'cyclone.png' },
    FORCE: { name: 'Force Staff', img: 'force_staff.png' },
    GLIMMER: { name: 'Glimmer Cape', img: 'glimmer_cape.png' },
    MJOLNIR: { name: 'Mjollnir', img: 'mjollnir.png' },
    RADIANCE: { name: 'Radiance', img: 'radiance.png' },
    BLOODTHORN: { name: 'Bloodthorn', img: 'bloodthorn.png' },
    SILVER_EDGE: { name: 'Silver Edge', img: 'silver_edge.png' },
    SKADI: { name: 'Eye of Skadi', img: 'skadi.png' },
    GHOST: { name: 'Ghost Scepter', img: 'ghost.png' },
    HALBERD: { name: "Heaven's Halberd", img: 'heavens_halberd.png' },
    LINKENS: { name: "Linken's Sphere", img: 'sphere.png' },
};

interface ItemRecommendationContext {
    targetRole: Position | 'Any';
    heroRoles: Position[];
    heroApiRoles: string[];
    heroAttackType: string;
}

const SUPPORT_ROLES: Position[] = ['SoftSupport', 'HardSupport'];
const CORE_ROLES: Position[] = ['Carry', 'Mid', 'Offlane'];

const isSupportRole = (role: Position): boolean => SUPPORT_ROLES.includes(role);
const isCoreRole = (role: Position): boolean => CORE_ROLES.includes(role);

const resolveRole = (targetRole: Position | 'Any', heroRoles: Position[]): Position => {
    if (targetRole !== 'Any') return targetRole;
    return heroRoles[0] ?? 'SoftSupport';
};

const hasApiRole = (apiRoles: string[], role: string): boolean => apiRoles.includes(role);

const uniqueRecommendations = (items: ItemRecommendation[]): ItemRecommendation[] => {
    const seen = new Set<string>();
    return items.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });
};

// Map Enemy Traits/Tags to Recommended Items
// Traits come from heroTags.ts. Keep this deliberately conservative: item
// suggestions should be plausible for the selected role, not just the API tags.

export const recommendItems = (
    enemyTraits: Set<string>,
    context: ItemRecommendationContext
): ItemRecommendation[] => {
    const recs: ItemRecommendation[] = [];
    const resolvedRole = resolveRole(context.targetRole, context.heroRoles);
    const isSupport = isSupportRole(resolvedRole);
    const isCore = isCoreRole(resolvedRole);
    const isCarry = resolvedRole === 'Carry';
    const isMid = resolvedRole === 'Mid';
    const isOfflane = resolvedRole === 'Offlane';
    const isHardSupport = resolvedRole === 'HardSupport';
    const isSoftSupport = resolvedRole === 'SoftSupport';
    const canBuyAuraItems = isOfflane || isSoftSupport || isHardSupport;
    const canBuySupportAuras = isOfflane || isSoftSupport;
    const isFightStarter = hasApiRole(context.heroApiRoles, 'Initiator');
    const isDisabler = hasApiRole(context.heroApiRoles, 'Disabler');
    const isDurable = hasApiRole(context.heroApiRoles, 'Durable');
    const isFrontliner = isFightStarter || isOfflane || context.heroRoles.includes('Offlane');
    const isBacklineSupport = isSupport && !isFrontliner && !context.heroRoles.some(role => CORE_ROLES.includes(role));
    const canBuySaveItems = isHardSupport || isBacklineSupport;
    const isRightClickCore = isCarry || (isMid && hasApiRole(context.heroApiRoles, 'Carry'));
    const canBuyCatchItems = isFightStarter || (isDisabler && (isMid || isOfflane || isSoftSupport));
    const canBuyUtilityItems = isSupport || isOfflane || isMid;
    const canBuyFrontlineItems = isOfflane || (isMid && (isFightStarter || isDurable));

    const isAllowedItem = (id: string): boolean => {
        switch (id) {
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

    const add = (item: Omit<ItemRecommendation, 'id' | 'reason'>, id: string, reason: string) => {
        if (!isAllowedItem(id)) return;
        recs.push({ ...item, id, reason });
    };

    // 1. High Magic Damage Enemies
    if (enemyTraits.has('NUKE')) {
        if (canBuySaveItems) add(ITEMS.GLIMMER, 'glimmer', 'Save allies from magic burst');
        if (canBuyAuraItems) add(ITEMS.PIPE, 'pipe', 'Team magic resistance');
        if (isCore) add(ITEMS.BKB, 'bkb', 'Protect your initiation from burst');
    }

    // 2. Evasion Enemies (PA, Windranger)
    if (enemyTraits.has('EVASION')) {
        if (isRightClickCore && context.heroAttackType !== 'Melee') {
            add(ITEMS.MKB, 'mkb', 'Counter evasion with true strike');
            add(ITEMS.BLOODTHORN, 'bloodthorn', 'Silence evasive cores');
        } else if (isRightClickCore) {
            add(ITEMS.MKB, 'mkb', 'Reliable hits against evasion');
        }
    }

    // 3. Mobile drafts. Fight starters need catch before defensive luxuries.
    if (enemyTraits.has('ESCAPE')) {
        if (isFightStarter) {
            add(ITEMS.BLINK, 'blink', 'Start fights before mobile heroes reset');
            add(ITEMS.EULS, 'euls', 'Set up or interrupt elusive heroes');
        } else if (isCore && hasApiRole(context.heroApiRoles, 'Disabler')) {
            add(ITEMS.EULS, 'euls', 'Interrupt elusive heroes');
        }
    }

    // 4. Invisibility and pickoff drafts
    if (enemyTraits.has('INVISIBILITY')) {
        add(ITEMS.DUST, 'dust', 'Reveal invis heroes during pickoffs');
        add(ITEMS.SENTRY, 'sentry', 'Control common invis paths');
        add(ITEMS.GEM, 'gem', 'Hold map control with durable reveal');
    }

    if (enemyTraits.has('PICKOFF')) {
        if (isSupport) {
            add(ITEMS.FORCE, 'force', 'Break pickoff chains');
            add(ITEMS.GHOST, 'ghost', 'Survive physical burst from pickoffs');
        } else if (isFightStarter) {
            add(ITEMS.BLINK, 'blink', 'Start first before pickoff heroes choose fights');
        }
    }

    // 5. Illusion/Summon Spammers (PL, Naga)
    if (enemyTraits.has('ILLUSIONIST') || enemyTraits.has('SUMMONER')) {
        if (isCarry) {
            add(ITEMS.MJOLNIR, 'mjolnir', 'Clear illusions quickly');
            add(ITEMS.RADIANCE, 'radiance', 'Burn grouped units');
        } else if (isCore || (isFightStarter && !isSupport)) {
            add(ITEMS.SHIVA, 'shiva', 'AoE slow and illusion clear');
            if (canBuyAuraItems) add(ITEMS.CRIMSON, 'crimson', 'Block summon and illusion chip damage');
        } else if (isSupport) {
            add(ITEMS.FORCE, 'force', 'Create distance from swarms');
            if (canBuyAuraItems) add(ITEMS.PIPE, 'pipe', 'Protect the team in grouped fights');
        }
    }

    // 6. Heavy Physical/Right Clickers (Ursa, PA, Sniper)
    if (enemyTraits.has('CARRY')) { // Assuming 'CARRY' implies heavy physical in our tag system
        if (isSupport) {
            add(ITEMS.GHOST, 'ghost', 'Immunity to physical attacks');
            add(ITEMS.FORCE, 'force', 'Kite melee carries');
        } else if (isOfflane) {
            add(ITEMS.SHIVA, 'shiva', 'Reduce attack speed');
            add(ITEMS.HALBERD, 'halberd', 'Disarm heavy hitters');
        } else if (isMid && (isFightStarter || isDurable)) {
            add(ITEMS.SHIVA, 'shiva', 'Reduce attack speed in extended fights');
        } else if (isCarry) {
            add(ITEMS.SKADI, 'skadi', 'Slow and kite enemy carries');
        }
    }

    // 7. Stunning/Lockdown Heavy
    if (enemyTraits.has('STUNNER') || enemyTraits.has('INITIATOR')) {
        if (isSupport) {
            add(ITEMS.FORCE, 'force', 'Reposition through initiation');
            add(ITEMS.LOTUS, 'lotus', 'Dispel stuns and silences');
        } else if (isOfflane) {
            add(ITEMS.BKB, 'bkb', 'Avoid getting locked down');
            add(ITEMS.LOTUS, 'lotus', 'Dispel silences after committing');
            add(ITEMS.LINKENS, 'linkens', 'Block single-target initiation');
        } else if (isCore) {
            add(ITEMS.BKB, 'bkb', 'Avoid getting locked down');
            add(ITEMS.LINKENS, 'linkens', 'Block single-target initiation');
        }
    }

    // 8. Tanky/Healers
    if (enemyTraits.has('HEALER') || enemyTraits.has('TANKY_CORE')) {
        add(ITEMS.VESSEL, 'vessel', 'Reduce healing and punish high HP heroes');
        if (isRightClickCore) add(ITEMS.SILVER_EDGE, 'silver', 'Break passives on tanky cores');
        if (isCarry) add(ITEMS.SKADI, 'skadi', 'Reduce healing on durable enemies');
        if (isOfflane || (isFightStarter && isCore)) add(ITEMS.SHIVA, 'shiva', 'Slow durable heroes in long fights');
    }

    // Filter and Format
    return uniqueRecommendations(recs).slice(0, 4).map(item => ({
        ...item,
        img: `${CDN_ITEM_BASE}/${item.img}`
    }));
};

export const recommendSkillStrategy = (enemyTraits: Set<string>): string[] => {
    const strategies: string[] = [];

    if (enemyTraits.has('ILLUSIONIST')) {
        strategies.push("Prioritize AoE spells to clear illusions.");
    }
    if (enemyTraits.has('NUKE')) {
        strategies.push("Hold defensive cooldowns for their burst.");
    }
    if (enemyTraits.has('ESCAPE')) {
        strategies.push("Focus on instant stuns/silences.");
    }

    if (strategies.length === 0) {
        strategies.push("Balance farm and fighting based on power spikes.");
    }

    return strategies;
};
