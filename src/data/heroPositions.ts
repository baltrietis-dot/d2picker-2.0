export type Position = 'Carry' | 'Mid' | 'Offlane' | 'SoftSupport' | 'HardSupport';

/** 1-based position number (1=Carry, 2=Mid, 3=Off, 4=Soft Sup, 5=Hard Sup) */
export type PositionNumber = 1 | 2 | 3 | 4 | 5;

export const ALL_POSITIONS: Position[] = ['Carry', 'Mid', 'Offlane', 'SoftSupport', 'HardSupport'];

export const POSITION_TO_NUMBER: Record<Position, PositionNumber> = {
    Carry: 1,
    Mid: 2,
    Offlane: 3,
    SoftSupport: 4,
    HardSupport: 5,
};

export const NUMBER_TO_POSITION: Record<PositionNumber, Position> = {
    1: 'Carry',
    2: 'Mid',
    3: 'Offlane',
    4: 'SoftSupport',
    5: 'HardSupport',
};

// ---------------------------------------------------------------------------
// Manual hero → position mapping.
// Split Support into Pos 4 (Soft / Roamer / Ganker) and Pos 5 (Hard Sup / Warder).
// When a hero is genuinely flexible, list both 4 and 5 (in lean order).
// Anything missing falls through to getHeroRoles() heuristic fallback.
// ---------------------------------------------------------------------------

export const HERO_POSITIONS: Record<number, Position[]> = {
    // Cores — Carry
    1:   ['Carry'],                                           // Anti-Mage
    6:   ['Carry'],                                           // Drow Ranger
    8:   ['Carry'],                                           // Juggernaut
    10:  ['Carry'],                                           // Morphling
    12:  ['Carry'],                                           // Phantom Lancer
    18:  ['Carry'],                                           // Sven
    32:  ['Carry', 'Mid'],                                    // Riki
    35:  ['Carry', 'Mid'],                                    // Sniper
    41:  ['Carry'],                                           // Faceless Void
    42:  ['Carry'],                                           // Wraith King
    44:  ['Carry'],                                           // Phantom Assassin
    48:  ['Carry', 'Mid'],                                    // Luna
    54:  ['Carry'],                                           // Lifestealer
    56:  ['Carry'],                                           // Clinkz
    67:  ['Carry'],                                           // Spectre
    70:  ['Carry', 'Offlane'],                                // Ursa
    73:  ['Carry'],                                           // Alchemist
    93:  ['Carry', 'Mid'],                                    // Slark
    94:  ['Carry'],                                           // Medusa
    95:  ['Carry'],                                           // Troll Warlord
    109: ['Carry'],                                           // Terrorblade
    114: ['Carry', 'Mid'],                                    // Monkey King
    135: ['Carry', 'Offlane'],                                // Dawnbreaker

    // Cores — Mid
    11:  ['Mid', 'Carry'],                                    // Shadow Fiend
    15:  ['Carry', 'Mid'],                                    // Razor
    17:  ['Mid'],                                             // Storm Spirit
    34:  ['Mid'],                                             // Tinker
    39:  ['Mid', 'Carry'],                                    // Queen of Pain
    43:  ['Mid'],                                             // Death Prophet
    52:  ['Mid', 'Offlane'],                                  // Leshrac
    62:  ['Carry', 'Mid'],                                    // Huskar
    63:  ['Carry', 'Mid'],                                    // Weaver
    72:  ['Carry', 'Mid'],                                    // Gyrocopter
    74:  ['Mid'],                                             // Invoker
    76:  ['Mid'],                                             // Outworld Destroyer
    82:  ['Mid', 'Carry'],                                    // Meepo
    97:  ['Mid', 'Offlane'],                                  // Magnus
    98:  ['Offlane', 'Mid'],                                  // Timbersaw
    106: ['Mid', 'Carry'],                                    // Ember Spirit
    126: ['Mid', 'Carry'],                                    // Void Spirit

    // Cores — Offlane
    2:   ['Offlane'],                                         // Axe
    28:  ['Offlane'],                                         // Slardar
    29:  ['Offlane'],                                         // Tidehunter
    33:  ['Offlane', 'SoftSupport'],                          // Enigma
    36:  ['Mid', 'Offlane'],                                  // Necrophos
    38:  ['Offlane', 'SoftSupport'],                          // Beastmaster
    49:  ['Offlane', 'Mid'],                                  // Dragon Knight
    51:  ['Offlane'],                                         // Clockwerk
    60:  ['Offlane', 'Mid'],                                  // Night Stalker
    61:  ['Offlane', 'Mid'],                                  // Broodmother
    65:  ['Mid', 'Offlane'],                                  // Batrider
    69:  ['Offlane', 'Mid'],                                  // Doom
    71:  ['Offlane'],                                         // Spirit Breaker
    77:  ['Offlane', 'Carry'],                                // Lycan
    81:  ['Carry', 'Offlane'],                                // Chaos Knight
    96:  ['Offlane'],                                         // Centaur
    99:  ['Offlane', 'Carry'],                                // Bristleback
    104: ['Carry', 'Offlane'],                                // Legion Commander
    108: ['Offlane'],                                         // Underlord
    120: ['Mid', 'Offlane', 'SoftSupport'],                   // Pangolier
    129: ['Offlane', 'Mid'],                                  // Mars
    136: ['Offlane', 'Mid'],                                  // Marci
    137: ['Offlane', 'SoftSupport'],                          // Primal Beast

    // Flex cores / hybrid
    7:   ['Offlane', 'SoftSupport'],                          // Earthshaker
    9:   ['SoftSupport', 'Mid', 'Carry'],                     // Mirana
    13:  ['Mid', 'SoftSupport'],                              // Puck
    14:  ['Offlane', 'Mid', 'SoftSupport'],                   // Pudge
    16:  ['Mid', 'Offlane', 'SoftSupport'],                   // Sand King
    19:  ['Offlane', 'SoftSupport', 'Mid'],                   // Tiny
    21:  ['Mid', 'Offlane', 'SoftSupport'],                   // Windranger
    23:  ['Mid', 'Offlane'],                                  // Kunkka
    45:  ['Mid', 'SoftSupport'],                              // Pugna
    53:  ['Offlane', 'SoftSupport', 'Carry'],                 // Nature's Prophet
    75:  ['Mid', 'SoftSupport'],                              // Silencer
    89:  ['Carry', 'SoftSupport'],                            // Naga Siren
    110: ['Offlane', 'SoftSupport'],                          // Phoenix
    123: ['SoftSupport', 'Mid'],                              // Hoodwink
    138: ['SoftSupport', 'Mid', 'Offlane'],                   // Muerta

    // Pos 4 — Soft support (roamer/ganker lean)
    25:  ['Mid', 'SoftSupport'],                              // Lina (flex; 4/2)
    46:  ['SoftSupport', 'Offlane'],                          // Bounty Hunter
    58:  ['SoftSupport', 'HardSupport', 'Offlane'],           // Enchantress
    88:  ['SoftSupport', 'Offlane'],                          // Nyx Assassin
    100: ['SoftSupport', 'Offlane'],                          // Tusk
    85:  ['SoftSupport', 'HardSupport'],                      // Rubick
    92:  ['SoftSupport', 'HardSupport'],                      // Dark Seer? (92 = Magnus? let's verify via overrides)

    // Pos 5 — Hard support lean
    5:   ['HardSupport'],                                     // Crystal Maiden
    20:  ['HardSupport', 'SoftSupport'],                      // Vengeful Spirit
    26:  ['HardSupport'],                                     // Lion
    27:  ['HardSupport', 'SoftSupport'],                      // Shadow Shaman
    30:  ['SoftSupport', 'HardSupport'],                      // Witch Doctor
    31:  ['HardSupport'],                                     // Lich
    37:  ['HardSupport', 'SoftSupport'],                      // Warlock
    40:  ['HardSupport', 'SoftSupport'],                      // Bane
    50:  ['HardSupport', 'SoftSupport'],                      // Dazzle
    57:  ['SoftSupport', 'HardSupport', 'Offlane'],           // Omniknight
    64:  ['HardSupport', 'SoftSupport'],                      // Jakiro
    68:  ['SoftSupport', 'HardSupport'],                      // Ancient Apparition
    79:  ['HardSupport', 'SoftSupport'],                      // Shadow Demon
    83:  ['HardSupport', 'SoftSupport', 'Offlane'],           // Treant Protector
    84:  ['HardSupport', 'SoftSupport'],                      // Ogre Magi
    86:  ['HardSupport', 'SoftSupport'],                      // Disruptor
    87:  ['HardSupport', 'SoftSupport'],                      // Keeper of the Light
    90:  ['SoftSupport', 'HardSupport'],                      // Visage
    91:  ['SoftSupport', 'HardSupport'],                      // Io / Wisp
    101: ['SoftSupport', 'HardSupport'],                      // Skywrath Mage
    102: ['SoftSupport', 'HardSupport', 'Offlane'],           // Abaddon
    121: ['HardSupport', 'SoftSupport'],                      // Grimstroke
    128: ['SoftSupport', 'HardSupport'],                      // Snapfire
};

