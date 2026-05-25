import React from 'react';
import type { CounterPick } from '../hooks/useCounterPicker';
import { Sparkles, Trophy, X, ChevronDown, ChevronUp, BookOpen, BarChart3, ShieldCheck, Target } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../context/useLanguage';
import { MetricHint } from './MetricHint';
import { METRIC_HINTS } from './metricHints';

import { recommendItems, recommendSkillStrategy } from '../data/smartBuilds';
import { HERO_TAGS } from '../data/heroTags';
import type { Hero, Matchup } from '../services/api';
import { StrategyGuide } from './StrategyGuide';
import type { TranslationKey } from '../i18n/translations';
import { getHeroRoles, type Position } from '../data/heroPositions';

interface CounterListProps {
    counters: CounterPick[];
    loading: boolean;
    selectedEnemies: Hero[];
    matchupsMap: Record<number, Matchup[]>;
    targetRole: Position | 'Any';
}

const formatDraftScore = (value: number) => `${Math.round(value)}`;
const formatWinRate = (value: number) => `${(value * 100).toFixed(1)}%`;

const getConfidence = (matchCount: number, enemyCount: number): { labelKey: TranslationKey; className: string } => {
    if (enemyCount === 0) {
        return {
            labelKey: 'metaRead',
            className: 'border-gold-500/30 bg-gold-500/10 text-gold-300',
        };
    }

    if (matchCount >= enemyCount) {
        return {
            labelKey: 'highConfidence',
            className: 'border-radiant-500/35 bg-radiant-800/20 text-radiant-300',
        };
    }

    if (matchCount >= Math.ceil(enemyCount * 0.5)) {
        return {
            labelKey: 'goodSignal',
            className: 'border-gold-500/30 bg-gold-500/10 text-gold-300',
        };
    }

    return {
        labelKey: 'lightSignal',
        className: 'border-white/10 bg-white/5 text-white/55',
    };
};

const ROLE_KEYS = {
    Carry: 'roleCarry',
    Mid: 'roleMid',
    Offlane: 'roleOfflane',
    SoftSupport: 'roleSoftSupport',
    HardSupport: 'roleHardSupport',
} as const satisfies Record<Position, TranslationKey>;

const getRoleBadgeClass = (role: Position, targetRole: Position | 'Any') => (
    targetRole === role
        ? 'border-gold-400/55 bg-gold-400/15 text-gold-200 shadow-[0_0_18px_-12px_rgba(251,191,36,0.95)]'
        : 'border-white/10 bg-white/[0.04] text-white/45'
);

