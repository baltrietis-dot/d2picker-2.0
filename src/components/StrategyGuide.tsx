import React, { useEffect, useMemo, useState } from 'react';
import { X, Sparkles, Swords, TrendingUp, Map, Zap, Coins, Crown } from 'lucide-react';
import { api, type Hero, type HeroBuild, type HeroDurations, type ItemsMap, type ItemBucket } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { HERO_TAGS } from '../data/heroTags';
import { getHeroRoles } from '../data/heroPositions';

type Tab = 'build' | 'spike' | 'laning' | 'ability';

interface StrategyGuideProps {
    hero: Hero;
    onClose: () => void;
}

export const StrategyGuide: React.FC<StrategyGuideProps> = ({ hero, onClose }) => {
    const { t } = useLanguage();
    const [tab, setTab] = useState<Tab>('build');

    const [build, setBuild] = useState<HeroBuild | null>(null);
    const [durations, setDurations] = useState<HeroDurations>({});
    const [items, setItems] = useState<ItemsMap>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        Promise.all([
            api.fetchBuild(hero.id),
            api.fetchDurations(hero.id),
            api.fetchItems()
        ]).then(([b, d, i]) => {
            if (cancelled) return;
            setBuild(b);
            setDurations(d);
            setItems(i);
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [hero.id]);

    // Close on ESC
    useEffect(() => {
        const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, [onClose]);

    const heroTags = useMemo(() => {
        const tags = new Set<string>();
        Object.keys(HERO_TAGS).forEach(tag => {
            if (HERO_TAGS[tag].includes(hero.id)) tags.add(tag);
        });
        return tags;
    }, [hero.id]);

    const heroRoles = useMemo(
        () => getHeroRoles(hero.id, hero.roles, hero.primary_attr),
        [hero]
    );

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl shadow-indigo-500/25 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-96 h-48 bg-indigo-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-48 bg-purple-500/10 blur-3xl pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-slate-300 hover:text-white hover:bg-black/60 transition-colors z-20"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header — hero banner */}
                <div className="relative overflow-hidden">
                    <img
                        src={hero.img}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/70" />

                    <div className="relative flex items-center gap-4 p-5 border-b border-slate-700">
                        <div className="relative">
                            <img
                                src={hero.img}
                                alt={hero.localized_name}
                                className="w-24 h-14 rounded-lg object-cover shadow-xl ring-2 ring-indigo-500/40"
                            />
                            <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full p-1 shadow-lg shadow-amber-500/40">
                                <Crown className="h-3 w-3 text-white" />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-[10px] text-indigo-300 uppercase tracking-widest font-bold mb-0.5">
                                <Sparkles className="h-3 w-3" />
                                {t('strategyGuide')}
                            </div>
                            <h2 className="text-2xl font-black text-white truncate drop-shadow">{hero.localized_name}</h2>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                {heroRoles.map(role => (
                                    <span key={role} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-200 rounded border border-indigo-500/30">
                                        {role}
                                    </span>
                                ))}
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-700/60 text-slate-300 rounded border border-slate-600">
                                    {hero.attack_type}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-700/60 text-slate-300 rounded border border-slate-600">
                                    {hero.primary_attr}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="relative flex border-b border-slate-700 bg-slate-950/50">
                    <TabButton active={tab === 'build'} onClick={() => setTab('build')} icon={<Swords className="h-4 w-4" />} label={t('itemBuild')} />
                    <TabButton active={tab === 'spike'} onClick={() => setTab('spike')} icon={<TrendingUp className="h-4 w-4" />} label={t('powerSpike')} />
                    <TabButton active={tab === 'laning'} onClick={() => setTab('laning')} icon={<Map className="h-4 w-4" />} label={t('laning')} />
                    <TabButton active={tab === 'ability'} onClick={() => setTab('ability')} icon={<Zap className="h-4 w-4" />} label={t('abilityPriority')} />
                </div>

                {/* Content */}
                <div className="relative overflow-y-auto flex-1 p-5 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500/20 border-t-indigo-500" />
                            <div className="text-xs text-slate-500 uppercase tracking-widest">Loading pro data…</div>
                        </div>
                    ) : (
                        <div className="animate-fadeIn">
                            {tab === 'build' && <ItemBuildTab build={build} items={items} />}
                            {tab === 'spike' && <PowerSpikeTab durations={durations} />}
                            {tab === 'laning' && <LaningTab heroRoles={heroRoles} heroTags={heroTags} />}
                            {tab === 'ability' && <AbilityTab heroTags={heroTags} />}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ---------------- Tab button ---------------- */

const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-3.5 text-xs font-bold uppercase tracking-wider transition-all ${
            active
                ? 'text-white bg-gradient-to-b from-indigo-500/20 to-transparent'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
        }`}
    >
        <span className={active ? 'text-indigo-400' : ''}>{icon}</span>
        <span className="hidden sm:inline">{label}</span>
        {active && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent" />
        )}
    </button>
);

/* ---------------- Tab 1: Item Build ---------------- */

const ItemBuildTab: React.FC<{ build: HeroBuild | null; items: ItemsMap }> = ({ build, items }) => {
    const { t } = useLanguage();

    const hasData = build && (build.start?.length || build.early?.length || build.mid?.length || build.late?.length);
    if (!hasData) {
        return <EmptyState text={t('noBuildData')} icon={<Swords className="h-8 w-8" />} />;
    }

    const stages: { key: keyof HeroBuild; label: string; accent: string; iconColor: string }[] = [
        { key: 'start', label: t('startingItems'), accent: 'from-slate-600 to-slate-700', iconColor: 'text-slate-400' },
        { key: 'early', label: t('earlyGame'), accent: 'from-emerald-600 to-emerald-700', iconColor: 'text-emerald-400' },
        { key: 'mid', label: t('midGame'), accent: 'from-amber-600 to-amber-700', iconColor: 'text-amber-400' },
        { key: 'late', label: t('lateGame'), accent: 'from-rose-600 to-rose-700', iconColor: 'text-rose-400' },
    ];

    return (
        <div className="space-y-5">
            {stages.map(stage => {
                const bucket = build![stage.key];
                if (!bucket || bucket.length === 0) return null;
                return (
                    <BuildStage
                        key={stage.key}
                        label={stage.label}
                        accent={stage.accent}
                        iconColor={stage.iconColor}
                        bucket={bucket}
                        items={items}
                    />
                );
            })}
        </div>
    );
};

const BuildStage: React.FC<{
    label: string;
    accent: string;
    iconColor: string;
    bucket: ItemBucket[];
    items: ItemsMap;
}> = ({ label, accent, iconColor, bucket, items }) => {
    const totalGames = bucket.reduce((s, b) => s + b.games, 0);

    return (
        <div>
            <div className="flex items-center gap-2 mb-2.5">
                <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-br ${accent}`} />
                <div className={`text-[10px] uppercase tracking-widest font-black ${iconColor}`}>{label}</div>
                <div className="flex-1 h-px bg-slate-800" />
                <div className="text-[10px] text-slate-600 font-mono">{totalGames.toLocaleString()} total</div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {bucket.slice(0, 6).map(entry => {
                    const meta = items[String(entry.id)];
                    const pct = totalGames > 0 ? Math.round((entry.games / totalGames) * 100) : 0;
                    return (
                        <div key={entry.id} className="relative group/item">
                            <div className="relative aspect-[88/64] rounded-md overflow-hidden border border-slate-700 group-hover/item:border-indigo-500/60 transition-all shadow-md bg-slate-900">
                                {meta ? (
                                    <img
                                        src={api.resolveItemImg(meta)}
                                        alt={meta.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-500">
                                        #{entry.id}
                                    </div>
                                )}
                                {/* Popularity bar */}
                                <div className="absolute bottom-0 inset-x-0 h-1 bg-black/40">
                                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${pct}%` }} />
                                </div>
                                {/* % badge */}
                                <div className="absolute top-0 right-0 bg-black/70 text-[9px] text-white font-black px-1 rounded-bl">
                                    {pct}%
                                </div>
                            </div>

                            {/* Tooltip */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity z-20">
                                <div className="bg-slate-950 text-white text-[10px] px-2 py-1.5 rounded shadow-xl whitespace-nowrap border border-slate-700">
                                    <div className="font-bold">{meta?.name || `Item ${entry.id}`}</div>
                                    {meta?.cost ? (
                                        <div className="flex items-center gap-1 text-amber-400 mt-0.5">
                                            <Coins className="h-2.5 w-2.5" />
                                            {meta.cost.toLocaleString()}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ---------------- Tab 2: Power Spike ---------------- */

const PowerSpikeTab: React.FC<{ durations: HeroDurations }> = ({ durations }) => {
    const { t } = useLanguage();

    const bins = Object.entries(durations)
        .map(([bin, data]) => ({ bin: Number(bin), ...data }))
        .sort((a, b) => a.bin - b.bin);

    if (bins.length === 0) {
        return <EmptyState text={t('noDurationData')} icon={<TrendingUp className="h-8 w-8" />} />;
    }

    const peak = bins.reduce((best, b) => (b.winRate > best.winRate ? b : best), bins[0]);
    const winRateSpread = Math.max(...bins.map(b => b.winRate)) - Math.min(...bins.map(b => b.winRate));

    let label: string;
    let badgeColour: string;
    if (winRateSpread < 0.03) {
        label = t('flatCurve');
        badgeColour = 'from-slate-600 to-slate-700';
    } else if (peak.bin <= 15) {
        label = t('peaksEarly');
        badgeColour = 'from-emerald-600 to-emerald-700';
    } else if (peak.bin <= 35) {
        label = t('peaksMid');
        badgeColour = 'from-amber-600 to-amber-700';
    } else {
        label = t('peaksLate');
        badgeColour = 'from-rose-600 to-rose-700';
    }

    return (
        <div className="space-y-5">
            {/* Summary card */}
            <div className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${badgeColour} shadow-lg`}>
                <Sparkles className="absolute top-2 right-2 h-20 w-20 text-white/5" />
                <div className="relative">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-white/70 mb-1">Power curve</div>
                    <div className="text-base font-bold text-white">{label}</div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800">
                <div className="space-y-2">
                    {bins.map(b => {
                        const pct = b.winRate * 100;
                        let colour = 'from-slate-600 to-slate-500';
                        let textColour = 'text-slate-300';
                        if (pct >= 52) { colour = 'from-emerald-600 to-emerald-400'; textColour = 'text-emerald-300'; }
                        else if (pct >= 50) { colour = 'from-amber-600 to-amber-400'; textColour = 'text-amber-300'; }
                        else if (pct < 48) { colour = 'from-rose-600 to-rose-400'; textColour = 'text-rose-300'; }

                        // Map 42–56% → 0–100% width for better visual spread
                        const widthPct = Math.max(4, Math.min(100, ((b.winRate - 0.42) / 0.14) * 100));
                        const isPeak = b.bin === peak.bin;

                        return (
                            <div key={b.bin} className="flex items-center gap-2">
                                <div className={`w-14 text-[11px] font-mono font-bold text-right ${isPeak ? 'text-amber-300' : 'text-slate-500'}`}>
                                    {b.bin}–{b.bin + 10}'
                                </div>
                                <div className="flex-1 bg-slate-900 rounded h-7 overflow-hidden relative border border-slate-800">
                                    <div
                                        className={`h-full bg-gradient-to-r ${colour} transition-all duration-500`}
                                        style={{ width: `${widthPct}%` }}
                                    />
                                    {/* 50% reference line */}
                                    <div className="absolute top-0 bottom-0 w-px bg-white/30" style={{ left: `${((0.50 - 0.42) / 0.14) * 100}%` }} />
                                    <div className={`absolute inset-0 flex items-center px-2.5 text-xs font-black ${textColour} drop-shadow`}>
                                        {pct.toFixed(1)}%
                                        {isPeak && <Sparkles className="h-3 w-3 ml-1.5 text-amber-300" />}
                                    </div>
                                </div>
                                <div className="w-14 text-[10px] text-slate-600 font-mono text-right">
                                    {b.games > 999 ? `${Math.round(b.games / 1000)}k` : b.games}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500">
                    <LegendDot colour="bg-emerald-500" label="52%+" />
                    <LegendDot colour="bg-amber-500" label="50–52%" />
                    <LegendDot colour="bg-slate-500" label="48–50%" />
                    <LegendDot colour="bg-rose-500" label="<48%" />
                </div>
            </div>
        </div>
    );
};

const LegendDot: React.FC<{ colour: string; label: string }> = ({ colour, label }) => (
    <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${colour}`} />
        <span>{label}</span>
    </div>
);

/* ---------------- Tab 3: Laning ---------------- */

const LaningTab: React.FC<{ heroRoles: string[]; heroTags: Set<string> }> = ({ heroRoles, heroTags }) => {
    const { t } = useLanguage();

    const tips: { text: string; accent: string }[] = [];
    if (heroRoles.includes('Carry')) tips.push({ text: t('laneTipCarry'), accent: 'emerald' });
    if (heroRoles.includes('Mid')) tips.push({ text: t('laneTipMid'), accent: 'indigo' });
    if (heroRoles.includes('Offlane')) tips.push({ text: t('laneTipOfflane'), accent: 'rose' });
    if (heroRoles.includes('SoftSupport')) tips.push({ text: t('laneTipSoftSupport'), accent: 'cyan' });
    if (heroRoles.includes('HardSupport')) tips.push({ text: t('laneTipHardSupport'), accent: 'pink' });
    if (heroTags.has('STUNNER')) tips.push({ text: t('laneTipStunner'), accent: 'amber' });
    if (heroTags.has('HEALER')) tips.push({ text: t('laneTipHealer'), accent: 'pink' });

    return (
        <ul className="space-y-2.5">
            {tips.map((tip, i) => (
                <TipCard key={i} text={tip.text} accent={tip.accent} index={i} icon={<Map className="h-4 w-4" />} />
            ))}
        </ul>
    );
};

/* ---------------- Tab 4: Ability ---------------- */

const AbilityTab: React.FC<{ heroTags: Set<string> }> = ({ heroTags }) => {
    const { t } = useLanguage();

    const tips: { text: string; accent: string }[] = [];
    if (heroTags.has('STUNNER')) tips.push({ text: t('abilityTipStunner'), accent: 'amber' });
    if (heroTags.has('NUKE')) tips.push({ text: t('abilityTipNuke'), accent: 'indigo' });
    if (heroTags.has('CARRY')) tips.push({ text: t('abilityTipCarry'), accent: 'emerald' });
    if (heroTags.has('ESCAPE')) tips.push({ text: t('abilityTipEscape'), accent: 'cyan' });
    if (tips.length === 0) tips.push({ text: t('abilityTipDefault'), accent: 'slate' });
    tips.push({ text: t('abilityTipUlt'), accent: 'amber' });

    return (
        <ul className="space-y-2.5">
            {tips.map((tip, i) => (
                <TipCard key={i} text={tip.text} accent={tip.accent} index={i} icon={<Zap className="h-4 w-4" />} />
            ))}
        </ul>
    );
};

/* ---------------- Shared ---------------- */

const ACCENT_MAP: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    emerald: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-300', icon: 'text-emerald-400' },
    indigo:  { bg: 'bg-indigo-500/5',  border: 'border-indigo-500/20',  text: 'text-indigo-300',  icon: 'text-indigo-400' },
    rose:    { bg: 'bg-rose-500/5',    border: 'border-rose-500/20',    text: 'text-rose-300',    icon: 'text-rose-400' },
    cyan:    { bg: 'bg-cyan-500/5',    border: 'border-cyan-500/20',    text: 'text-cyan-300',    icon: 'text-cyan-400' },
    amber:   { bg: 'bg-amber-500/5',   border: 'border-amber-500/20',   text: 'text-amber-300',   icon: 'text-amber-400' },
    pink:    { bg: 'bg-pink-500/5',    border: 'border-pink-500/20',    text: 'text-pink-300',    icon: 'text-pink-400' },
    slate:   { bg: 'bg-slate-500/5',   border: 'border-slate-500/20',   text: 'text-slate-300',   icon: 'text-slate-400' },
};

const TipCard: React.FC<{ text: string; accent: string; index: number; icon: React.ReactNode }> = ({ text, accent, index, icon }) => {
    const a = ACCENT_MAP[accent] || ACCENT_MAP.slate;
    return (
        <li
            className={`flex items-start gap-3 ${a.bg} rounded-xl p-3.5 border ${a.border} animate-fadeIn`}
            style={{ animationDelay: `${index * 60}ms` }}
        >
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-slate-900/60 flex items-center justify-center ${a.icon}`}>
                {icon}
            </div>
            <span className={`text-sm leading-relaxed pt-1 ${a.text}`}>{text}</span>
        </li>
    );
};

const EmptyState: React.FC<{ text: string; icon: React.ReactNode }> = ({ text, icon }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-slate-700 mb-3">{icon}</div>
        <div className="text-sm text-slate-500">{text}</div>
    </div>
);
