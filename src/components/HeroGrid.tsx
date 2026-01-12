import { useState, useMemo } from 'react';
import { type Hero } from '../services/api';
import { Search } from 'lucide-react';
import { getHeroesByAbbreviation } from '../data/heroAbbreviations';

interface HeroGridProps {
    heroes: Hero[];
    onSelect: (hero: Hero) => void;
    selectedIds: number[];
}

export const HeroGrid = ({ heroes, onSelect, selectedIds }: HeroGridProps) => {
    const [search, setSearch] = useState('');

    const filteredHeroes = useMemo(() => {
        // Check for exact abbreviation match first
        const abbrMatches = getHeroesByAbbreviation(search);

        return heroes.filter(h => {
            // Search filter
            if (!search) return true;

            const searchLower = search.toLowerCase();
            const nameMatch = h.localized_name.toLowerCase().includes(searchLower);
            const abbrMatch = abbrMatches.some(name => h.localized_name === name); // Exact match via abbreviation map

            return nameMatch || abbrMatch;
        }).sort((a, b) => a.localized_name.localeCompare(b.localized_name));
    }, [heroes, search]);

    return (
        <div className="flex-1 min-h-0 flex flex-col bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-700">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search heroes (e.g. 'pl', 'axe', 'am')..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
                    />
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                    {filteredHeroes.map(hero => {
                        const isSelected = selectedIds.includes(hero.id);
                        return (
                            <button
                                key={hero.id}
                                onClick={() => !isSelected && onSelect(hero)}
                                disabled={isSelected}
                                className={`group relative aspect-[16/9] bg-slate-900 rounded overflow-hidden border transition-all
                    ${isSelected
                                        ? 'border-slate-800 opacity-40 grayscale cursor-not-allowed'
                                        : 'border-slate-700 hover:border-indigo-500 hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]'
                                    }`}
                            >
                                <img
                                    src={hero.img}
                                    alt={hero.localized_name}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60" />
                                <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-slate-200 leading-none truncate w-[90%] text-left">
                                    {hero.localized_name}
                                </span>
                            </button>
                        );
                    })}

                    {filteredHeroes.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500">
                            No heroes found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
