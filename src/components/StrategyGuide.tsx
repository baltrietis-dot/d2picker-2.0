import React, { useEffect, useMemo, useState } from 'react';
import { X, Sparkles, Swords, TrendingUp, Map, Zap, Coins } from 'lucide-react';
import { api, type Hero, type HeroBuild, type HeroDurations, type ItemsMap, type ItemBucket } from '../services/api';
import { useLanguage } from '../context/useLanguage';
import { HERO_TAGS } from '../data/heroTags';
import { getHeroRoles } from '../data/heroPositions';

type Tab = 'build' | 'spike' | 'laning' | 'ability';
type DraftData = {
    heroId: number;
    build: HeroBuild | null;
    durations: HeroDurations;
    items: ItemsMap;
};

interface StrategyGuideProps {
    hero: Hero;
    onClose: () => void;
}

export const StrategyGuide: React.FC<StrategyGuideProps> = ({ hero, onClose }) => {
    const { t } = useLanguage();
    const [tab, setTab] = useState<Tab>('build');
    const [draftData, setDraftData] = useState<DraftData | null>(null);
    const activeDraftData = draftData?.heroId === hero.id ? draftData : null;
    const build = activeDraftData?.build ?? null;
    const durations = activeDraftData?.durations ?? {};
    const items = activeDraftData?.items ?? {};
    const loading = !activeDraftData;

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            api.fetchBuild(hero.id),
            api.fetchDurations(hero.id),
            api.fetchItems()
        ]).then(([b, d, i]) => {
            if (cancelled) return;
            setDraftData({
                heroId: hero.id,
                build: b,
                durations: d,
                items: i,
            });
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
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-obsidian-900/85 backdrop-blur-md animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="relative bg-gradient-to-b from-obsidian-700 to-obsidian-900 rounded-2xl shadow-gold-lg max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn gold-frame"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Ambient glow */}
                <div className="absolute top-0 right-0 w-96 h-48 bg-gold-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-48 bg-gold-700/15 blur-3xl pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-obsidian-900/60 text-white/55 hover:text-white hover:bg-obsidian-900/80 transition-colors z-20"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header - hero banner */}
                <div className="relative overflow-hidden">
                    <img
                        src={hero.img}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-obsidian-900/95 via-obsidian-900/85 to-obsidian-900/70" />

                    <div className="relative flex items-center gap-4 p-5 border-b border-gold-700/20">
                        <div className="relative gold-frame rounded-lg">
                            <img
                                src={hero.img}
                                alt={hero.localized_name}
                                className="w-24 h-14 rounded-lg object-cover shadow-gold"
                            />
                            <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-gold-300 to-gold-600 rounded-full p-1 shadow-[0_4px_12px_-2px_rgba(217,119,6,0.6)]">
                                <Sparkles className="h-3 w-3 text-obsidian-900" />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-[10px] text-gold-300 uppercase tracking-[0.2em] font-bold mb-0.5">
                                <Sparkles className="h-3 w-3" />
                                {t('strategyGuide')}
                            </div>
                            <h2 className="font-display text-2xl font-black text-white truncate drop-shadow tracking-wide">{hero.localized_name}</h2>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                {heroRoles.map(role => (
                                    <span key={role} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gold-500/15 text-gold-200 rounded border border-gold-500/30">
                                        {role}
                                    </span>
                                ))}
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-obsidian-700/60 text-white/70 rounded border border-obsidian-500/60">
                                    {hero.attack_type}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-obsidian-700/60 text-white/70 rounded border border-obsidian-500/60">
                                    {hero.primary_attr}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="relative flex border-b border-gold-700/20 bg-obsidian-900/60">
                    <TabButton active={tab === 'build'} onClick={() => setTab('build')} icon={<Swords className="h-4 w-4" />} label={t('itemBuild')} />
                    <TabButton active={tab === 'spike'} onClick={() => setTab('spike')} icon={<TrendingUp className="h-4 w-4" />} label={t('powerSpike')} />
                    <TabButton active={tab === 'laning'} onClick={() => setTab('laning')} icon={<Map className="h-4 w-4" />} label={t('laning')} />
                    <TabButton active={tab === 'ability'} onClick={() => setTab('ability')} icon={<Zap className="h-4 w-4" />} label={t('abilityPriority')} />
                </div>

                {/* Content */}
                <div className="relative overflow-y-auto flex-1 p-5 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gold-500/20 border-t-gold-400" />
                            <div className="text-xs text-white/40 uppercase tracking-widest">Loading draft data...</div>
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
        className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ease-expo-out ${
            active
                ? 'text-white bg-gradient-to-b from-gold-500/15 to-transparent'
                : 'text-white/40 hover:text-white/80 hover:bg-obsidian-700/40'
        }`}
    >
        <span className={active ? 'text-gold-400' : ''}>{icon}</span>
        <span className="hidden sm:inline">{label}</span>
        {active && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
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
        { key: 'start', label: t('startingItems'), accent: 'from-obsidian-500 to-obsidian-600', iconColor: 'text-white/55' },
        { key: 'early', label: t('earlyGame'), accent: 'from-radiant-500 to-radiant-700', iconColor: 'text-radiant-400' },
        { key: 'mid', label: t('midGame'), accent: 'from-gold-500 to-gold-700', iconColor: 'text-gold-400' },
        { key: 'late', label: t('lateGame'), accent: 'from-dire-600 to-dire-800', iconColor: 'text-dire-400' },
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
                <div className={`text-[10px] uppercase tracking-[0.2em] font-black ${iconColor}`}>{label}</div>
                <div className="flex-1 h-px bg-gold-700/15" />
                <div className="text-[10px] text-white/35 font-mono">{totalGames.toLocaleString()} total</div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {bucket.slice(0, 6).map(entry => {
                    const meta = items[String(entry.id)];
                    const pct = totalGames > 0 ? Math.round((entry.games / totalGames) * 100) : 0;
                    return (
                        <div key={entry.id} className="relative group/item">
                            <div className="relative aspect-[88/64] rounded-md overflow-hidden border border-obsidian-500 group-hover/item:border-gold-400 group-hover/item:-translate-y-0.5 group-hover/item:shadow-[0_0_18px_-4px_rgba(251,191,36,0.5)] transition-all duration-200 ease-expo-out shadow-md bg-obsidian-900">
                                {meta ? (
                                    <img
                                        src={api.resolveItemImg(meta)}
                                        alt={meta.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[9px] text-white/40">
                                        #{entry.id}
                                    </div>
                                )}
                                {/* Popularity bar */}
                                <div className="absolute bottom-0 inset-x-0 h-1 bg-obsidian-900/60">
                                    <div className="h-full bg-gradient-to-r from-gold-600 to-gold-300" style={{ width: `${pct}%` }} />
                                </div>
                                {/* % badge */}
                                <div className="absolute top-0 right-0 bg-obsidian-900/85 text-[9px] text-gold-300 font-black px-1 rounded-bl">
                                    {pct}%
                                </div>
                            </div>

                            {/* Tooltip */}
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity z-20">
                                <div className="bg-obsidian-900 text-white text-[10px] px-2 py-1.5 rounded shadow-xl whitespace-nowrap border border-gold-700/30">
                                    <div className="font-bold">{meta?.name || `Item ${entry.id}`}</div>
                                    {meta?.cost ? (
                                        <div className="flex items-center gap-1 text-gold-400 mt-0.5">
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
        badgeColour = 'from-obsidian-500 to-obsidian-700';
    } else if (peak.bin <= 15) {
        label = t('peaksEarly');
        badgeColour = 'from-radiant-500 to-radiant-800';
    } else if (peak.bin <= 35) {
        label = t('peaksMid');
        badgeColour = 'from-gold-500 to-gold-700';
    } else {
        label = t('peaksLate');
        badgeColour = 'from-dire-600 to-dire-900';
    }

    return (
        <div className="space-y-5">
            {/* Summary card */}
            <div className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br ${badgeColour} shadow-lg gold-frame`}>
                <Sparkles className="absolute top-2 right-2 h-20 w-20 text-white/5" />
                <div className="relative">
                    <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/75 mb-1">Power curve</div>
                    <div className="font-display text-base font-bold text-white tracking-wide">{label}</div>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-obsidian-900/60 rounded-xl p-4 border border-gold-700/15">
                <div className="space-y-2">
                    {bins.map(b => {
                        const pct = b.winRate * 100;
                        let colour = 'from-obsidian-600 to-obsidian-500';
                        let textColour = 'text-white/70';
                        if (pct >= 52) { colour = 'from-radiant-700 to-radiant-400'; textColour = 'text-radiant-300'; }
                        else if (pct >= 50) { colour = 'from-gold-700 to-gold-300'; textColour = 'text-gold-200'; }
                        else if (pct < 48) { colour = 'from-dire-700 to-dire-500'; textColour = 'text-dire-300'; }

                        // Map 42-56% to 0-100% width for better visual spread
                        const widthPct = Math.max(4, Math.min(100, ((b.winRate - 0.42) / 0.14) * 100));
                        const isPeak = b.bin === peak.bin;

                        return (
                            <div key={b.bin} className="flex items-center gap-2">
                                <div className={`w-14 text-[11px] font-mono font-bold text-right ${isPeak ? 'text-gold-300' : 'text-white/40'}`}>
                                    {b.bin}–{b.bin + 10}'
                                </div>
                                <div className="flex-1 bg-obsidian-900 rounded h-7 overflow-hidden relative border border-obsidian-600">
                                    <div
                                        className={`h-full bg-gradient-to-r ${colour} transition-all duration-500 ease-expo-out`}
                                        style={{ width: `${widthPct}%` }}
                                    />
                                    {/* 50% reference line */}
                                    <div className="absolute top-0 bottom-0 w-px bg-white/30" style={{ left: `${((0.50 - 0.42) / 0.14) * 100}%` }} />
                                    <div className={`absolute inset-0 flex items-center px-2.5 text-xs font-black ${textColour} drop-shadow`}>
                                        {pct.toFixed(1)}%
                                        {isPeak && <Sparkles className="h-3 w-3 ml-1.5 text-gold-300" />}
                                    </div>
                                </div>
                                <div className="w-14 text-[10px] text-white/35 font-mono text-right">
                                    {b.games > 999 ? `${Math.round(b.games / 1000)}k` : b.games}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-gold-700/15 text-[10px] text-white/45">
                    <LegendDot colour="bg-radiant-500" label="52%+" />
                    <LegendDot colour="bg-gold-400" label="50–52%" />
                    <LegendDot colour="bg-obsidian-400" label="48–50%" />
                    <LegendDot colour="bg-dire-500" label="<48%" />
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
    // Mapped to 3-color palette: gold (primary), dire (warning/late), radiant (positive/early)
    emerald: { bg: 'bg-radiant-500/5', border: 'border-radiant-500/25', text: 'text-radiant-300', icon: 'text-radiant-400' },
    indigo:  { bg: 'bg-gold-500/5',    border: 'border-gold-500/25',    text: 'text-gold-200',    icon: 'text-gold-400' },
    rose:    { bg: 'bg-dire-500/5',    border: 'border-dire-500/25',    text: 'text-dire-300',    icon: 'text-dire-400' },
    cyan:    { bg: 'bg-radiant-500/5', border: 'border-radiant-500/25', text: 'text-radiant-300', icon: 'text-radiant-400' },
    amber:   { bg: 'bg-gold-500/5',    border: 'border-gold-500/25',    text: 'text-gold-200',    icon: 'text-gold-400' },
    pink:    { bg: 'bg-dire-500/5',    border: 'border-dire-500/25',    text: 'text-dire-300',    icon: 'text-dire-400' },
    slate:   { bg: 'bg-obsidian-700/40', border: 'border-obsidian-500/40', text: 'text-white/75',  icon: 'text-white/55' },
};

const TipCard: React.FC<{ text: string; accent: string; index: number; icon: React.ReactNode }> = ({ text, accent, index, icon }) => {
    const a = ACCENT_MAP[accent] || ACCENT_MAP.slate;
    return (
        <li
            className={`flex items-start gap-3 ${a.bg} rounded-xl p-3.5 border ${a.border} animate-fadeIn`}
            style={{ animationDelay: `${index * 60}ms` }}
        >
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-obsidian-900/60 flex items-center justify-center ${a.icon}`}>
                {icon}
            </div>
            <span className={`text-sm leading-relaxed pt-1 ${a.text}`}>{text}</span>
        </li>
    );
};

const EmptyState: React.FC<{ text: string; icon: React.ReactNode }> = ({ text, icon }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-white/25 mb-3">{icon}</div>
        <div className="text-sm text-white/45">{text}</div>
    </div>
);
