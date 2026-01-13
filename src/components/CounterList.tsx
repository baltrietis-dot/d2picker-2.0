import React from 'react';
import type { CounterPick } from '../hooks/useCounterPicker';
import { Sparkles, Trophy, X } from 'lucide-react';
import { useState } from 'react';

import { recommendItems, recommendSkillStrategy } from '../data/smartBuilds';
import { HERO_TAGS } from '../data/heroTags';
import type { Hero } from '../services/api';

interface CounterListProps {
    counters: CounterPick[];
    loading: boolean;
    selectedEnemies: Hero[];
}

export const CounterList: React.FC<CounterListProps> = ({ counters, loading, selectedEnemies }) => {
    if (loading && counters.length === 0) {
        return (
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (counters.length === 0) {
        return (
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 flex flex-col justify-center items-center h-full text-slate-400 text-center">
                <p>Select heroes from either team to see suggestions.</p>
            </div>
        );
    }

    const [showTailored, setShowTailored] = useState(false);

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Top Picks</h2>
                    <p className="text-xs text-slate-400 mt-1">Based on Pro Matchups</p>
                </div>
                {counters.length > 0 && (
                    <button
                        onClick={() => setShowTailored(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
                    >
                        <Sparkles className="h-3 w-3" />
                        Tailored Pick
                    </button>
                )}
            </div>

            <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
                {counters.map((counter, idx) => (
                    <div
                        key={counter.hero.id}
                        className="flex items-center gap-4 bg-slate-700/40 hover:bg-slate-700/80 p-3 rounded-lg border border-transparent hover:border-indigo-500/50 transition-all group animate-fadeIn"
                        style={{ animationDelay: `${idx * 0.05}s` }}
                    >
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
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Advantage</div>
                        </div>
                    </div>
                ))}
            </div>

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

                            <h3 className="text-2xl font-bold text-white mb-1">Tailored Pick</h3>
                            <p className="text-slate-400 text-sm mb-6">Based on your team & enemy composition</p>

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
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Advantage</div>
                                    <div className="text-xl font-bold text-green-400">+{counters[0].score.toFixed(1)}%</div>
                                </div>
                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Win Rate</div>
                                    <div className="text-xl font-bold text-indigo-400">{(counters[0].winRate * 100).toFixed(1)}%</div>
                                </div>
                            </div>

                            {counters[0].reasons && counters[0].reasons.length > 0 && (
                                <div className="text-left bg-indigo-900/20 rounded-lg p-4 border border-indigo-500/20 mb-4">
                                    <h4 className="text-xs font-bold text-indigo-300 uppercase mb-2 flex items-center gap-2">
                                        <Sparkles className="h-3 w-3" />
                                        Why this hero?
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

                            {/* Recommended Items & Skills logic */}
                            {(() => {
                                // Re-derive traits logic locally for display
                                const enemyTraits = new Set<string>();
                                selectedEnemies.forEach(e => {
                                    Object.keys(HERO_TAGS).forEach(tag => {
                                        if (HERO_TAGS[tag].includes(e.id)) {
                                            enemyTraits.add(tag);
                                        }
                                    });
                                });

                                const hero = counters[0].hero;
                                const isSupport = hero.roles.includes('Support');
                                const role = isSupport ? 'Support' : 'Core';
                                const items = recommendItems(enemyTraits, role, hero.attack_type);
                                const strategies = recommendSkillStrategy(enemyTraits);

                                if (items.length === 0 && strategies.length === 0) return null;

                                return (
                                    <div className="text-left bg-emerald-900/20 rounded-lg p-4 border border-emerald-500/20">
                                        <h4 className="text-xs font-bold text-emerald-300 uppercase mb-2 flex items-center gap-2">
                                            <Sparkles className="h-3 w-3" />
                                            Situational Build
                                        </h4>

                                        {items.length > 0 && (
                                            <div className="mb-3">
                                                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Key Items vs Enemy Team</div>
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
                                                <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Strategy</div>
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
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