export const CounterList: React.FC<CounterListProps> = ({ counters, loading, selectedEnemies, matchupsMap, targetRole }) => {
    const { t } = useLanguage();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [strategyHero, setStrategyHero] = useState<Hero | null>(null);
    const [showTailored, setShowTailored] = useState(false);

    if (loading && counters.length === 0) {
        return (
            <div className="surface rounded-lg p-4 h-full">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <div className="label-sm">{t('topPicks')}</div>
                        <div className="mt-1 h-3 w-36 rounded bg-white/10" />
                    </div>
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-400/20 border-t-gold-400" />
                </div>
                <div className="space-y-2">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className="surface-quiet flex items-center gap-3 rounded-md p-3">
                            <div className="h-9 w-16 rounded bg-white/10" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 w-32 rounded bg-white/10" />
                                <div className="h-2 w-44 rounded bg-white/5" />
                            </div>
                            <div className="h-6 w-14 rounded bg-white/10" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (counters.length === 0) {
        return (
            <div className="surface rounded-lg p-4 flex h-full flex-col text-center">
                <div className="flex flex-col items-center space-y-3">
                    <div className="rounded-md bg-gold-500/10 p-3 ring-1 ring-gold-500/25">
                        <Sparkles className="h-6 w-6 text-gold-400" />
                    </div>
                    <div>
                        <h3 className="font-display text-white font-bold mb-1 tracking-wide">{t('readyToDraft')}</h3>
                        <p className="text-xs leading-relaxed text-white/55">{t('selectEnemies')}</p>
                    </div>
                    <div className="grid w-full max-w-[260px] gap-2 text-left">
                        <div className="surface-quiet rounded-md p-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-dire-400">{t('enemyTeam')}</div>
                            <div className="mt-1 text-xs text-white/45">{selectedEnemies.length}/5</div>
                        </div>
                        <div className="surface-quiet rounded-md p-3">
                            <div className="text-[10px] font-black uppercase tracking-[0.16em] text-gold-400">{t('topPicks')}</div>
                            <div className="mt-1 text-xs text-white/45">{t('basedOnPro')}</div>
                        </div>
                    </div>
                    <div className="max-w-[260px] text-xs leading-relaxed text-white/40">
                        {t('algorithmDesc')}
                    </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-4 text-center">
                    <a href="#guide" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-gold-400 flex items-center justify-center gap-1 transition-colors cursor-pointer">
                        {t('howItWorksLink')} <ChevronDown className="h-3 w-3" />
                    </a>
                </div>
            </div>
        );
    }

    const featuredCounter = counters[0];
    const featuredConfidence = getConfidence(featuredCounter.matchCount, selectedEnemies.length);
    const featuredCoverage = selectedEnemies.length > 0
        ? `${featuredCounter.matchCount}/${selectedEnemies.length}`
        : t('meta');
    const featuredReasons = featuredCounter.reasons && featuredCounter.reasons.length > 0
        ? featuredCounter.reasons.slice(0, 3)
        : [t('strongestDraftEdge')];
    const featuredRoles = getHeroRoles(
        featuredCounter.hero.id,
        featuredCounter.hero.roles,
        featuredCounter.hero.primary_attr,
    );
    const alternativeCounters = counters.slice(1);

    return (
        <>
        <div className="surface rounded-lg overflow-hidden flex flex-col">
            <div className="border-b border-white/10 p-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h2 className="font-display text-lg font-bold tracking-wide text-white">{t('topPicks')}</h2>
                        <span className="control-chip border-radiant-500/30 bg-radiant-800/20 text-radiant-300">{counters.length}</span>
                    </div>
                    <p className="text-[11px] text-white/45 mt-1 tracking-wide">
                        {selectedEnemies.length > 0
                            ? `${selectedEnemies.length} ${t('enemyPicksAnalysed')}`
                            : t('basedOnPro')}
                    </p>
                </div>
            </div>

            <div className="border-b border-white/10 p-3">
                <div className="rounded-md border border-gold-600/35 bg-gradient-to-br from-gold-700/14 via-obsidian-800/80 to-obsidian-950 shadow-[0_18px_38px_-30px_rgba(251,191,36,0.95)]">
                    <div className="p-3">
                        <div className="flex items-start gap-3">
                            <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-md gold-frame">
                            <img src={featuredCounter.hero.img} alt={featuredCounter.hero.localized_name} className="h-full w-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900/80 via-transparent to-transparent" />
                        </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="rounded border border-gold-500/40 bg-gold-500/15 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-gold-200">
                                        {t('tailoredPick')}
                                    </span>
                                    <span className={`rounded border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] ${featuredConfidence.className}`}>
                                        {t(featuredConfidence.labelKey)}
                                    </span>
                                </div>

                                <div className="mt-1 flex items-start justify-between gap-2">
                                    <h3 className="min-w-0 truncate font-display text-xl font-bold tracking-wide text-white">{featuredCounter.hero.localized_name}</h3>
                                    <div className="shrink-0 rounded-md border border-radiant-500/25 bg-radiant-800/20 px-2 py-1 text-right">
                                        <div className="font-display text-xl font-bold leading-none text-radiant-300">{formatDraftScore(featuredCounter.score)}</div>
                                        <div className="text-[8px] font-black uppercase tracking-[0.16em] text-white/35">{t('draftScore')}</div>
                                    </div>
                                </div>

                                <div className="mt-1.5 flex flex-wrap gap-1">
                                    {featuredRoles.map(role => (
                                        <span
                                            key={`${featuredCounter.hero.id}-featured-role-${role}`}
                                            className={`rounded border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] ${getRoleBadgeClass(role, targetRole)}`}
                                        >
                                            {t(ROLE_KEYS[role])}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-1.5">
                            <div className="rounded-md border border-white/10 bg-obsidian-950/55 px-2 py-1.5">
                                <MetricHint
                                    label={t('winRate')}
                                    hint={METRIC_HINTS.winRate}
                                    icon={<BarChart3 className="h-3 w-3" />}
                                    className="text-[8px] font-black uppercase tracking-[0.12em] text-white/35"
                                />
                                <div className="font-mono text-[12px] font-black text-white/85">{formatWinRate(featuredCounter.winRate)}</div>
                            </div>
                            <div className="rounded-md border border-white/10 bg-obsidian-950/55 px-2 py-1.5">
                                <MetricHint
                                    label={t('coverage')}
                                    hint={METRIC_HINTS.coverage}
                                    icon={<Target className="h-3 w-3" />}
                                    className="text-[8px] font-black uppercase tracking-[0.12em] text-white/35"
                                />
                                <div className="font-mono text-[12px] font-black text-white/85">{featuredCoverage}</div>
                            </div>
                            <div className="rounded-md border border-white/10 bg-obsidian-950/55 px-2 py-1.5">
                                <MetricHint
                                    label={t('signal')}
                                    hint={METRIC_HINTS.signal}
                                    icon={<ShieldCheck className="h-3 w-3" />}
                                    className="text-[8px] font-black uppercase tracking-[0.12em] text-white/35"
                                />
                                <div className="truncate text-[12px] font-black text-white/85">{t(featuredConfidence.labelKey)}</div>
                            </div>
                        </div>

                        <div className="mt-3 rounded-md border border-gold-700/25 bg-gold-700/10 p-2.5">
                            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-gold-300">
                                <Sparkles className="h-3 w-3" />
                                {t('whyThisHero')}
                            </div>
                            <div className="space-y-1">
                                {featuredReasons.map((reason, idx) => (
                                    <div key={`${featuredCounter.hero.id}-featured-${idx}`} className="flex items-start gap-2 text-xs leading-snug text-white/75">
                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                                        <span>{reason}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setShowTailored(true)}
                                className="btn-gold flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em]"
                            >
                                <Trophy className="h-3.5 w-3.5" />
                                {t('pickBrief')}
                            </button>
                            <button
                                onClick={() => setStrategyHero(featuredCounter.hero)}
                                className="control-chip min-h-[34px] justify-center border-gold-500/25 bg-gold-500/10 text-gold-200 hover:border-gold-400/45 hover:bg-gold-500/15"
                            >
                                <BookOpen className="h-3.5 w-3.5" />
                                <span>{t('strategyBtn')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="label-sm">{t('backupOptions')}</div>
                <span className="font-mono text-[10px] font-black text-white/35">{alternativeCounters.length}</span>
            </div>

            <div className="min-w-0 overflow-x-hidden p-2 pt-0 space-y-1.5">
                {alternativeCounters.length === 0 && (
                    <div className="rounded-md border border-white/10 bg-white/[0.03] p-3 text-center text-xs text-white/45">
                        {t('none')}
                    </div>
                )}

                {alternativeCounters.map((counter, idx) => {
                    const rank = idx + 2;
                    const isExpanded = expandedId === counter.hero.id;
                    const isTopThree = rank <= 3;
                    const confidence = getConfidence(counter.matchCount, selectedEnemies.length);
                    const coverageLabel = selectedEnemies.length > 0
                        ? `${counter.matchCount}/${selectedEnemies.length}`
                        : t('meta');
                    const reasons = counter.reasons && counter.reasons.length > 0
                        ? counter.reasons.slice(0, 2)
                        : [t('strongestDraftEdge')];
                    const hiddenReasonCount = Math.max(0, (counter.reasons?.length ?? 0) - reasons.length);
                    const counterRoles = getHeroRoles(counter.hero.id, counter.hero.roles, counter.hero.primary_attr);

                    return (
                        <div
                            key={counter.hero.id}
                            className={`relative min-w-0 rounded-md border transition-all duration-200 ease-expo-out animate-fadeIn ${
                                isTopThree
                                    ? 'bg-gradient-to-r from-gold-700/8 via-obsidian-700/45 to-obsidian-700/35 border-gold-700/25 hover:border-gold-500/40'
                                    : 'bg-obsidian-700/30 border-white/5 hover:border-gold-600/25 hover:bg-obsidian-700/55'
                            }`}
                            style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                            <div className="grid min-w-0 grid-cols-[1.5rem_auto_minmax(0,1fr)_auto] items-start gap-2.5 p-2.5">
                                <div className={`pt-1 text-center font-display text-lg font-bold ${
                                    isTopThree ? 'text-gold-400' : 'text-white/30'
                                }`}>
                                    {rank}
                                </div>

                                <div className={`relative overflow-hidden rounded-md ring-1 ring-white/10 ${isTopThree ? 'gold-frame' : ''}`}>
                                    <img
                                        src={counter.hero.img}
                                        alt={counter.hero.localized_name}
                                        className="h-9 w-16 object-cover"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <h3 className="truncate text-sm font-bold text-white">{counter.hero.localized_name}</h3>
                                    </div>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        <span className="rounded border border-obsidian-500/60 bg-obsidian-900/80 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white/50">
                                            {counter.hero.primary_attr.substring(0, 3)}
                                        </span>
                                        <span className={`rounded border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${confidence.className}`}>
                                            {t(confidence.labelKey)}
                                        </span>
                                        {counterRoles.slice(0, 3).map(role => (
                                            <span
                                                key={`${counter.hero.id}-role-${role}`}
                                                className={`rounded border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${getRoleBadgeClass(role, targetRole)}`}
                                            >
                                                {t(ROLE_KEYS[role])}
                                            </span>
                                        ))}
                                        {hiddenReasonCount > 0 && (
                                            <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-black text-white/45">
                                                +{hiddenReasonCount}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-1.5 space-y-0.5">
                                        {reasons.map((reason, i) => (
                                            <div key={`${counter.hero.id}-${reason}-${i}`} className="truncate text-[10px] leading-snug text-white/55">
                                                {reason}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-shrink-0 text-right">
                                    <div className={`rounded-md px-2 py-1 font-display text-sm font-bold leading-none ${counter.score > 0 ? 'bg-radiant-800/20 text-radiant-300 ring-1 ring-radiant-500/25' : 'bg-white/5 text-white/60 ring-1 ring-white/10'}`}>
                                        {formatDraftScore(counter.score)}
                                    </div>
                                    <div className="mt-0.5 text-[8px] uppercase tracking-[0.16em] text-white/35" title={METRIC_HINTS.draftScore}>{t('draftScore')}</div>
                                </div>
                            </div>

                            <div className="mx-2 mb-2 flex flex-wrap items-center gap-2 rounded-md border border-white/10 bg-obsidian-900/45 px-2 py-1.5 text-[10px]">
                                <div className="flex items-center gap-1 text-white/45">
                                    <BarChart3 className="h-3 w-3" />
                                    <span className="font-black uppercase tracking-[0.12em]">{t('winRate')}</span>
                                    <span className="font-mono font-black text-white/80">{formatWinRate(counter.winRate)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-white/45">
                                    <Target className="h-3 w-3" />
                                    <span className="font-black uppercase tracking-[0.12em]">{t('coverage')}</span>
                                    <span className="font-mono font-black text-white/80">{coverageLabel}</span>
                                </div>
                            </div>

                            <div className="mx-2 mb-2 flex min-w-0 items-stretch gap-px overflow-hidden rounded-md border border-obsidian-500/40 bg-obsidian-900/60">
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : counter.hero.id)}
                                    className={`group/btn flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-black transition-all ${
                                        isExpanded
                                            ? 'bg-gold-500/15 text-gold-200'
                                            : 'text-white/45 hover:bg-gold-500/10 hover:text-gold-200'
                                    }`}
                                >
                                    {isExpanded
                                        ? <ChevronUp className="h-3.5 w-3.5" />
                                        : <ChevronDown className="h-3.5 w-3.5 group-hover/btn:translate-y-0.5 transition-transform" />
                                    }
                                    <span className="uppercase tracking-wider">{isExpanded ? t('hideDetails') : t('viewDetails')}</span>
                                </button>
                                <div className="w-px bg-obsidian-500/40" />
                                <button
                                    onClick={() => setStrategyHero(counter.hero)}
                                    className="group/btn flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-black text-white/45 hover:bg-gold-500/10 hover:text-gold-200 transition-all"
                                >
                                    <BookOpen className="h-3.5 w-3.5 group-hover/btn:scale-110 transition-transform" />
                                    <span className="uppercase tracking-wider">{t('strategyBtn')}</span>
                                </button>
                            </div>

                            {/* Expanded matchup breakdown */}
                            {isExpanded && (
                                <div className="mx-2 mb-2 rounded-lg p-3 bg-obsidian-900/70 border border-gold-700/20 animate-slideDown">
                                    <MatchupBreakdown
                                        hero={counter.hero}
                                        enemies={selectedEnemies}
                                        matchupsMap={matchupsMap}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

            {/* Strategy Guide modal */}
            {strategyHero && (
                <StrategyGuide hero={strategyHero} onClose={() => setStrategyHero(null)} />
            )}

            {/* Tailored Pick Modal */}
            {showTailored && counters.length > 0 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-900/85 backdrop-blur-md animate-fadeIn">
                    <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto custom-scrollbar rounded-lg border border-gold-600/30 bg-obsidian-900 shadow-gold-lg animate-scaleIn">
                        <button
                            onClick={() => setShowTailored(false)}
                            className="absolute top-3 right-3 z-10 p-1.5 rounded-md bg-obsidian-900/75 text-white/55 hover:text-white hover:bg-obsidian-800 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        {/* Modal Content */}
                        <div className="relative p-4 sm:p-5">
                            <div className="flex items-start gap-3 pr-8">
                                <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-md gold-frame shadow-gold">
                                    <img
                                        src={counters[0].hero.img}
                                        alt={counters[0].hero.localized_name}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900/70 via-transparent to-transparent" />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                                        <span className="rounded border border-gold-500/40 bg-gold-500/15 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-gold-200">
                                            {t('tailoredPick')}
                                        </span>
                                        <span className={`rounded border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-[0.16em] ${featuredConfidence.className}`}>
                                            {t(featuredConfidence.labelKey)}
                                        </span>
                                    </div>
                                    <h3 className="truncate font-display text-2xl font-bold tracking-wide text-white">
                                        {counters[0].hero.localized_name}
                                    </h3>
                                    <p className="mt-1 text-sm leading-snug text-white/55">{t('basedOnComposition')}</p>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {featuredRoles.map(role => (
                                            <span
                                                key={`tailored-role-${role}`}
                                                className={`rounded border px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] ${getRoleBadgeClass(role, targetRole)}`}
                                            >
                                                {t(ROLE_KEYS[role])}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="my-4 grid grid-cols-3 rounded-md border border-white/10 bg-obsidian-950/70">
                                <div className="border-r border-white/10 p-3">
                                    <div className="label-sm mb-1">{t('draftScore')}</div>
                                    <div className="font-display text-xl font-bold text-radiant-400">{formatDraftScore(counters[0].score)}</div>
                                </div>
                                <div className="border-r border-white/10 p-3">
                                    <div className="label-sm mb-1">{t('winRate')}</div>
                                    <div className="font-display text-xl font-bold text-gold-400">{formatWinRate(counters[0].winRate)}</div>
                                </div>
                                <div className="p-3">
                                    <div className="label-sm mb-1">{t('coverage')}</div>
                                    <div className="font-display text-xl font-bold text-white/85">{featuredCoverage}</div>
                                </div>
                            </div>

                            {counters[0].reasons && counters[0].reasons.length > 0 ? (
                                <div className="text-left bg-gold-700/10 rounded-lg p-4 border border-gold-700/30 mb-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-gold-300 mb-2 flex items-center gap-2">
                                        <Sparkles className="h-3 w-3" />
                                        {t('whyThisHero')}
                                    </h4>
                                    <ul className="space-y-1">
                                        {counters[0].reasons.map((reason, idx) => (
                                            <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                                                <span className="text-gold-500 mt-1">-</span>
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="mb-4 rounded-lg border border-gold-700/30 bg-gold-700/10 p-4 text-left text-sm text-white/75">
                                    {t('strongestBaselineEdge')}
                                </div>
                            )}

                            {counters.length > 1 && (
                                <div className="mb-4 rounded-lg border border-white/10 bg-obsidian-900/55 p-3 text-left">
                                    <div className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{t('backupOptions')}</div>
                                    <div className="space-y-1.5">
                                        {counters.slice(1, 4).map((counter, idx) => (
                                            <div key={counter.hero.id} className="flex items-center gap-2 rounded-md bg-white/[0.03] px-2 py-1.5">
                                                <span className="w-5 text-center font-display text-xs font-black text-white/35">{idx + 2}</span>
                                                <img src={counter.hero.img} alt={counter.hero.localized_name} className="h-5 w-9 rounded object-cover ring-1 ring-white/10" />
                                                <span className="min-w-0 flex-1 truncate text-xs font-bold text-white/80">{counter.hero.localized_name}</span>
                                                <span className="font-mono text-xs font-black text-radiant-300">{formatDraftScore(counter.score)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Situational Build */}
                            {(() => {
                                const enemyTraits = new Set<string>();
                                selectedEnemies.forEach(e => {
                                    Object.keys(HERO_TAGS).forEach(tag => {
                                        if (HERO_TAGS[tag].includes(e.id)) enemyTraits.add(tag);
                                    });
                                });

                                const hero = counters[0].hero;
                                const items = recommendItems(enemyTraits, {
                                    targetRole,
                                    heroRoles: featuredRoles,
                                    heroApiRoles: hero.roles,
                                    heroAttackType: hero.attack_type,
                                });
                                const strategies = recommendSkillStrategy(enemyTraits);

                                if (items.length === 0 && strategies.length === 0) return null;

                                return (
                                    <div className="text-left bg-radiant-800/15 rounded-lg p-4 border border-radiant-500/25">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-radiant-300 mb-2 flex items-center gap-2">
                                            <Sparkles className="h-3 w-3" />
                                            {t('situationalBuild')}
                                        </h4>

                                        {items.length > 0 && (
                                            <div className="mb-3">
                                                <div className="text-[10px] text-white/45 uppercase font-bold tracking-wider mb-1">{t('keyItems')}</div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {items.map(item => (
                                                        <div key={item.id} className="relative group/item">
                                                            <img src={item.img} alt={item.name} className="w-full aspect-square rounded border border-obsidian-500 object-cover" />
                                                            <div className="absolute inset-0 bg-obsidian-900/90 opacity-0 group-hover/item:opacity-100 flex items-center justify-center p-1 transition-opacity z-10">
                                                                <p className="text-[8px] text-white text-center leading-tight">{item.reason}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {strategies.length > 0 && (
                                            <div>
                                                <div className="text-[10px] text-white/45 uppercase font-bold tracking-wider mb-1">{t('strategy')}</div>
                                                <ul className="space-y-1">
                                                    {strategies.map((strat, idx) => (
                                                        <li key={idx} className="text-sm text-white/80 flex items-start gap-2">
                                                            <span className="text-radiant-500 mt-1">-</span>
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
                                className="btn-gold mt-6 w-full rounded-md py-3 font-black uppercase tracking-wider"
                            >
                                {t('gotIt')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

/* ---------------- Matchup Breakdown ---------------- */

const MatchupBreakdown: React.FC<{
    hero: Hero;
    enemies: Hero[];
    matchupsMap: Record<number, Matchup[]>;
}> = ({ hero, enemies, matchupsMap }) => {
    const { t } = useLanguage();

    if (enemies.length === 0) {
        return <div className="text-xs text-white/40 text-center py-2">{t('noMatchupData')}</div>;
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
            <div className="flex items-center justify-between mb-2.5 gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-gold-400" />
                        <span className="text-[10px] uppercase tracking-widest font-black text-gold-300">{t('matchupBreakdown')}</span>
                    </div>
                    <div className="mt-0.5 truncate text-[11px] text-white/45">
                        {hero.localized_name} {t('selectedEnemyMatchups')}
                    </div>
                </div>
                {avgWinRate !== null && (
                    <div className="flex shrink-0 items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px]">
                        <span className="text-white/40 uppercase tracking-wider">{t('avgWinRateShort')}</span>
                        <span className={`font-black font-mono ${
                            avgWinRate >= 0.52 ? 'text-radiant-400' : avgWinRate >= 0.48 ? 'text-white/85' : 'text-dire-400'
                        }`}>
                            {formatWinRate(avgWinRate)}
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

                    let barColour = 'from-obsidian-500 to-obsidian-400';
                    let textColour = 'text-white/70';
                    if (winRate !== null) {
                        if (winRate >= 0.52) { barColour = 'from-radiant-700 to-radiant-400'; textColour = 'text-radiant-300'; }
                        else if (winRate >= 0.50) { barColour = 'from-gold-700 to-gold-400'; textColour = 'text-gold-300'; }
                        else if (winRate < 0.48) { barColour = 'from-dire-700 to-dire-500'; textColour = 'text-dire-400'; }
                    }

                    return (
                        <div key={enemy.id} className="flex items-center gap-2 bg-obsidian-900/70 rounded-md px-2 py-1.5 border border-obsidian-600/60">
                            <img
                                src={enemy.img}
                                alt={enemy.localized_name}
                                className="w-10 h-6 rounded object-cover ring-1 ring-obsidian-900 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-[11px] text-white font-medium truncate leading-tight">{enemy.localized_name}</div>
                                {winRate === null ? (
                                    <div className="h-1.5 mt-1 bg-obsidian-700 rounded" />
                                ) : (
                                    <div className="h-1.5 mt-1 bg-obsidian-700 rounded overflow-hidden relative">
                                        <div
                                            className={`h-full bg-gradient-to-r ${barColour} transition-all duration-500 ease-expo-out`}
                                            style={{ width: `${barPct}%` }}
                                        />
                                        {/* 50% reference line */}
                                        <div className="absolute top-0 bottom-0 w-px bg-white/30" style={{ left: '50%' }} />
                                    </div>
                                )}
                            </div>
                            <div className="text-right flex-shrink-0">
                                {winRate === null ? (
                                    <div className="text-[11px] text-white/30">-</div>
                                ) : (
                                    <>
                                        <div className={`text-xs font-black font-mono ${textColour} leading-tight`}>
                                            {formatWinRate(winRate)}
                                        </div>
                                        <div className="text-[9px] text-white/35 font-mono">
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
