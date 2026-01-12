// Map specific hero mechanics to IDs for heuristic weighting
// This bridges the gap between low-sample Pro data and high-sample Pub wisdom.

export const HERO_TAGS: Record<string, number[]> = {
    // Heroes that spam units (Illusions, Summons, Clones)
    ILLUSIONIST: [
        12, // Phantom Lancer
        89, // Naga Siren
        81, // Chaos Knight
        82, // Meepo
        77, // Lycan
        61, // Broodmother
        109, // Terrorblade
        27, // Shadow Shaman (Wards)
        53, // Nature's Prophet
    ],
    // Heroes with heavy healing/sustain
    HEALER: [
        23, // Kunkka (kinda)
        57, // Omniknight
        54, // Lifestealer
        102, // Abaddon
        36, // Necrophos
        111, // Oracle
        91, // Io
        68, // AA (He counters healers)
    ],
    // Heroes vulnerable to kiting / magic burst
    TANKY_CORE: [
        99, // Bristleback
        14, // Pudge
        19, // Tiny
        96, // Centaur
        129, // Mars
        2,  // Axe
    ]
};

// Heroes that are GOOD against the above tags
export const COUNTER_TAGS: Record<string, number[]> = {
    // AoE damage / Echo Slam / Cleave
    ANTI_ILLUSION: [
        7,  // Earthshaker (The King)
        2,  // Axe (Call)
        99, // Bristleback (Quill)
        23, // Kunkka (Tidebringer)
        52, // Leshrac (Pulse)
        39, // Queen of Pain (Scream/Ult)
        106, // Ember Spirit (Sleight)
        5,  // Crystal Maiden (Ult)
        38, // Beastmaster (Axes)
        108, // Underlord (Firestorm)
        69, // Doom (Scorched Earth - moderate)
        16, // Sand King (Finale/Sandstorm)
        18, // Sven (Cleave)
        9,  // Mirana (Starfall)
        74, // Invoker (Meteor/Blast)
    ],
    // Anti-Heal / Burst / Break
    ANTI_HEALER: [
        68, // Ancient Apparition (Ice Blast)
        69, // Doom
        4,  // Bloodseeker (Rupture stops movement)
        11, // Shadow Fiend
    ],
    // Percent damage, Break, armor reduction
    ANTI_TANK: [
        19, // Tiny (Burst)
        106, // Ember
        3,  // Bane (Enfeeble)
        6,  // Drow (Marksmanship)
        42, // Wraith King (Crit)
        60, // Night Stalker (Silence/Break with aghs)
        27, // Shadow Shaman (Control)
        47, // Viper (Break)
    ]
};
