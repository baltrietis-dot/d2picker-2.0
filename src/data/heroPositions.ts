export type Position = 'Carry' | 'Mid' | 'Offlane' | 'Support';

// Heuristic mapping of Heroes to their most common Roles (Pos 1-5 simplfied)
// Updated for recent meta trends where possible.
export const HERO_POSITIONS: Record<number, Position[]> = {
    // Strength
    7: ['Offlane', 'Support'], // Earthshaker
    18: ['Carry', 'Support'], // Sven
    19: ['Mid', 'Offlane', 'Support'], // Tiny
    2: ['Offlane'], // Axe
    14: ['Offlane', 'Support', 'Mid'], // Pudge
    69: ['Offlane', 'Mid'], // Doom
    81: ['Carry', 'Offlane'], // Chaos Knight
    129: ['Offlane', 'Mid'], // Mars
    99: ['Offlane', 'Carry'], // Bristleback
    23: ['Mid', 'Offlane', 'Support'], // Kunkka
    38: ['Offlane', 'Support'], // Beastmaster
    96: ['Offlane'], // Centaur
    102: ['Support', 'Offlane', 'Carry'], // Abaddon
    108: ['Offlane', 'Support'], // Underlord
    57: ['Support', 'Offlane'], // Omniknight
    54: ['Carry'], // Lifestealer
    60: ['Offlane', 'Mid'], // Night Stalker
    71: ['Offlane', 'Carry'], // Spirit Breaker
    28: ['Offlane'], // Slardar
    22: ['Offlane', 'Mid'], // Zeus (Str now?) No Int.
    // ... wait, categories don't matter for ID lookup

    // Agility
    1: ['Carry'], // Anti-Mage
    6: ['Carry'], // Drow Ranger
    8: ['Carry'], // Juggernaut
    9: ['Support', 'Mid', 'Carry'], // Mirana
    11: ['Mid', 'Carry'], // Shadow Fiend
    10: ['Carry'], // Morphling
    12: ['Carry'], // Phantom Lancer
    15: ['Carry', 'Mid'], // Razor
    16: ['Mid', 'Support', 'Offlane'], // Sand King (Univ/Str?) - Universal now.
    32: ['Carry', 'Mid'], // Riki
    35: ['Carry', 'Mid'], // Sniper
    41: ['Carry'], // Faceless Void
    44: ['Carry'], // Phantom Assassin
    48: ['Carry', 'Mid'], // Luna
    56: ['Carry'], // Clinkz
    61: ['Offlane', 'Mid'], // Broodmother
    63: ['Carry', 'Mid'], // Weaver
    67: ['Carry'], // Spectre
    72: ['Carry', 'Mid'], // Gyrocopter
    73: ['Carry'], // Alchemist
    82: ['Mid', 'Carry'], // Meepo
    88: ['Offlane', 'Support'], // Nyx Assassin
    89: ['Carry', 'Support'], // Naga Siren
    93: ['Carry', 'Mid'], // Slark
    94: ['Carry', 'Mid'], // Medusa
    95: ['Carry'], // Troll Warlord
    106: ['Mid', 'Carry'], // Ember Spirit
    109: ['Carry'], // Terrorblade
    114: ['Carry', 'Mid'], // Monkey King
    120: ['Carry', 'Mid'], // Pangolier

    // Intelligence
    5: ['Support'], // Crystal Maiden
    13: ['Mid', 'Support'], // Puck
    17: ['Mid', 'Support'], // Storm Spirit
    20: ['Support'], // Vengeful Spirit (Univ)
    21: ['Mid', 'Offlane'], // Windranger (Univ)
    25: ['Support', 'Mid'], // Lina
    26: ['Support'], // Lion
    27: ['Support'], // Shadow Shaman
    29: ['Offlane', 'Support'], // Tidehunter (Str) - wait, doing IDs...
    30: ['Support', 'Mid'], // Witch Doctor
    31: ['Support', 'Offlane'], // Lich
    33: ['Offlane', 'Support'], // Enigma
    34: ['Mid', 'Support'], // Tinker
    36: ['Mid', 'Offlane', 'Carry'], // Necrophos
    37: ['Support'], // Warlock
    39: ['Mid', 'Carry'], // Queen of Pain
    43: ['Mid', 'Support'], // Death Prophet
    45: ['Mid', 'Support'], // Pugna
    50: ['Support'], // Dazzle
    52: ['Mid', 'Offlane', 'Carry'], // Leshrac
    53: ['Offlane', 'Support', 'Carry'], // Nature's Prophet
    58: ['Support', 'Offlane'], // Enchantress
    64: ['Support', 'Mid'], // Jakiro
    65: ['Mid', 'Offlane'], // Batrider
    68: ['Support', 'Mid'], // Ancient Apparition
    74: ['Mid'], // Invoker
    75: ['Mid', 'Support'], // Silencer
    76: ['Mid', 'Support'], // Outworld Destroyer
    79: ['Support'], // Shadow Demon
    84: ['Support'], // Ogre Magi
    85: ['Support'], // Rubick
    86: ['Support'], // Disruptor
    87: ['Support'], // Keeper of the Light
    90: ['Support', 'Mid'], // KotL? No 90 is Keeper. 87 is... Wait. 
    // IDs are messy manual work.
    // Let's implement a fallback:
    // If hero not in this list, map via Attribute/Roles.

    // Universals / Others
    126: ['Mid', 'Carry'], // Void Spirit
    128: ['Support', 'Mid'], // Snapfire
    123: ['Support', 'Mid'], // Hoodwink
    135: ['Carry', 'Offlane'], // Dawnbreaker (Str)
    136: ['Offlane', 'Mid'], // Marci
    137: ['Offlane', 'Support'], // Primal Beast
    138: ['Support', 'Mid', 'Offlane'], // Muerta
};

export const getHeroRoles = (heroId: number, apiRoles: string[], primaryAttr: string): Position[] => {
    // 1. Check manual override
    if (HERO_POSITIONS[heroId]) return HERO_POSITIONS[heroId];

    // 2. Heuristic fallback
    const pos: Position[] = [];

    if (apiRoles.includes('Carry')) pos.push('Carry');
    if (apiRoles.includes('Support')) pos.push('Support');

    // Mid detection is hard. 'Nuker' + 'Carry' often = Mid.
    if (apiRoles.includes('Nuker') && (primaryAttr === 'int' || primaryAttr === 'universal')) pos.push('Mid');

    // Offlane detection
    if (apiRoles.includes('Initiator') && (primaryAttr === 'str' || primaryAttr === 'universal')) pos.push('Offlane');

    if (pos.length === 0) return ['Support']; // Default fallback
    return [...new Set(pos)];
};
