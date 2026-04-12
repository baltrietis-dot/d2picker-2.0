// Heuristic bonus weights applied on top of statistical matchup scores.
// Increase a weight to make that trait more influential in recommendations.
// Decrease toward 0 to rely purely on win-rate data.
export const HEURISTIC_WEIGHTS = {
    ANTI_ILLUSION: 0.50,  // Boost heroes that counter illusion-based enemies (PL, Naga, etc.)
    ANTI_HEALER:   0.40,  // Boost heroes that counter sustain/healing (Omni, IO, Abaddon, etc.)
    ANTI_TANK:     0.30,  // Boost heroes that counter tanky cores (armor reduction, break, etc.)
};

// Synergy bonus weights applied based on your team composition.
export const SYNERGY_WEIGHTS = {
    NEEDS_SUPPORT: 0.25,  // Boost supports when team already has 3+ cores
    NEEDS_CORE:    0.25,  // Boost carries when team already has 2+ supports
    RANGED_BALANCE: 0.10, // Slight boost to ranged heroes when team is 3+ melee
};