/**
 * Heuristic fallback for heroes not in the manual table.
 * Returns a best-guess list of positions based on OpenDota API roles + attribute.
 */
export const getHeroRoles = (heroId: number, apiRoles: string[], primaryAttr: string): Position[] => {
    // 1. Check manual override
    if (HERO_POSITIONS[heroId]) return HERO_POSITIONS[heroId];

    // 2. Heuristic fallback
    const pos: Position[] = [];

    if (apiRoles.includes('Carry')) pos.push('Carry');

    if (apiRoles.includes('Support')) {
        // Disabler + no Escape → leans pos 5 (babysit/ward)
        // Escape + Nuker → leans pos 4 (roam/gank)
        const leans5 = apiRoles.includes('Disabler') && !apiRoles.includes('Escape');
        if (leans5) {
            pos.push('HardSupport', 'SoftSupport');
        } else {
            pos.push('SoftSupport', 'HardSupport');
        }
    }

    // Mid detection: Nuker on int/universal
    if (apiRoles.includes('Nuker') && (primaryAttr === 'int' || primaryAttr === 'universal')) pos.push('Mid');

    // Offlane detection: Initiator on str/universal
    if (apiRoles.includes('Initiator') && (primaryAttr === 'str' || primaryAttr === 'universal')) pos.push('Offlane');

    if (pos.length === 0) return ['SoftSupport', 'HardSupport']; // Default fallback
    return [...new Set(pos)];
};

/** Turn a Position into its 1–5 position number. */
export const positionNumber = (p: Position): PositionNumber => POSITION_TO_NUMBER[p];

/** Check whether a hero can play a given position. */
export const canPlayPosition = (heroId: number, apiRoles: string[], primaryAttr: string, pos: Position): boolean => {
    return getHeroRoles(heroId, apiRoles, primaryAttr).includes(pos);
};
