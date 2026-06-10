import { useEffect, useRef, useState } from 'react';
import { useCounterPicker } from './hooks/useCounterPicker';
import { HeroGrid } from './components/HeroGrid';
import { CounterList } from './components/CounterList';
import { LandingContent } from './components/LandingContent';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { WelcomeModal } from './components/WelcomeModal';
import { ShareButton } from './components/ShareButton';
import { AboutUs } from './components/AboutUs';
import { Contact } from './components/Contact';
import { CryptoDonate } from './components/CryptoDonate';
import { InstallPrompt } from './components/InstallPrompt';
import { MetricHint } from './components/MetricHint';
import { METRIC_HINTS } from './components/metricHints';
import { Swords, RotateCcw, Shield, Users, Zap, TrendingUp, Target, BookOpen, MessageCircle, Filter, Sparkles, BarChart3, Copy, Check, Trophy } from 'lucide-react';
import { type Position, type PositionNumber, NUMBER_TO_POSITION, POSITION_TO_NUMBER, getHeroRoles } from './data/heroPositions';
import { getSlugFromPath, heroFromSlug } from './utils/heroSlug';
import { useLanguage } from './context/useLanguage';
import type { TranslationKey } from './i18n/translations';
import { EsportsHub } from './esports/EsportsHub';

const POSITION_FULL_KEYS = {
  Carry: 'posFullCarry',
  Mid: 'posFullMid',
  Offlane: 'posFullOfflane',
  SoftSupport: 'posFullSoftSupport',
  HardSupport: 'posFullHardSupport',
} as const satisfies Record<Position, TranslationKey>;

const POSITION_SHORT_KEYS = {
  Carry: 'posShortCarry',
  Mid: 'posShortMid',
  Offlane: 'posShortOfflane',
  SoftSupport: 'posShortSoftSupport',
  HardSupport: 'posShortHardSupport',
} as const satisfies Record<Position, TranslationKey>;

const ROLE_KEYS = {
  Any: 'roleAny',
  Carry: 'roleCarry',
  Mid: 'roleMid',
  Offlane: 'roleOfflane',
  SoftSupport: 'roleSoftSupport',
  HardSupport: 'roleHardSupport',
} as const satisfies Record<Position | 'Any', TranslationKey>;

const formatDraftScore = (value: number) => `${Math.round(value)}`;

const getDraftConfidence = (matchCount: number, enemyCount: number): { labelKey: TranslationKey; className: string } => {
  if (enemyCount === 0) return { labelKey: 'metaRead', className: 'text-gold-300' };
  if (matchCount >= enemyCount) return { labelKey: 'highConfidence', className: 'text-radiant-300' };
  if (matchCount >= Math.ceil(enemyCount * 0.5)) return { labelKey: 'goodSignal', className: 'text-gold-300' };
  return { labelKey: 'lightSignal', className: 'text-white/65' };
};

const isEsportsPath = (pathname: string) => {
  const normalized = pathname.replace(/\/+$/, '').toLowerCase() || '/';
  return normalized === '/esports' || normalized.startsWith('/esports/');
};

function App() {
  return isEsportsPath(window.location.pathname) ? <EsportsHub /> : <DotaPickerApp />;
}

