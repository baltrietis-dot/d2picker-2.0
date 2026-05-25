import { useState, useCallback, useMemo, useRef } from 'react';
import { api, type Hero, type Matchup } from '../services/api';
import { HERO_TAGS, COUNTER_TAGS } from '../data/heroTags';
import { getHeroRoles, isSupportPosition, type Position, type PositionNumber, NUMBER_TO_POSITION } from '../data/heroPositions';
import { HEURISTIC_WEIGHTS, SYNERGY_WEIGHTS } from '../config/heuristics';

export interface CounterPick {
    hero: Hero;
    winRate: number; // Raw win rate vs enemy team
    matchCount: number;
    score: number; // Composite draft score used for ranking, not a win-rate percentage.
    reasons?: string[];
}

/** My-team slot layout: index 0 = pos 1 (Carry), index 4 = pos 5 (Hard Sup). */
export type MyTeamSlots = (Hero | null)[];

const emptySlots = (): MyTeamSlots => [null, null, null, null, null];
const traitPressure = (count: number) => Math.min(2, Math.max(1, 1 + (count - 1) * 0.25));

export const useCounterPicker = (targetRole: Position | 'Any' = 'Any') => {
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [selectedEnemies, setSelectedEnemies] = useState<Hero[]>([]);
    const [myTeamSlots, setMyTeamSlots] = useState<MyTeamSlots>(emptySlots());
    const [analysisEnemies, setAnalysisEnemies] = useState<Hero[]>([]);
    const [analysisMyTeamSlots, setAnalysisMyTeamSlots] = useState<MyTeamSlots>(emptySlots());
    const [analysisTargetRole, setAnalysisTargetRole] = useState<Position | 'Any'>('Any');
    const [analysisSignature, setAnalysisSignature] = useState('');

    const [matchupsMap, setMatchupsMap] = useState<Record<number, Matchup[]>>({});
    const [loading, setLoading] = useState(false);
    const emptyMatchupRefetches = useRef<Set<number>>(new Set());

    // Derived: flat picked-only list for consumers that don't care about slots
    const myTeam = useMemo(() => myTeamSlots.filter((h): h is Hero => h !== null), [myTeamSlots]);
    const analysisMyTeam = useMemo(() => analysisMyTeamSlots.filter((h): h is Hero => h !== null), [analysisMyTeamSlots]);

    const draftSignature = useMemo(() => {
        const enemyIds = selectedEnemies.map(hero => hero.id).join(',');
        const allySlots = myTeamSlots.map(hero => hero?.id ?? 0).join(',');
        return `${enemyIds}|${allySlots}|${targetRole}`;
    }, [selectedEnemies, myTeamSlots, targetRole]);

    const hasAnalysis = analysisSignature.length > 0;
    const isAnalysisCurrent = hasAnalysis && analysisSignature === draftSignature;
    const isAnalysisStale = hasAnalysis && !isAnalysisCurrent;
    const canRevealDraft = selectedEnemies.length + myTeam.length > 0;

    const loadHeroes = useCallback(async () => {
        setLoading(true);
        const data = await api.fetchHeroes();
        setHeroes(data);
        setLoading(false);
    }, []);

    const fetchMatchupsForHero = useCallback(async (heroId: number) => {
        const cached = matchupsMap[heroId];
        const shouldRetryEmpty = cached?.length === 0 && !emptyMatchupRefetches.current.has(heroId);

        if (!cached || shouldRetryEmpty) {
            if (shouldRetryEmpty) emptyMatchupRefetches.current.add(heroId);

            try {
                const matchups = await api.fetchMatchups(heroId);
                setMatchupsMap(prev => ({ ...prev, [heroId]: matchups }));
            } catch (e) {
                console.error('Error loading matchups', e);
            }
        }
    }, [matchupsMap]);

    // Enemy side: unchanged flat pool
    const addEnemy = useCallback((hero: Hero) => {
        if (selectedEnemies.find(e => e.id === hero.id)) return;
        if (myTeam.find(e => e.id === hero.id)) return;
        if (selectedEnemies.length >= 5) return;

        setSelectedEnemies(prev => [...prev, hero]);
    }, [selectedEnemies, myTeam]);

    const removeEnemy = useCallback((heroId: number) => {
        setSelectedEnemies(prev => prev.filter(h => h.id !== heroId));
    }, []);

    /**
     * Place a hero at a specific my-team position (1-5).
     * If the hero is already in my team at a different slot, it's moved (not duplicated).
     * Existing occupant of the target slot is evicted.
     */
    const setMyTeamAt = useCallback((position: PositionNumber, hero: Hero | null) => {
        setMyTeamSlots(prev => {
            const next = [...prev];
            // Evict duplicates elsewhere
            if (hero) {
                for (let i = 0; i < next.length; i++) {
                    if (next[i]?.id === hero.id) next[i] = null;
                }
            }
            next[position - 1] = hero;
            return next;
        });
    }, []);

    const removeMyTeamAt = useCallback((position: PositionNumber) => {
        setMyTeamSlots(prev => {
            const next = [...prev];
            next[position - 1] = null;
            return next;
        });
    }, []);

    /** Legacy: remove hero by id (used by X-click on my-team portraits). */
    const removeMyTeam = useCallback((heroId: number) => {
        setMyTeamSlots(prev => prev.map(h => (h?.id === heroId ? null : h)));
    }, []);

    const clearAll = useCallback(() => {
        setSelectedEnemies([]);
        setMyTeamSlots(emptySlots());
        setAnalysisEnemies([]);
        setAnalysisMyTeamSlots(emptySlots());
        setAnalysisSignature('');
    }, []);

    const revealDraft = useCallback(async () => {
        if (!canRevealDraft) return;

        const enemiesSnapshot = [...selectedEnemies];
        const teamSnapshot = [...myTeamSlots];
        const targetRoleSnapshot = targetRole;
        const signatureSnapshot = draftSignature;

        setAnalysisEnemies(enemiesSnapshot);
        setAnalysisMyTeamSlots(teamSnapshot);
        setAnalysisTargetRole(targetRoleSnapshot);
        setAnalysisSignature(signatureSnapshot);

        if (enemiesSnapshot.length === 0) return;

        setLoading(true);
        try {
            await Promise.all(enemiesSnapshot.map(enemy => fetchMatchupsForHero(enemy.id)));
        } finally {
            setLoading(false);
        }
    }, [canRevealDraft, selectedEnemies, myTeamSlots, targetRole, draftSignature, fetchMatchupsForHero]);

    // Calculate counters
    const topCounters = useMemo(() => {
        if (!hasAnalysis || (analysisEnemies.length === 0 && analysisMyTeam.length === 0)) return [];

        const scores: Record<number, {
            totalAdvantage: number;
            totalWinRate: number;
            matchCount: number;
            heuristicBonus: number;
            synergyBonus: number;
            reasons: string[];
        }> = {};

        // --- 1. Enemy composition traits ---
        const enemyTraits: Set<string> = new Set();
        const enemyTraitCounts: Record<string, number> = {};
        analysisEnemies.forEach(e => {
            Object.keys(HERO_TAGS).forEach(tag => {
                if (HERO_TAGS[tag].includes(e.id)) {
                    enemyTraits.add(tag);
                    enemyTraitCounts[tag] = (enemyTraitCounts[tag] ?? 0) + 1;
                }
            });
        });

        const applyHeuristicBonus = (
            heroId: number,
            enemyTag: string,
            counterTag: keyof typeof COUNTER_TAGS,
            weight: number,
            reason: string,
        ) => {
            const enemyCount = enemyTraitCounts[enemyTag] ?? 0;
            if (enemyCount === 0 || !COUNTER_TAGS[counterTag].includes(heroId)) return;

            scores[heroId].heuristicBonus += weight * traitPressure(enemyCount);
            if (!scores[heroId].reasons.includes(reason)) scores[heroId].reasons.push(reason);
        };

        let enemiesWithMatchupData = 0;

        if (analysisEnemies.length > 0) {
            analysisEnemies.forEach(enemy => {
                const matchups = matchupsMap[enemy.id];
                if (!matchups) return;
                if (matchups.some(m => m.games_played >= 10)) enemiesWithMatchupData += 1;

                matchups.forEach(m => {
                    if (m.games_played < 10) return;

                    const enemyWinRate = m.wins / m.games_played;
                    const myWinRate = 1 - enemyWinRate;

                    if (!scores[m.hero_id]) {
                        scores[m.hero_id] = { totalAdvantage: 0, totalWinRate: 0, matchCount: 0, heuristicBonus: 0, synergyBonus: 0, reasons: [] };

                        applyHeuristicBonus(m.hero_id, 'ILLUSIONIST', 'ANTI_ILLUSION', HEURISTIC_WEIGHTS.ANTI_ILLUSION, 'AoE vs Multiple Units');
                        applyHeuristicBonus(m.hero_id, 'SUMMONER', 'ANTI_ILLUSION', HEURISTIC_WEIGHTS.ANTI_ILLUSION, 'AoE vs Multiple Units');
                        applyHeuristicBonus(m.hero_id, 'HEALER', 'ANTI_HEALER', HEURISTIC_WEIGHTS.ANTI_HEALER, 'Cuts Healing');
                        applyHeuristicBonus(m.hero_id, 'TANKY_CORE', 'ANTI_TANK', HEURISTIC_WEIGHTS.ANTI_TANK, 'Counters Tanks');
                        applyHeuristicBonus(m.hero_id, 'INVISIBILITY', 'ANTI_INVIS', HEURISTIC_WEIGHTS.ANTI_INVIS, 'Reveals invis heroes');
                        applyHeuristicBonus(m.hero_id, 'ESCAPE', 'ANTI_ESCAPE', HEURISTIC_WEIGHTS.ANTI_ESCAPE, 'Catches mobile heroes');
                        applyHeuristicBonus(m.hero_id, 'ESCAPE', 'LOCKDOWN', HEURISTIC_WEIGHTS.LOCKDOWN, 'Reliable lockdown');
                        applyHeuristicBonus(m.hero_id, 'PICKOFF', 'ANTI_PICKOFF', HEURISTIC_WEIGHTS.ANTI_PICKOFF, 'Stops pickoffs');
                    }

                    const candidateHero = heroes.find(h => h.id === m.hero_id);
                    const globalWinRate = (candidateHero?.pro_pick && candidateHero.pro_pick > 0)
                        ? (candidateHero.pro_win || 0) / candidateHero.pro_pick
                        : 0.5;

                    const advantage = myWinRate - globalWinRate;

                    scores[m.hero_id].totalAdvantage += advantage;
                    scores[m.hero_id].totalWinRate += myWinRate;
                    scores[m.hero_id].matchCount += 1;

                    if ((advantage >= 0.03 || myWinRate >= 0.52) && scores[m.hero_id].reasons.length < 4) {
                        scores[m.hero_id].reasons.push(`Strong vs ${enemy.localized_name}`);
                    }
                });
            });
        } else {
            heroes.forEach(h => {
                const globalWinRate = (h.pro_pick && h.pro_pick > 0) ? (h.pro_win || 0) / h.pro_pick : 0.5;
                scores[h.id] = { totalAdvantage: 0, totalWinRate: globalWinRate, matchCount: 0, heuristicBonus: 0, synergyBonus: 0, reasons: [] };
            });
        }

        // --- 2. My team synergy — now role-aware ---
        // Count filled positions by slot index (0=carry … 4=hard sup)
        const filledPositions = new Set<PositionNumber>();
        analysisMyTeamSlots.forEach((h, idx) => {
            if (h) filledPositions.add((idx + 1) as PositionNumber);
        });
        const myCoreCount = [1, 2, 3].filter(p => filledPositions.has(p as PositionNumber)).length;
        const mySupportCount = [4, 5].filter(p => filledPositions.has(p as PositionNumber)).length;

        Object.keys(scores).forEach(heroIdStr => {
            const heroId = Number(heroIdStr);
            const hero = heroes.find(h => h.id === heroId);
            if (!hero) return;

            let synergyScore = 0;
            const reasons: string[] = [];

            if (myCoreCount >= 3 && hero.roles.includes('Support')) {
                synergyScore += SYNERGY_WEIGHTS.NEEDS_SUPPORT;
                reasons.push('Needs Support');
            }
            if (mySupportCount >= 2 && myCoreCount < 2 && hero.roles.includes('Carry')) {
                synergyScore += SYNERGY_WEIGHTS.NEEDS_CORE;
                reasons.push('Needs Core');
            }

            const myMeleeCount = analysisMyTeam.filter(h => h.attack_type === 'Melee').length;
            if (myMeleeCount >= 3 && hero.attack_type === 'Ranged') {
                synergyScore += SYNERGY_WEIGHTS.RANGED_BALANCE;
            }

            scores[heroId].synergyBonus += synergyScore;
            if (reasons.length > 0) scores[heroId].reasons.push(...reasons);
        });

        const results: CounterPick[] = [];
        const threshold = analysisEnemies.length > 0
            ? Math.max(1, Math.ceil(Math.max(1, enemiesWithMatchupData) * 0.5))
            : 0;

        // --- 3. Filter by target role ---
        Object.keys(scores).forEach(heroIdStr => {
            const heroId = Number(heroIdStr);
            const score = scores[heroId];

            const hero = heroes.find(h => h.id === heroId);
            if (!hero) return;

            let matchesRole = true;
            if (analysisTargetRole !== 'Any') {
                const heroRoles = getHeroRoles(hero.id, hero.roles, hero.primary_attr);
                const hasRequestedRole = heroRoles.includes(analysisTargetRole);
                const hasSupportProfile = !isSupportPosition(analysisTargetRole) || heroRoles.some(isSupportPosition);
                matchesRole = hasRequestedRole && hasSupportProfile;
            }

            if (score.matchCount >= threshold && matchesRole) {
                const avgAdvantage = score.matchCount > 0 ? score.totalAdvantage / score.matchCount : 0;
                const avgWinRate = score.matchCount > 0 ? score.totalWinRate / score.matchCount : 0.5;

                let finalBaseScore = avgAdvantage;
                if (analysisEnemies.length === 0 && score.matchCount === 0) {
                    finalBaseScore = (score.totalWinRate - 0.5);
                }

                const finalScore = (finalBaseScore + score.heuristicBonus + score.synergyBonus) * 100;

                if (!analysisEnemies.find(e => e.id === heroId) && !analysisMyTeam.find(m => m.id === heroId)) {
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

        return results.sort((a, b) => b.score - a.score).slice(0, 20);
    }, [hasAnalysis, analysisEnemies, analysisMyTeam, analysisMyTeamSlots, matchupsMap, heroes, analysisTargetRole]);

    return {
        heroes,
        selectedEnemies,
        myTeam,              // flat picked-only list (back-compat)
        myTeamSlots,         // length-5 sparse array indexed by pos-1
        analysisEnemies,
        analysisMyTeam,
        analysisMyTeamSlots,
        analysisTargetRole,
        hasAnalysis,
        isAnalysisCurrent,
        isAnalysisStale,
        canRevealDraft,
        topCounters,
        matchupsMap,
        loading,
        loadHeroes,
        addEnemy,
        removeEnemy,
        setMyTeamAt,         // (pos, hero|null) — place/evict at specific position
        removeMyTeamAt,      // (pos) — clear a specific slot
        removeMyTeam,        // (heroId) — back-compat: remove by id
        revealDraft,
        clearAll,
        // Helpers
        NUMBER_TO_POSITION,
    };
};
