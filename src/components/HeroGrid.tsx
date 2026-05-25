import { useEffect, useMemo, useRef, useState } from 'react';
import { type Hero } from '../services/api';
import { CheckCircle2, Search, X } from 'lucide-react';
import { getHeroesByAbbreviation } from '../data/heroAbbreviations';
import { useLanguage } from '../context/useLanguage';
import { getHeroRoles, type Position } from '../data/heroPositions';
import type { TranslationKey } from '../i18n/translations';

interface HeroGridProps {
    heroes: Hero[];
    onSelect: (hero: Hero) => void;
    selectedIds: number[];
    /** When set, heroes that can play this position are highlighted. */
    filterRole?: Position | null;
    /** If true AND filterRole is set, heroes that can't play the role are hidden. */
    hideOffRole?: boolean;
}

const ROLE_KEYS = {
    Carry: 'roleCarry',
    Mid: 'roleMid',
    Offlane: 'roleOfflane',
    SoftSupport: 'roleSoftSupport',
    HardSupport: 'roleHardSupport',
} as const satisfies Record<Position, TranslationKey>;

export const HeroGrid = ({ heroes, onSelect, selectedIds, filterRole, hideOffRole }: HeroGridProps) => {
    const { t } = useLanguage();
    const [search, setSearch] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const focusTimer = window.setTimeout(() => {
            if (window.matchMedia('(min-width: 1024px)').matches) {
                searchInputRef.current?.focus({ preventScroll: true });
            }
        }, 0);

        return () => window.clearTimeout(focusTimer);
    }, []);

    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const filteredHeroes = useMemo(() => {
        const trimmedSearch = search.trim();
        const searchLower = trimmedSearch.toLowerCase();
        const abbrMatches = getHeroesByAbbreviation(trimmedSearch);

        return heroes.filter(h => {
            if (!searchLower) return true;

            const nameLower = h.localized_name.toLowerCase();

            // Substring match
            if (nameLower.includes(searchLower)) return true;

            // Abbreviation map match
            if (abbrMatches.some(name => h.localized_name === name)) return true;

            // Initials match: "sf" → "Shadow Fiend", "dp" → "Death Prophet"
            const initials = nameLower.split(/[\s'-]+/).map(w => w[0]).join('');
            if (initials === searchLower) return true;

            return false;
        }).sort((a, b) => a.localized_name.localeCompare(b.localized_name));
    }, [heroes, search]);

    return (
        <div className="surface flex-1 min-h-0 flex flex-col rounded-lg overflow-hidden">
            {/* Search Bar */}
            <div className="p-3 border-b border-white/10">
                <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                        <div className="label-sm">{t('heroPool')}</div>
                        <div className="text-xs text-white/45">{filteredHeroes.length} {t('available')}</div>
                    </div>
                    {filterRole && (
                        <div className="control-chip border-gold-500/35 bg-gold-500/10 text-gold-300">
                            {t(ROLE_KEYS[filterRole])}
                        </div>
                    )}
                </div>
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-400/60 h-4 w-4" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape' && search) {
                                setSearch('');
                                e.stopPropagation();
                            }
                        }}
                        className="w-full rounded-md border border-white/10 bg-obsidian-900/75 pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/30 transition-all focus:border-gold-500/60 focus:outline-none focus:shadow-[0_0_0_3px_rgba(251,191,36,0.10)]"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                searchInputRef.current?.focus();
                            }}
                            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-white/35 transition-colors hover:bg-white/5 hover:text-white"
                            aria-label={t('clearSearch')}
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                    {filteredHeroes.map(hero => {
                        const isSelected = selectedIdSet.has(hero.id);
                        const canPlayRole = filterRole
                            ? getHeroRoles(hero.id, hero.roles, hero.primary_attr).includes(filterRole)
                            : true;

                        if (filterRole && hideOffRole && !canPlayRole) return null;

                        const roleMatch = Boolean(filterRole && canPlayRole && !isSelected && !hideOffRole);

                        return (
                            <button
                                key={hero.id}
                                onClick={() => {
                                    if (isSelected) return;
                                    onSelect(hero);
                                    setSearch('');
                                    searchInputRef.current?.focus();
                                }}
                                disabled={isSelected}
                                className={`group relative aspect-[16/9] bg-obsidian-900 rounded-md overflow-hidden border transition-all duration-200 ease-expo-out
                    ${isSelected
                                        ? 'border-gold-500/55 cursor-not-allowed ring-1 ring-gold-400/30 shadow-[0_14px_28px_-24px_rgba(251,191,36,0.9)]'
                                        : roleMatch
                                            ? 'border-gold-400/55 ring-1 ring-gold-400/30 shadow-[0_14px_28px_-24px_rgba(251,191,36,0.9)] hover:border-gold-300 hover:-translate-y-0.5'
                                            : 'border-white/10 hover:border-gold-400/80 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-22px_rgba(251,191,36,0.95)]'
                                    }`}
                            >
                                <img
                                    src={hero.img}
                                    alt={hero.localized_name}
                                    className={`w-full h-full object-cover transition-all duration-300 ease-expo-out group-hover:scale-[1.06] ${
                                        roleMatch ? 'brightness-110 contrast-105' : ''
                                    }`}
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900/95 via-obsidian-900/20 to-transparent" />
                                {roleMatch && (
                                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-gold-300/55 bg-obsidian-900/75 text-gold-300 shadow-[0_0_14px_-6px_rgba(251,191,36,0.95)]">
                                        <CheckCircle2 className="h-3 w-3" />
                                    </span>
                                )}
                                {isSelected && (
                                    <>
                                        <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-gold-200/70 bg-gold-400 text-obsidian-950 shadow-[0_0_14px_-6px_rgba(251,191,36,0.95)]">
                                            <CheckCircle2 className="h-3 w-3" />
                                        </span>
                                        <span className="absolute left-1.5 top-1.5 rounded border border-gold-300/45 bg-obsidian-950/80 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-gold-200">
                                            {t('picked')}
                                        </span>
                                    </>
                                )}
                                <span className="absolute bottom-1.5 left-1.5 w-[90%] truncate text-left text-[10px] font-bold leading-none text-white/90 drop-shadow">
                                    {hero.localized_name}
                                </span>
                            </button>
                        );
                    })}

                    {filteredHeroes.length === 0 && (
                        <div className="col-span-full py-12 text-center text-white/35">
                            {t('noHeroesFound')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
