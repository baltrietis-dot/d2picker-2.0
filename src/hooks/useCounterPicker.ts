import { useState, useCallback, useMemo } from 'react';
import { api, type Hero, type Matchup } from '../services/api';
import { HERO_TAGS, COUNTER_TAGS } from '../data/heroTags';
import { getHeroRoles, type Position } from '../data/heroPositions';

export interface CounterPick {
    hero: Hero;
    winRate: number; // Raw win rate vs enemy team
    matchCount: number;
    score: number; // Advantage score
    reasons?: string[];
}

export const useCounterPicker = (targetRole: Position | 'Any' = 'Any') => {
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [selectedEnemies, setSelectedEnemies] = useState<Hero[]>([]);
    const [myTeam, setMyTeam] = useState<Hero[]>([]);

    const [matchupsMap, setMatchupsMap] = useState<Record<number, Matchup[]>>({});
    const [loading, setLoading] = useState(false);

    // Initial load
    const loadHeroes = useCallback(async () => {
        setLoading(true);
        const data = await api.fetchHeroes();
        setHeroes(data);
        setLoading(false);
    }, []);

    const fetchMatchupsForHero = useCallback(async (heroId: number) => {
        if (!matchupsMap[heroId]) {
            try {
                const matchups = await api.fetchMatchups(heroId);
                setMatchupsMap(prev => ({ ...prev, [heroId]: matchups }));
            } catch (e) {
                console.error("Error loading matchups", e);
            }
        }
    }, [matchupsMap]);

    // Add enemy and fetch matchups
    const addEnemy = useCallback((hero: Hero) => {
        if (selectedEnemies.find(e => e.id === hero.id)) return;
        if (myTeam.find(e => e.id === hero.id)) return;
        if (selectedEnemies.length >= 5) return;

        setSelectedEnemies(prev => [...prev, hero]);
        fetchMatchupsForHero(hero.id);
    }, [selectedEnemies, myTeam, fetchMatchupsForHero]);

    const addMyTeam = useCallback((hero: Hero) => {
        if (myTeam.find(e => e.id === hero.id)) return;
        if (selectedEnemies.find(e => e.id === hero.id)) return;
        if (myTeam.length >= 5) return;

        setMyTeam(prev => [...prev, hero]);
    }, [myTeam, selectedEnemies]);

    const removeEnemy = useCallback((heroId: number) => {
        setSelectedEnemies(prev => prev.filter(h => h.id !== heroId));
    }, []);

    const removeMyTeam = useCallback((heroId: number) => {
        setMyTeam(prev => prev.filter(h => h.id !== heroId));
    }, []);

    const clearAll = useCallback(() => {
        setSelectedEnemies([]);
        setMyTeam([]);
    }, []);

    // Calculate counters
    const topCounters = useMemo(() => {
        if (selectedEnemies.length === 0 && myTeam.length === 0) return [];

        // Scores now track accumulated Advantage
        const scores: Record<number, {
            totalAdvantage: number;
            totalWinRate: number;
            matchCount: number;
            heuristicBonus: number;
            synergyBonus: number;
            reasons: string[];
        }> = {};

        // --- 1. Analyze Enemy Composition (Counter Logic) ---
        const enemyTraits: Set<string> = new Set();
        selectedEnemies.forEach(e => {
            Object.keys(HERO_TAGS).forEach(tag => {
                if (HERO_TAGS[tag].includes(e.id)) {
                    enemyTraits.add(tag);
                }
            });
        });

        // Populate scores based on Matchups (if enemies exist)
        if (selectedEnemies.length > 0) {
            selectedEnemies.forEach(enemy => {
                const matchups = matchupsMap[enemy.id];
                if (!matchups) return;

                matchups.forEach(m => {
                    if (m.games_played < 10) return;

                    const enemyWinRate = m.wins / m.games_played;
                    const myWinRate = 1 - enemyWinRate;

                    if (!scores[m.hero_id]) {
                        scores[m.hero_id] = { totalAdvantage: 0, totalWinRate: 0, matchCount: 0, heuristicBonus: 0, synergyBonus: 0, reasons: [] };

                        // Heuristics (Countering)
                        if (enemyTraits.has('ILLUSIONIST') && COUNTER_TAGS['ANTI_ILLUSION'].includes(m.hero_id)) {
                            scores[m.hero_id].heuristicBonus += 0.50;
                            if (!scores[m.hero_id].reasons.includes('Counters Illusions')) scores[m.hero_id].reasons.push('Counters Illusions');
                        }
                        if (enemyTraits.has('HEALER') && COUNTER_TAGS['ANTI_HEALER'].includes(m.hero_id)) {
                            scores[m.hero_id].heuristicBonus += 0.40;
                            if (!scores[m.hero_id].reasons.includes('Counters Healers')) scores[m.hero_id].reasons.push('Counters Healers');
                        }
                        if (enemyTraits.has('TANKY_CORE') && COUNTER_TAGS['ANTI_TANK'].includes(m.hero_id)) {
                            scores[m.hero_id].heuristicBonus += 0.30;
                            if (!scores[m.hero_id].reasons.includes('Counters Tanks')) scores[m.hero_id].reasons.push('Counters Tanks');
                        }
                    }

                    const candidateHero = heroes.find(h => h.id === m.hero_id);
                    const globalWinRate = (candidateHero?.pro_pick && candidateHero.pro_pick > 0)
                        ? (candidateHero.pro_win || 0) / candidateHero.pro_pick
                        : 0.5;

                    const advantage = myWinRate - globalWinRate;

                    scores[m.hero_id].totalAdvantage += advantage;
                    scores[m.hero_id].totalWinRate += myWinRate;
                    scores[m.hero_id].matchCount += 1;
                });
            });
        } else {
            // specific case: No Enemies, only My Team. 
            heroes.forEach(h => {
                const globalWinRate = (h.pro_pick && h.pro_pick > 0) ? (h.pro_win || 0) / h.pro_pick : 0.5;
                scores[h.id] = { totalAdvantage: 0, totalWinRate: globalWinRate, matchCount: 0, heuristicBonus: 0, synergyBonus: 0, reasons: [] };
            });
        }

        // --- 2. Analyze My Team Composition (Synergy Logic) ---
        const myRoles = new Set<string>();
        let myCoreCount = 0;
        let mySupportCount = 0;

        myTeam.forEach(hero => {
            hero.roles.forEach(r => myRoles.add(r));
            if (hero.roles.includes('Carry') || hero.roles.includes('Mid')) myCoreCount++;
            if (hero.roles.includes('Support')) mySupportCount++;
        });

        Object.keys(scores).forEach(heroIdStr => {
            const heroId = Number(heroIdStr);
            const hero = heroes.find(h => h.id === heroId);
            if (!hero) return;

            let synergyScore = 0;
            const reasons: string[] = [];

            // Role Balance Logic (Boost relevant roles based on team comp)
            // If we have many cores, prioritize support
            if (myCoreCount >= 3 && hero.roles.includes('Support')) {
                synergyScore += 0.25;
                reasons.push('Needs Support');
            }
            if (mySupportCount >= 2 && myCoreCount < 2 && hero.roles.includes('Carry')) {
                synergyScore += 0.25;
                reasons.push('Needs Core');
            }

            const myMeleeCount = myTeam.filter(h => h.attack_type === 'Melee').length;
            if (myMeleeCount >= 3 && hero.attack_type === 'Ranged') {
                synergyScore += 0.10;
            }

            scores[heroId].synergyBonus += synergyScore;
            if (reasons.length > 0) scores[heroId].reasons.push(...reasons);
        });

        const results: CounterPick[] = [];
        const threshold = selectedEnemies.length > 0 ? Math.max(1, Math.ceil(selectedEnemies.length * 0.5)) : 0;

        // --- 3. FILTER BY TARGET ROLE ---
        Object.keys(scores).forEach(heroIdStr => {
            const heroId = Number(heroIdStr);
            const score = scores[heroId];

            const hero = heroes.find(h => h.id === heroId);
            if (!hero) return;

            // Check Role Fit
            let matchesRole = true;
            if (targetRole !== 'Any') {
                const heroRoles = getHeroRoles(hero.id, hero.roles, hero.primary_attr);
                matchesRole = heroRoles.includes(targetRole);
            }

            if (score.matchCount >= threshold && matchesRole) {
                const avgAdvantage = score.matchCount > 0 ? score.totalAdvantage / score.matchCount : 0;
                const avgWinRate = score.matchCount > 0 ? score.totalWinRate / score.matchCount : 0.5;

                let finalBaseScore = avgAdvantage;
                if (selectedEnemies.length === 0 && score.matchCount === 0) {
                    finalBaseScore = (score.totalWinRate - 0.5);
                }

                const finalScore = (finalBaseScore + score.heuristicBonus + score.synergyBonus) * 100;

                if (!selectedEnemies.find(e => e.id === heroId) && !myTeam.find(m => m.id === heroId)) {
                    results.push({
                        hero,
                        winRate: avgWinRate,
                        matchCount: score.matchCount,
                        score: finalScore,
                        reasons: [...new Set(score.reasons)]
                    });
                }
            }
        });

        // Sort by Score descending
        return results.sort((a, b) => b.score - a.score).slice(0, 20);
    }, [selectedEnemies, myTeam, matchupsMap, heroes, targetRole]);

    return {
        heroes,
        selectedEnemies,
        myTeam,
        topCounters,
        loading,
        loadHeroes,
        addEnemy,
        removeEnemy,
        addMyTeam,
        removeMyTeam,
        clearAll
    };
};
