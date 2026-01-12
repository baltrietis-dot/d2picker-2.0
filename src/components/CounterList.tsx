import React from 'react';
import type { CounterPick } from '../hooks/useCounterPicker';

interface CounterListProps {
    counters: CounterPick[];
    loading: boolean;
}

export const CounterList: React.FC<CounterListProps> = ({ counters, loading }) => {
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

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur">
                <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Top Counter Picks</h2>
                <p className="text-xs text-slate-400 mt-1">Based on Pro Matchup Advantage</p>
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
        </div>
    );
};
