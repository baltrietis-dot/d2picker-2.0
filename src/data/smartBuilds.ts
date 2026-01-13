
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
    MKB: { name: 'Monkey King Bar', img: 'monkey_king_bar.png' },
    PIPE: { name: 'Pipe of Insight', img: 'pipe.png' },
    VESSEL: { name: 'Spirit Vessel', img: 'spirit_vessel.png' },
    SHIVA: { name: "Shiva's Guard", img: 'shivas_guard.png' },
    LOTUS: { name: 'Lotus Orb', img: 'lotus_orb.png' },
    EUILS: { name: "Eul's Scepter", img: 'cyclone.png' },
    FORCE: { name: 'Force Staff', img: 'force_staff.png' },
    GLIMMER: { name: 'Glimmer Cape', img: 'glimmer_cape.png' },
    MJOLNIR: { name: 'Mjollnir', img: 'mjollnir.png' },
    RADIANCE: { name: 'Radiance', img: 'radiance.png' },
    BLOODTHORN: { name: 'Bloodthorn', img: 'bloodthorn.png' },
    SILVER_EDGE: { name: 'Silver Edge', img: 'silver_edge.png' },
    GHOST: { name: 'Ghost Scepter', img: 'ghost.png' },
    HALBERD: { name: "Heaven's Halberd", img: 'heavens_halberd.png' },
    LINKENS: { name: "Linken's Sphere", img: 'sphere.png' },
};

// Map Enemy Traits/Tags to Recommended Items
// We need to define some simple logic.
// Traits come from our 'heroTags.ts' (we'll need to export/use that logic or re-derive it)

export const recommendItems = (
    enemyTraits: Set<string>,
    heroRole: string,
    heroAttackType: string
): ItemRecommendation[] => {
    const recs: ItemRecommendation[] = [];

    const isSupport = heroRole === 'Support';
    const isCore = heroRole === 'Carry' || heroRole === 'Mid' || heroRole === 'Offlane';

    // 1. High Magic Damage Enemies
    if (enemyTraits.has('NUKE')) {
        if (isSupport) {
            recs.push({ ...ITEMS.GLIMMER, id: 'glimmer', reason: 'Save allies from magic burst' });
            recs.push({ ...ITEMS.PIPE, id: 'pipe', reason: 'Team magic resistance' });
        } else {
            recs.push({ ...ITEMS.BKB, id: 'bkb', reason: 'Essential vs Magic Burst' });
        }
    }

    // 2. Evasion Enemies (PA, Windranger)
    if (enemyTraits.has('EVASION')) {
        if (isCore && heroAttackType !== 'Mage') { // simplified check
            recs.push({ ...ITEMS.MKB, id: 'mkb', reason: 'Counter Evasion (True Strike)' });
            recs.push({ ...ITEMS.BLOODTHORN, id: 'bloodthorn', reason: 'Silences and pierces evasion' });
        }
    }

    // 3. Illusion/Summon Spammers (PL, Naga)
    if (enemyTraits.has('ILLUSIONIST') || enemyTraits.has('SUMMONER')) {
        if (isCore) {
            recs.push({ ...ITEMS.MJOLNIR, id: 'mjolnir', reason: 'Clear illusions quickly' });
            if (heroRole === 'Offlane') recs.push({ ...ITEMS.SHIVA, id: 'shiva', reason: 'AoE Slow & Damage' });
            if (heroRole === 'Carry') recs.push({ ...ITEMS.RADIANCE, id: 'radiance', reason: 'Burn illusions' });
        } else {
            recs.push({ ...ITEMS.GLIMMER, id: 'glimmer', reason: 'Hide from swarms' });
        }
    }

    // 4. Heavy Physical/Right Clickers (Ursa, PA, Sniper)
    if (enemyTraits.has('CARRY')) { // Assuming 'CARRY' implies heavy physical in our tag system
        if (isSupport) {
            recs.push({ ...ITEMS.GHOST, id: 'ghost', reason: 'Immunity to physical attacks' });
            recs.push({ ...ITEMS.FORCE, id: 'force', reason: 'Kite melee carries' });
        } else {
            recs.push({ ...ITEMS.SHIVA, id: 'shiva', reason: 'Reduce attack speed' });
            recs.push({ ...ITEMS.HALBERD, id: 'halberd', reason: 'Disarm heavy hitters' });
        }
    }

    // 5. Stunning/Lockdown Heavy
    if (enemyTraits.has('STUNNER') || enemyTraits.has('INITIATOR')) {
        if (isSupport) {
            recs.push({ ...ITEMS.LOTUS, id: 'lotus', reason: 'Dispel stuns/silences' });
        } else {
            recs.push({ ...ITEMS.BKB, id: 'bkb', reason: 'Avoid getting locked down' });
            recs.push({ ...ITEMS.LINKENS, id: 'linkens', reason: 'Block single target initiation' });
        }
    }

    // 6. Tanky/Healers
    if (enemyTraits.has('HEALER') || enemyTraits.has('TANKY_CORE')) {
        recs.push({ ...ITEMS.VESSEL, id: 'vessel', reason: 'Reduce healing & % HP damage' });
        if (isCore) {
            recs.push({ ...ITEMS.SILVER_EDGE, id: 'silver', reason: 'Break passives (Anti-Tank)' });
        }
    }

    // Filter and Format
    return recs.slice(0, 4).map(item => ({
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
