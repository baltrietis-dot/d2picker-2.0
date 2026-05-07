import React from 'react';
import type { CounterPick } from '../hooks/useCounterPicker';
import { Sparkles, Trophy, X, ChevronDown, ChevronUp, BookOpen, Lock, Crown } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

import { recommendItems, recommendSkillStrategy } from '../data/smartBuilds';
import { HERO_TAGS } from '../data/heroTags';
import type { Hero, Matchup } from '../services/api';
import { useSupporter } from '../hooks/useSupporter';
import { PremiumUnlock } from './PremiumUnlock';
import { StrategyGuide } from './StrategyGuide';

interface CounterListProps {
    counters: CounterPick[];
    loading: boolean;
    selectedEnemies: Hero[];
    matchupsMap: Record<number, Matchup[]>;
    drafting: boolean;
    hasSelection: boolean;
    onReveal: () => void;
}

export const CounterList: React.FC<CounterListProps> = ({ counters, loading, selectedEnemies, matchupsMap, drafting, hasSelection, onReveal }) => {
    const { t } = useLanguage();
    const { isSupporter } = useSupporter();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [strategyHero, setStrategyHero] = useState<Hero | null>(null);
    const [showTailored, setShowTailored] = useState(false);

    if (drafting) {
        return (
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 flex flex-col justify-center items-center gap-3 h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                <div className="text-xs text-slate-400 font-medium">{t('revealing')}</div>
            </div>
        );
    }

    if (loading && counters.length === 0) {
        return (
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (counters.length === 0) {
        return (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col items-center h-full text-center">
                <div className="flex-1 flex flex-col justify-center items-center space-y-4">
                    <div className="p-3 bg-indigo-500/10 rounded-full">
                        <Sparkles className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-1">{t('readyToDraft')}</h3>
                        <p className="text-sm text-slate-400">
                            {hasSelection ? t('revealHint') : t('selectEnemies')}
                        </p>
                    </div>

                    {hasSelection ? (
                        <button
                            onClick={onReveal}
                            className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.03] hover:shadow-indigo-500/50"
                        >
                            <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                            {t('revealDraft')}
                        </button>
                    ) : (
                        <div className="text-xs text-slate-500 max-w-[240px] leading-relaxed">
                            {t('algorithmDesc')}
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-700/50 w-full text-center">
                    <a href="#guide" className="text-xs font-bold text-slate-500 hover:text-indigo-400 flex items-center justify-center gap-1 transition-colors cursor-pointer">
                        {t('howItWorksLink')} <ChevronDown className="h-3 w-3" />
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur flex justify-between items-center gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">{t('topPicks')}</h2>
                        {isSupporter && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/15 text-amber-300 text-[9px] font-black uppercase tracking-widest rounded border border-amber-500/30">
                                <Crown className="h-2.5 w-2.5" />
                                Pro
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{t('basedOnPro')}</p>
                </div>
                {counters.length > 0 && (
                    <button
                        onClick={() => setShowTailored(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/20 transition-all hover:scale-105 flex-shrink-0"
                    >
                        <Sparkles className="h-3 w-3" />
                        {t('tailoredPick')}
                    </button>
                )}
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                {counters.map((counter, idx) => {
                    const isExpanded = expandedId === counter.hero.id;
                    return (
                        <div
                            key={counter.hero.id}
                            className="bg-slate-700/40 hover:bg-slate-700/80 rounded-lg border border-transparent hover:border-indigo-500/50 transition-all animate-fadeIn"
                            style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                            <div className="flex items-center gap-4 p-3">
                                <div className={`text-xl font-bold w-6 text-center ${idx < 3 ? 'text-yellow-400' : 'text-slate-500'}`}>#{idx + 1}</div>

                                <img
                                    src={counter.hero.img}
                                    alt={counter.hero.localized_name}
                                    className="w-16 h-9 rounded object-cover shadow-sm ring-1 ring-black"
                                />

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white truncate">{counter.hero.localized_name}</h3>
                                    <div className="text-xs text-slate-400 flex flex-wrap gap-1 mt-0.5">
                                        <span className="uppercase bg-slate-800 px-1 rounded border border-slate-600">{counter.hero.primary_attr.substring(0, 3)}</span>
                                        {counter.reasons && counter.reasons.map((r, i) => (
                                            <span key={i} className="bg-indigo-900/50 text-indigo-200 px-1 rounded border border-indigo-700/50">{r}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className={`text-lg font-bold ${counter.score > 0 ? 'text-green-400' : 'text-slate-300'}`}>
                                        {counter.score > 0 ? '+' : ''}{(counter.score).toFixed(2)}%
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{t('advantage')}</div>
                                </div>
                            </div>

                            {/* Premium actions strip */}
                            <div className="flex items-stretch gap-px mx-2 mb-2 rounded-lg overflow-hidden bg-slate-900/40 border border-slate-700/60">
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : counter.hero.id)}
                                    className={`group/btn flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-bold transition-all ${
                                        isExpanded
                                            ? 'bg-indigo-500/15 text-indigo-200'
                                            : 'text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-200'
                                    }`}
                                >
                                    {isExpanded
                                        ? <ChevronUp className="h-3.5 w-3.5" />
                                        : <ChevronDown className="h-3.5 w-3.5 group-hover/btn:translate-y-0.5 transition-transform" />
                                    }
                                    <span className="uppercase tracking-wider">{isExpanded ? t('hideDetails') : t('viewDetails')}</span>
                                    {!isSupporter && <Lock className="h-3 w-3 text-amber-400" />}
                                </button>
                                <div className="w-px bg-slate-700/60" />
                                <button
                                    onClick={() => setStrategyHero(counter.hero)}
                                    className="group/btn flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-bold text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-200 transition-all"
                                >
                                    <BookOpen className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
                                    <span className="uppercase tracking-wider">{t('strategyBtn')}</span>
                                    {!isSupporter && <Lock className="h-3 w-3 text-amber-400" />}
                                </button>
                            </div>

                            {/* Expanded matchup breakdown */}
                            {isExpanded && (
                                <div className="mx-2 mb-2 rounded-lg p-3 bg-slate-950/50 border border-slate-700/60 animate-slideDown">
                                    {isSupporter ? (
                                        <MatchupBreakdown
                                            hero={counter.hero}
                                            enemies={selectedEnemies}
                                            matchupsMap={matchupsMap}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 py-3 px-2">
                                            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black text-amber-300">
                                                <Crown className="h-3 w-3" />
                                                {t('proFeature')}
                                            </div>
                                            <div className="text-sm text-slate-300 text-center font-medium">
                                                {t('matchupBreakdown')}
                                            </div>
                                            <PremiumUnlock variant="sm" />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Strategy Guide modal — premium-gated */}
            {strategyHero && (
                isSupporter ? (
                    <StrategyGuide hero={strategyHero} onClose={() => setStrategyHero(null)} />
                ) : (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
                        onClick={() => setStrategyHero(null)}
                    >
                        <div
                            className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl shadow-amber-500/20 max-w-md w-full overflow-hidden animate-scaleIn premium-border"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Hero banner background */}
                            <div className="absolute inset-x-0 top-0 h-32 overflow-hidden pointer-events-none">
                                <img src={strategyHero.img} alt="" className="w-full h-full object-cover opacity-25 blur-sm scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-900" />
                            </div>

                            <button
                                onClick={() => setStrategyHero(null)}
                                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/40 text-slate-300 hover:text-white hover:bg-black/60 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="relative p-6 text-center">
                                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/40 rotate-3">
                                    <Crown className="h-8 w-8 text-white drop-shadow" />
                                </div>

                                <h3 className="text-xl font-black mb-1">
                                    <span className="text-premium-gradient">{t('strategyGuide')}</span>
                                </h3>
                                <div className="text-sm text-slate-300 font-medium mb-1">{strategyHero.localized_name}</div>
                                <p className="text-xs text-slate-500 mb-5 leading-relaxed">{t('premiumDesc')}</p>

                                <PremiumUnlock variant="md" />
                            </div>
                        </div>
                    </div>
                )
            )}

            {/* Tailored Pick Modal */}
            {showTailored && counters.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-slate-800 border border-indigo-500/50 rounded-2xl shadow-2xl shadow-indigo-500/20 max-w-md w-full overflow-hidden relative animate-scaleIn">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowTailored(false)}
                            className="absolute top-3 right-3 p-1 rounded-full bg-black/20 text-slate-400 hover:text-white hover:bg-black/40 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Modal Content */}
                        <div className="p-6 text-center">
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                                <Trophy className="h-8 w-8 text-white" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-1">{t('tailoredPick')}</h3>
                            <p className="text-slate-400 text-sm mb-6">{t('basedOnComposition')}</p>

                            <div className="relative group mx-auto w-32 aspect-video rounded-lg overflow-hidden ring-2 ring-indigo-500 shadow-xl mb-6">
                                <img
                                    src={counters[0].hero.img}
                                    alt={counters[0].hero.localized_name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center p-2">
                                    <span className="font-bold text-white text-lg">{counters[0].hero.localized_name}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">{t('advantage')}</div>
                                    <div className="text-xl font-bold text-green-400">+{counters[0].score.toFixed(1)}%</div>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">{t('winRate')}</div>
                                    <div className="text-xl font-bold text-indigo-400">{(counters[0].winRate * 100).toFixed(1)}%</div>
                                </div>
                            </div>

                            {counters[0].reasons && counters[0].reasons.length > 0 && (
                                <div className="text-left bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/20 mb-4">
                                    <h4 className="text-xs font-bold text-indigo-300 uppercase mb-2 flex items-center gap-2">
                                        <Sparkles className="h-3 w-3" />
                                        {t('whyThisHero')}
                                    </h4>
                                    <ul className="space-y-1">
                                        {counters[0].reasons.map((reason, idx) => (
                                            <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                                <span className="text-indigo-500 mt-1">•</span>
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Situational Build — supporter only */}
                            {(() => {
                                const enemyTraits = new Set<string>();
                                selectedEnemies.forEach(e => {
                                    Object.keys(HERO_TAGS).forEach(tag => {
                                        if (HERO_TAGS[tag].includes(e.id)) enemyTraits.add(tag);
                                    });
                                });

                                const hero = counters[0].hero;
                                const role = hero.roles.includes('Support') ? 'Support' : 'Core';
                                const items = recommendItems(enemyTraits, role, hero.attack_type);
                                const strategies = recommendSkillStrategy(enemyTraits);

                                if (items.length === 0 && strategies.length === 0) return null;

                                return (
                                    <div className="text-left bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/20">
                                        <h4 className="text-xs font-bold text-emerald-300 uppercase mb-2 flex items-center gap-2">
                                            <Sparkles className="h-3 w-3" />
                                            {t('situationalBuild')}
                                        </h4>

                                        {items.length > 0 && (
                                            <div className="mb-3">
                                                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">{t('keyItems')}</div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {items.map(item => (
                                                        <div key={item.id} className="relative group/item">
                                                            <img src={item.img} alt={item.name} className="w-full aspect-square rounded border border-slate-600 object-cover" />
                                                            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover/item:opacity-100 flex items-center justify-center p-1 transition-opacity z-10">
                                                                <p className="text-[8px] text-white text-center leading-tight">{item.reason}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {strategies.length > 0 && (
                                            <div>
                                                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">{t('strategy')}</div>
                                                <ul className="space-y-1">
                                                    {strategies.map((strat, idx) => (
                                                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                                                            <span className="text-emerald-500 mt-1">•</span>
                                                            {strat}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            <button
                                onClick={() => setShowTailored(false)}
                                className="mt-6 w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25"
                            >
                                {t('gotIt')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ---------------- Matchup Breakdown (supporter-only) ---------------- */

const MatchupBreakdown: React.FC<{
    hero: Hero;
    enemies: Hero[];
    matchupsMap: Record<number, Matchup[]>;
}> = ({ hero, enemies, matchupsMap }) => {
    const { t } = useLanguage();

    if (enemies.length === 0) {
        return <div className="text-xs text-slate-500 text-center py-2">{t('noMatchupData')}</div>;
    }

    const rows = enemies.map(enemy => {
        const matchups = matchupsMap[enemy.id] || [];
        const entry = matchups.find(m => m.hero_id === hero.id);
        if (!entry || entry.games_played < 10) {
            return { enemy, winRate: null as number | null, games: entry?.games_played ?? 0 };
        }
        const winRate = 1 - entry.wins / entry.games_played;
        return { enemy, winRate, games: entry.games_played };
    });

    // Aggregate stats
    const valid = rows.filter(r => r.winRate !== null) as { enemy: Hero; winRate: number; games: number }[];
    const avgWinRate = valid.length > 0
        ? valid.reduce((s, r) => s + r.winRate, 0) / valid.length
        : null;

    return (
        <div>
            <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                    <Crown className="h-3 w-3 text-amber-400" />
                    <span className="text-[10px] uppercase tracking-widest font-black text-amber-300">{t('matchupBreakdown')}</span>
                </div>
                {avgWinRate !== null && (
                    <div className="flex items-center gap-1 text-[10px]">
                        <span className="text-slate-500 uppercase tracking-wider">Avg</span>
                        <span className={`font-black font-mono ${
                            avgWinRate >= 0.52 ? 'text-emerald-400' : avgWinRate >= 0.48 ? 'text-slate-200' : 'text-rose-400'
                        }`}>
                            {(avgWinRate * 100).toFixed(1)}%
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-1.5">
                {rows.map(({ enemy, winRate, games }) => {
                    // Map 40–60% win rate to 0–100% bar width
                    const barPct = winRate !== null
                        ? Math.max(2, Math.min(100, ((winRate - 0.40) / 0.20) * 100))
                        : 0;

                    let barColour = 'from-slate-600 to-slate-500';
                    let textColour = 'text-slate-300';
                    if (winRate !== null) {
                        if (winRate >= 0.52) { barColour = 'from-emerald-600 to-emerald-400'; textColour = 'text-emerald-300'; }
                        else if (winRate >= 0.50) { barColour = 'from-amber-600 to-amber-400'; textColour = 'text-amber-300'; }
                        else if (winRate < 0.48) { barColour = 'from-rose-600 to-rose-400'; textColour = 'text-rose-300'; }
                    }

                    return (
                        <div key={enemy.id} className="flex items-center gap-2 bg-slate-900/60 rounded-md px-2 py-1.5 border border-slate-800">
                            <img
                                src={enemy.img}
                                alt={enemy.localized_name}
                                className="w-10 h-6 rounded object-cover ring-1 ring-black flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] text-white font-medium truncate leading-tight">{enemy.localized_name}</div>
                                {winRate === null ? (
                                    <div className="h-1.5 mt-1 bg-slate-800 rounded" />
                                ) : (
                                    <div className="h-1.5 mt-1 bg-slate-800 rounded overflow-hidden relative">
                                        <div
                                            className={`h-full bg-gradient-to-r ${barColour} transition-all duration-500`}
                                            style={{ width: `${barPct}%` }}
                                        />
                                        {/* 50% reference line */}
                                        <div className="absolute top-0 bottom-0 w-px bg-white/30" style={{ left: '50%' }} />
                                    </div>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0">
                                {winRate === null ? (
                                    <div className="text-[11px] text-slate-600">—</div>
                                ) : (
                                    <>
                                        <div className={`text-xs font-black font-mono ${textColour} leading-tight`}>
                                            {(winRate * 100).toFixed(1)}%
                                        </div>
                                        <div className="text-[9px] text-slate-600 font-mono">
                                            {games > 999 ? `${Math.round(games / 1000)}k` : games} {t('games')}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
