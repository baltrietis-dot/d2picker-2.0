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
        16, // Sand King
        108, // Underlord
        42, // Wraith King
    ],
    // High Magic Burst
    NUKE: [
        22, // Zeus
        25, // Lina
        26, // Lion
        31, // Lich
        39, // Queen of Pain
        45, // Pugna
        74, // Invoker
        101, // Skywrath Mage
        75, // Silencer
        52, // Leshrac
    ],
    // Evasion / High Physical avoidance
    EVASION: [
        44, // Phantom Assassin
        21, // Windranger
        10, // Morphling (Attribute Shift kinda acts like it)
        63, // Weaver (Shukuchi)
        123, // Hoodwink
        1,  // Anti-Mage (Blink/Counterspell)
    ],
    // Hard Carries / Physical Damage Threats
    CARRY: [
        70, // Ursa
        6,  // Drow Ranger
        1,  // Anti-Mage
        44, // Phantom Assassin
        10, // Morphling
        35, // Sniper
        114, // Monkey King
        8,  // Juggernaut
        41, // Faceless Void
        72, // Gyrocopter
        63, // Weaver
        67, // Spectre
        109, // Terrorblade
        94, // Medusa
    ],
    // Slippery / Escape Artists
    ESCAPE: [
        1,  // Anti-Mage
        13, // Puck
        39, // Queen of Pain
        63, // Weaver
        106, // Ember Spirit
        120, // Pangolier
        9,  // Mirana
        116, // Primal Beast
        17, // Storm Spirit
        92, // Visage
        107, // Earth Spirit
    ],
    // High Stun / Lockdown
    STUNNER: [
        20, // Vengeful Spirit
        26, // Lion
        27, // Shadow Shaman
        16, // Sand King
        51, // Clockwerk
        100, // Tusk
        37, // Warlock (Ult)
        86, // Rubick
        97, // Magnus
        65, // Batrider
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