function DotaPickerApp() {
  // Version Log
  useEffect(() => {
    console.log('App Version: 2.1 (Share Fix)');
  }, []);

  const { t, language, setLanguage } = useLanguage();
  const [targetRole, setTargetRole] = useState<Position | 'Any'>('Any');
  const [summaryCopied, setSummaryCopied] = useState(false);

  const {
    heroes,
    selectedEnemies,
    myTeam,
    myTeamSlots,
    analysisEnemies,
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
    setMyTeamAt,
    removeMyTeamAt,
    revealDraft,
    clearAll
  } = useCounterPicker(targetRole);

  useEffect(() => {
    loadHeroes();
  }, [loadHeroes]);

  const isUrlLoadedRef = useRef(false);
  const autoRevealPendingRef = useRef(false);

  // Load hero from /counter/:slug path OR shared draft from URL parameters
  useEffect(() => {
    if (heroes.length === 0) return;
    if (isUrlLoadedRef.current) return;

    // Handle /counter/anti-mage and /ru/counter/anti-mage pages
    const pathInfo = getSlugFromPath();
    if (pathInfo) {
      const hero = heroFromSlug(pathInfo.slug, heroes);
      if (hero) addEnemy(hero);
      if (pathInfo.lang === 'ru') setLanguage('ru');
      isUrlLoadedRef.current = true;
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const enemyIds = params.get('e')?.split(',').map(Number).filter(n => !isNaN(n)) || [];
    // New URL format: t=ID.POS,ID.POS (dot-separated). Legacy: t=ID,ID,ID
    const teamParam = params.get('t')?.split(',') || [];
    const teamEntries: { id: number; pos: PositionNumber | null }[] = teamParam
      .map(entry => {
        const [idStr, posStr] = entry.split('.');
        const id = Number(idStr);
        const pos = posStr ? (Number(posStr) as PositionNumber) : null;
        return { id, pos };
      })
      .filter(e => !isNaN(e.id));

    if ((enemyIds.length > 0 || teamEntries.length > 0) && selectedEnemies.length === 0 && myTeam.length === 0) {
      // Shared draft links should show recommendations after the URL state
      // finishes populating, without requiring a second click.
      autoRevealPendingRef.current = true;
      enemyIds.forEach(id => {
        const hero = heroes.find(h => h.id === id);
        if (hero) addEnemy(hero);
      });

      // Place heroes into slots. If pos is encoded, use it; otherwise auto-pick first fitting empty slot.
      const usedSlots = new Set<PositionNumber>();
      teamEntries.forEach(entry => {
        const hero = heroes.find(h => h.id === entry.id);
        if (!hero) return;

        let pos = entry.pos;
        if (!pos || pos < 1 || pos > 5 || usedSlots.has(pos)) {
          // Fall back: find first empty slot that matches the hero's preferred roles
          const heroPositions = getHeroRoles(hero.id, hero.roles, hero.primary_attr);
          const preferredNumbers: PositionNumber[] = heroPositions
            .map(p => ({ Carry: 1, Mid: 2, Offlane: 3, SoftSupport: 4, HardSupport: 5 }[p] as PositionNumber));
          pos = (preferredNumbers.find(n => !usedSlots.has(n)) ?? ([1, 2, 3, 4, 5] as PositionNumber[]).find(n => !usedSlots.has(n))) || 1;
        }
        usedSlots.add(pos);
        setMyTeamAt(pos, hero);
      });
    }

    isUrlLoadedRef.current = true;
  }, [heroes, selectedEnemies.length, myTeam.length, addEnemy, setMyTeamAt, setLanguage]);

  useEffect(() => {
    if (!autoRevealPendingRef.current) return;
    if (selectedEnemies.length === 0 && myTeam.length === 0) return;

    autoRevealPendingRef.current = false;
    void revealDraft();
  }, [selectedEnemies.length, myTeam.length, revealDraft]);

  // Update document title dynamically
  useEffect(() => {
    if (selectedEnemies.length > 0) {
      const heroNames = selectedEnemies.map(h => h.localized_name).slice(0, 3).join(', ');
      const suffix = selectedEnemies.length > 3 ? '...' : '';
      document.title = `Counter ${heroNames}${suffix} | Dota 2 Picker`;
    } else {
      document.title = 'Dota 2 Counter Picker | Free Hero Draft Tool - Dota2Picker';
    }
  }, [selectedEnemies]);

  // Sync state to URL
  useEffect(() => {
    if (!isUrlLoadedRef.current) return; // Don't overwrite URL until we've loaded initial state

    const params = new URLSearchParams();
    if (selectedEnemies.length > 0) {
      params.set('e', selectedEnemies.map(h => h.id).join(','));
    }
    if (myTeamSlots.some(h => h)) {
      const teamStr = myTeamSlots
        .map((h, idx) => h ? `${h.id}.${idx + 1}` : null)
        .filter(Boolean)
        .join(',');
      params.set('t', teamStr);
    }

    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);

  }, [selectedEnemies, myTeamSlots]);

  // Selection mode:
  //   'enemy'    - clicking hero adds to enemy pool
  //   { pos: N } - clicking hero assigns to my-team slot N
  type SelectionMode = 'enemy' | { pos: PositionNumber };
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('enemy');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const draftActivity = selectedEnemies.length + myTeam.length;
  const currentCounters = isAnalysisCurrent ? topCounters : [];
  const currentAnalysisEnemies = isAnalysisCurrent ? analysisEnemies : selectedEnemies;
  const currentAnalysisRole = isAnalysisCurrent ? analysisTargetRole : targetRole;
  const bestPick = currentCounters[0];
  const bestPickConfidence = bestPick
    ? getDraftConfidence(bestPick.matchCount, currentAnalysisEnemies.length)
    : null;
  const bestPickConfidenceLabel = bestPickConfidence ? t(bestPickConfidence.labelKey) : null;
  const bestPickCoverage = bestPick && currentAnalysisEnemies.length > 0
    ? `${bestPick.matchCount}/${currentAnalysisEnemies.length}`
    : t('meta');
  const activeModeLabel = selectionMode === 'enemy'
    ? t('enemyTeam')
    : t(POSITION_FULL_KEYS[NUMBER_TO_POSITION[selectionMode.pos]]);

  const selectEnemyMode = () => {
    setSelectionMode('enemy');
    setTargetRole('Any');
  };

  const selectPickSlot = (pos: PositionNumber) => {
    setSelectionMode({ pos });
    setTargetRole(NUMBER_TO_POSITION[pos]);
  };

  const selectRecommendationRole = (role: Position | 'Any') => {
    setTargetRole(role);
    if (role === 'Any') {
      setSelectionMode('enemy');
      return;
    }
    setSelectionMode({ pos: POSITION_TO_NUMBER[role] });
  };

  const copyDraftSummary = async () => {
    if (draftActivity === 0) return;

    const enemyText = selectedEnemies.length > 0
      ? selectedEnemies.map(hero => hero.localized_name).join(', ')
      : t('noneSelected');
    const allyText = myTeamSlots
      .map((hero, idx) => hero ? `${idx + 1}. ${hero.localized_name}` : null)
      .filter(Boolean)
      .join(', ') || t('noneSelected');
    const bestPickText = bestPick
      ? `${bestPick.hero.localized_name} (${t('draftScore')} ${formatDraftScore(bestPick.score)}, ${bestPickCoverage} ${t('coverage')}, ${bestPickConfidenceLabel ?? t('signalPending')})`
      : loading ? t('calculating') : isAnalysisStale ? t('draftChanged') : t('noPickYet');
    const backupText = currentCounters.slice(1, 4)
      .map((counter, idx) => `${idx + 2}. ${counter.hero.localized_name} (${t('draftScore')} ${formatDraftScore(counter.score)})`)
      .join(', ') || t('none');

    const summary = [
      `Dota 2 ${t('draftSummary').toString().toLowerCase()}`,
      `${t('enemy')}: ${enemyText}`,
      `${t('allies')}: ${allyText}`,
      `${t('targetRole')} ${t(ROLE_KEYS[currentAnalysisRole])}`,
      `${t('bestPick')}: ${bestPickText}`,
      `${t('backups')}: ${backupText}`,
      window.location.href,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(summary);
      setSummaryCopied(true);
      window.setTimeout(() => setSummaryCopied(false), 1800);
    } catch {
      setSummaryCopied(false);
    }
  };

  const renderSuggestionsPanel = (className: string) => (
    <div className={`flex-none flex flex-col ${className}`}>
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="label-sm">{t('targetRole')}</span>
      </div>

      <div className="surface mb-3 grid grid-cols-3 gap-1 rounded-lg p-1 sm:grid-cols-6 lg:grid-cols-3 xl:grid-cols-6">
        {(['Any', 'Carry', 'Mid', 'Offlane', 'SoftSupport', 'HardSupport'] as const).map(role => (
          <button
            key={role}
            onClick={() => selectRecommendationRole(role)}
            className={`flex h-7 min-w-0 items-center justify-center rounded-md px-1.5 text-[10px] font-black uppercase leading-none tracking-[0.08em] transition-all duration-200 ease-expo-out whitespace-nowrap ${
              targetRole === role
                ? 'bg-gold-400 text-obsidian-900 shadow-[0_10px_24px_-18px_rgba(251,191,36,0.9),inset_0_1px_0_rgba(255,255,255,0.35)]'
                : 'text-white/45 hover:bg-white/5 hover:text-white'
            }`}
          >
            {t(ROLE_KEYS[role])}
          </button>
        ))}
      </div>

      <div className="surface mb-3 rounded-lg p-2">
        {!isAnalysisCurrent && (
          <button
            type="button"
            onClick={revealDraft}
            disabled={!canRevealDraft || loading}
            className={`flex min-h-[38px] w-full items-center justify-center gap-2 rounded-md px-3 text-[11px] font-black uppercase tracking-[0.14em] transition-all ${
              !canRevealDraft || loading
                ? 'border border-white/10 bg-white/[0.03] text-white/35'
                : 'btn-gold'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {loading ? t('calculating') : hasAnalysis ? t('updateDraft') : t('revealDraft')}
          </button>
        )}
        <div className={`${isAnalysisCurrent ? '' : 'mt-2'} text-center text-[10px] font-bold uppercase tracking-[0.14em] text-white/35`}>
          {isAnalysisCurrent ? t('analysisCurrent') : isAnalysisStale ? t('draftChanged') : t('draftNotAnalysed')}
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between px-1">
        <span className="label-sm">{t('proDataHeuristics')}</span>
      </div>
      <CounterList
        counters={currentCounters}
        loading={loading && isAnalysisCurrent}
        selectedEnemies={currentAnalysisEnemies}
        matchupsMap={matchupsMap}
        targetRole={currentAnalysisRole}
      />

    </div>
  );

  const renderDraftSummary = () => {
    if (draftActivity === 0) return null;

    return (
      <section className="surface rounded-lg p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="label-sm">{t('draftSummary')}</div>
          <button
            type="button"
            onClick={copyDraftSummary}
            className="control-chip min-h-[30px] gap-1.5 border-gold-500/25 bg-gold-500/10 px-2.5 text-gold-200 hover:border-gold-400/45 hover:bg-gold-500/15"
            title={t('copySummary')}
          >
            {summaryCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{summaryCopied ? t('copied') : t('copySummary')}</span>
          </button>
        </div>
        <div className="grid gap-2 lg:grid-cols-[1.25fr_0.72fr_0.72fr_0.75fr]">
          <div className="min-w-0 rounded-md border border-gold-700/25 bg-gold-700/10 p-2">
            <div className="mb-1 flex items-center gap-1.5 label-sm">
              <Sparkles className="h-3.5 w-3.5 text-gold-400" />
              {t('bestPick')}
            </div>
            {bestPick ? (
              <div className="flex min-w-0 items-center gap-2">
                <img
                  src={bestPick.hero.img}
                  alt={bestPick.hero.localized_name}
                  className="h-8 w-14 shrink-0 rounded-md object-cover gold-frame"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-sm font-bold text-white">{bestPick.hero.localized_name}</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/45">
                    <span className="font-mono font-black text-radiant-300">{formatDraftScore(bestPick.score)}</span>
                    <MetricHint
                      label={t('draftScore')}
                      hint={METRIC_HINTS.draftScore}
                      icon={<TrendingUp className="h-3 w-3" />}
                      className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm font-bold text-white/50">{loading ? t('calculating') : isAnalysisStale ? t('draftChanged') : t('noPickYet')}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            <div className="rounded-md border border-white/10 bg-obsidian-900/55 p-2">
              <MetricHint
                label={t('coverage')}
                hint={METRIC_HINTS.coverage}
                icon={<Target className="h-3.5 w-3.5" />}
                className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/40"
              />
              <div className="font-mono text-sm font-black text-white">{bestPick ? bestPickCoverage : '-'}</div>
            </div>
            <div className="rounded-md border border-white/10 bg-obsidian-900/55 p-2">
              <MetricHint
                label={t('signal')}
                hint={METRIC_HINTS.signal}
                icon={<BarChart3 className="h-3.5 w-3.5" />}
                className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/40"
              />
              <div className={`truncate text-sm font-black ${bestPickConfidence?.className ?? 'text-white/45'}`}>
                {bestPickConfidenceLabel ?? '-'}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-obsidian-900/55 p-2">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/40">
              <Filter className="h-3.5 w-3.5" />
              {t('targetRole')}
            </div>
            <div className="truncate font-display text-sm font-bold text-gold-300">{t(ROLE_KEYS[currentAnalysisRole])}</div>
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-obsidian-900 text-white flex flex-col font-sans selection:bg-gold-500 selection:text-white">
      {/* Header - sticky frosted glass */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-obsidian-900/80 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_14px_38px_-28px_rgba(0,0,0,0.9)]">
        <div className="max-w-7xl mx-auto flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-[0_0_0_1px_rgba(180,83,9,0.7),0_12px_28px_-18px_rgba(251,191,36,0.9),inset_0_1px_0_rgba(253,230,138,0.45)]">
              <Swords className="h-5 w-5 text-obsidian-900 drop-shadow-sm" />
            </div>
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h1 className="truncate font-display text-[19px] font-bold tracking-wide text-white">
                  Dota 2 <span className="text-gold-400">Counter</span> Picker
                </h1>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/45">
                <span className="inline-flex items-center gap-1.5"><span className="status-dot" />{activeModeLabel}</span>
                <span>{selectedEnemies.length}/5 {t('enemyTeam')}</span>
                <span>{myTeam.length}/5 {t('myTeam')}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {/* Esports Hub */}
            <a
              href="/esports"
              className="toolbar-button-feature"
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Live Esports</span>
              <span className="h-1.5 w-1.5 rounded-full bg-radiant-400 shadow-[0_0_10px_rgba(52,211,153,0.85)]" />
            </a>
            {/* Language Toggle */}
            <div className="flex items-center gap-0.5 rounded-md border border-white/10 bg-obsidian-800/80 p-1">
              <button onClick={() => setLanguage('en')} className={`rounded px-2.5 py-1.5 text-[11px] font-black transition-all duration-200 ease-expo-out ${language === 'en' ? 'bg-gold-400 text-obsidian-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]' : 'text-white/50 hover:text-white'}`}>EN</button>
              <button onClick={() => setLanguage('ru')} className={`rounded px-2.5 py-1.5 text-[11px] font-black transition-all duration-200 ease-expo-out ${language === 'ru' ? 'bg-gold-400 text-obsidian-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]' : 'text-white/50 hover:text-white'}`}>RU</button>
            </div>
            {/* Ko-fi */}
            <a
              href="https://ko-fi.com/dota2picker"
              target="_blank"
              rel="noopener noreferrer"
              className="toolbar-button"
            >
              {t('support')}
            </a>
            {/* Crypto */}
            <CryptoDonate />
            {/* Share Button */}
            <ShareButton
              selectedEnemies={selectedEnemies}
              myTeam={myTeam}
              topCounters={currentCounters}
            />
            {/* Clear All */}
            {(selectedEnemies.length > 0 || myTeam.length > 0) && (
              <button
                onClick={clearAll}
                className="toolbar-button"
              >
                <RotateCcw className="h-3 w-3" />
                {t('reset')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero CTA Section - Only show when no heroes selected */}
      {draftActivity === 0 && (
        <div className="mx-auto w-full max-w-7xl px-4 pt-4">
          {/* Atmospheric glows */}
          <div className="hidden" />
          <div className="surface rounded-lg p-4">
            <h2 className="font-display text-2xl font-bold tracking-wide text-white">
              {t('dominateDrafts')}
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-white/55">
              {t('ctaDesc')}
            </p>
            <div className="mt-4 grid gap-2 text-[12px] sm:grid-cols-3">
              <div className="surface-quiet flex items-center gap-2 rounded-md p-3 text-white/60">
                <Zap className="h-3.5 w-3.5 text-gold-400" />
                <span>{t('instantResults')}</span>
              </div>
              <span className="hidden text-gold-700/40">-</span>
              <div className="surface-quiet flex items-center gap-2 rounded-md p-3 text-white/60">
                <TrendingUp className="h-3.5 w-3.5 text-radiant-500" />
                <span>{t('proWinRates')}</span>
              </div>
              <span className="hidden text-gold-700/40">-</span>
              <div className="surface-quiet flex items-center gap-2 rounded-md p-3 text-white/60">
                <Target className="h-3.5 w-3.5 text-dire-600" />
                <span>{t('roleBasedPicks')}</span>
              </div>
            </div>

            <a href="#guide" className="toolbar-button mt-4">
              <BookOpen className="h-3 w-3" />
              {t('readGuide')}
            </a>
          </div>
        </div>
      )}

      <main className={`flex-1 max-w-7xl w-full mx-auto flex flex-col ${draftActivity > 0 ? 'gap-3 p-3 lg:p-4' : 'gap-4 p-4'}`}>

        {/* Teams Bar - Visual Only Now */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {/* Enemy Team Display */}
          <section className={`surface rounded-lg p-2.5 transition-all duration-300 ease-expo-out ${selectionMode === 'enemy'
            ? 'border-dire-500/45 shadow-[0_18px_46px_-30px_rgba(220,38,38,0.9)]'
            : 'opacity-90'}`}>
            <div className="flex justify-between items-center mb-2">
              <h2 className={`flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.18em] ${selectionMode === 'enemy' ? 'text-dire-400' : 'text-white/40'}`}>
                <Shield className="h-4 w-4" />
                {t('enemyTeam')}
              </h2>
              <span className="label-sm">{selectedEnemies.length}/5</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 5 }).map((_, idx) => {
                const hero = selectedEnemies[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => hero && removeEnemy(hero.id)}
                    className={`slot-shell relative aspect-[16/9] rounded-md flex items-center justify-center transition-all duration-200 ease-expo-out overflow-hidden group ${
                      hero
                        ? 'cursor-pointer border-dire-500/50 hover:border-dire-400 hover:shadow-[0_0_20px_-8px_rgba(248,113,113,0.9)]'
                        : selectionMode === 'enemy'
                          ? 'border-dashed border-dire-500/30'
                          : 'border-dashed border-white/10'
                    }`}
                  >
                    {hero ? (
                      <>
                        <img src={hero.img} alt={hero.localized_name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-dire-900/70 via-transparent to-transparent opacity-60" />
                        <div className="absolute inset-0 bg-obsidian-900/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-sm text-dire-400 font-black">x</span>
                        </div>
                      </>
                    ) : <span className="font-display text-lg font-bold text-white/15">{idx + 1}</span>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* My Team Display - positioned slots 1-5 */}
          <section className={`surface rounded-lg p-2.5 transition-all duration-300 ease-expo-out ${selectionMode !== 'enemy'
            ? 'border-radiant-500/45 shadow-[0_18px_46px_-30px_rgba(16,185,129,0.86)]'
            : 'opacity-90'}`}>
            <div className="flex justify-between items-center mb-2">
              <h2 className={`flex items-center gap-2 font-display text-sm font-bold uppercase tracking-[0.18em] ${selectionMode !== 'enemy' ? 'text-radiant-400' : 'text-white/40'}`}>
                <Users className="h-4 w-4" />
                {t('myTeam')}
              </h2>
              <span className="label-sm">{myTeam.length}/5</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {([1, 2, 3, 4, 5] as PositionNumber[]).map((pos) => {
                const hero = myTeamSlots[pos - 1];
                const isActive = selectionMode !== 'enemy' && selectionMode.pos === pos;
                const posKey = NUMBER_TO_POSITION[pos];
                return (
                  <div key={pos} className="min-w-0 flex flex-col gap-1">
                    <div className={`text-[9px] uppercase font-black tracking-[0.15em] text-center leading-none transition-colors ${isActive ? 'text-gold-400' : hero ? 'text-radiant-400/80' : 'text-white/35'}`}>
                      <span className={`inline-block px-1 py-0.5 rounded font-display ${isActive ? 'bg-gold-500/15 ring-1 ring-gold-500/40' : 'bg-obsidian-900/60'}`}>{pos}</span>{' '}
                      {t(POSITION_SHORT_KEYS[posKey])}
                    </div>
                    <div
                      onClick={() => {
                        if (hero) removeMyTeamAt(pos);
                        else selectPickSlot(pos);
                      }}
                      className={`slot-shell relative aspect-[16/9] rounded-md flex items-center justify-center transition-all duration-200 ease-expo-out overflow-hidden group cursor-pointer
                        ${hero
                          ? 'border-radiant-500/60 hover:border-radiant-400 hover:shadow-[0_0_20px_-8px_rgba(52,211,153,0.9)]'
                          : isActive
                            ? 'border-dashed border-gold-400/70 shadow-[0_0_18px_-8px_rgba(251,191,36,0.75)]'
                            : 'border-dashed border-white/10 hover:border-radiant-500/40'}`}
                      title={hero ? hero.localized_name : t('emptySlotHint')}
                    >
                      {hero ? (
                        <>
                          <img src={hero.img} alt={hero.localized_name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-radiant-800/60 via-transparent to-transparent opacity-60" />
                          <div className="absolute inset-0 bg-obsidian-900/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-sm text-radiant-400 font-black">x</span>
                          </div>
                        </>
                      ) : <span className={`text-lg font-bold ${isActive ? 'text-gold-400/70' : 'text-white/15'}`}>+</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {renderDraftSummary()}

        {/* Selection Tabs & Grid */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {draftActivity > 0 && renderSuggestionsPanel('lg:hidden')}

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="surface rounded-lg p-2 mb-3 flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                <span className="label-sm col-span-full pl-1">{t('pickingFor')}</span>
                <button
                  onClick={selectEnemyMode}
                  className={`control-chip min-h-[42px] ${
                    selectionMode === 'enemy'
                      ? 'border-dire-500/60 bg-dire-900/30 text-dire-300 shadow-[0_8px_22px_-18px_rgba(248,113,113,0.9)]'
                      : ''
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  {t('enemyTeam')}
                </button>
                {([1, 2, 3, 4, 5] as PositionNumber[]).map((pos) => {
                  const posKey = NUMBER_TO_POSITION[pos];
                  const isActive = selectionMode !== 'enemy' && selectionMode.pos === pos;
                  return (
                    <button
                      key={pos}
                      onClick={() => selectPickSlot(pos)}
                      className={`control-chip min-h-[42px] flex-col gap-0.5 ${
                        isActive
                          ? 'border-radiant-500/60 bg-radiant-800/25 text-radiant-300 shadow-[0_8px_22px_-18px_rgba(52,211,153,0.86)]'
                          : ''
                      }`}
                      title={t(POSITION_FULL_KEYS[posKey])}
                    >
                      <span className="text-[9px] leading-none font-display opacity-80">{pos}</span>
                      <span className="text-[9px] leading-tight uppercase tracking-wider">{t(POSITION_SHORT_KEYS[posKey])}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <HeroGrid
              heroes={heroes}
              onSelect={(hero) => {
                if (selectionMode === 'enemy') {
                  addEnemy(hero);
                } else {
                  setMyTeamAt(selectionMode.pos, hero);
                }
              }}
              selectedIds={[...selectedEnemies, ...myTeam].map(e => e.id)}
              filterRole={selectionMode === 'enemy' ? null : NUMBER_TO_POSITION[selectionMode.pos]}
              hideOffRole={false}
            />
          </div>

          {renderSuggestionsPanel(`${draftActivity > 0 ? 'hidden lg:flex' : ''} lg:sticky lg:top-[96px] lg:w-[25rem] lg:self-start`)}
        </div>

      </main>

      {/* SEO Content - Only show when no enemies selected (so guide link always works) */}
      {selectedEnemies.length === 0 && (
        <LandingContent />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-white/10 bg-obsidian-900 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white/40">
          <p>{t('copyright')}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/esports/"
              className="hover:text-white transition-colors"
            >
              Live Esports
            </a>
            <a
              href="/counters/"
              className="hover:text-white transition-colors"
            >
              Hero Counters
            </a>
            <a
              href="https://discord.com/invite/xrPY4de57"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{t('joinDiscord')}</span>
            </a>
            <button
              onClick={() => setShowAbout(true)}
              className="hover:text-white transition-colors"
            >
              {t('aboutUs')}
            </button>
            <button
              onClick={() => setShowContact(true)}
              className="hover:text-white transition-colors"
            >
              {t('contact')}
            </button>
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="hover:text-white transition-colors"
            >
              {t('privacyPolicy')}
            </button>
            <button
              onClick={() => setShowTerms(true)}
              className="hover:text-white transition-colors"
            >
              {t('termsOfService')}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AboutUs isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <Contact isOpen={showContact} onClose={() => setShowContact(false)} />
      <PrivacyPolicy isOpen={showPrivacyPolicy} onClose={() => setShowPrivacyPolicy(false)} />
      <TermsOfService isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <WelcomeModal
        onOpenTerms={() => setShowTerms(true)}
        onOpenPrivacy={() => setShowPrivacyPolicy(true)}
      />

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}

export default App;
