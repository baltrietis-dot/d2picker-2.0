import { useEffect, useState } from 'react';
import { useCounterPicker } from './hooks/useCounterPicker';
import { HeroGrid } from './components/HeroGrid';
import { CounterList } from './components/CounterList';
import { HeaderAd, SidebarAd, FooterAd } from './components/AdBanner';
import { LandingContent } from './components/LandingContent';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { WelcomeModal } from './components/WelcomeModal';
import { ShareButton } from './components/ShareButton';
import { AboutUs } from './components/AboutUs';
import { Contact } from './components/Contact';
import { CryptoDonate } from './components/CryptoDonate';
import { InstallPrompt } from './components/InstallPrompt';
import { Swords, RotateCcw, Shield, Users, Zap, TrendingUp, Target, BookOpen, MessageCircle, Filter } from 'lucide-react';
import { type Position, type PositionNumber, NUMBER_TO_POSITION, getHeroRoles } from './data/heroPositions';
import { getSlugFromPath, heroFromSlug } from './utils/heroSlug';
import { useLanguage } from './context/LanguageContext';

function App() {
  // Version Log
  useEffect(() => {
    console.log('App Version: 2.1 (Share Fix)');
  }, []);

  const { t, language, setLanguage } = useLanguage();
  const [targetRole, setTargetRole] = useState<Position | 'Any'>('Any');

  const {
    heroes,
    selectedEnemies,
    myTeam,
    myTeamSlots,
    topCounters,
    matchupsMap,
    loading,
    loadHeroes,
    addEnemy,
    removeEnemy,
    setMyTeamAt,
    removeMyTeamAt,
    clearAll
  } = useCounterPicker(targetRole);

  useEffect(() => {
    loadHeroes();
  }, [loadHeroes]);

  // State to track if we've processed the initial URL params
  const [isUrlLoaded, setIsUrlLoaded] = useState(false);

  // Load hero from /counter/:slug path OR shared draft from URL parameters
  useEffect(() => {
    if (heroes.length === 0) return;

    // Handle /counter/anti-mage and /ru/counter/anti-mage pages
    const pathInfo = getSlugFromPath();
    if (pathInfo && !isUrlLoaded) {
      const hero = heroFromSlug(pathInfo.slug, heroes);
      if (hero) addEnemy(hero);
      if (pathInfo.lang === 'ru') setLanguage('ru');
      setIsUrlLoaded(true);
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

    if (!isUrlLoaded && (enemyIds.length > 0 || teamEntries.length > 0) && selectedEnemies.length === 0 && myTeam.length === 0) {
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

    setIsUrlLoaded(true);
  }, [heroes, isUrlLoaded, selectedEnemies.length, myTeam.length, addEnemy, setMyTeamAt]);

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
    if (!isUrlLoaded) return; // Don't overwrite URL until we've loaded initial state

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

  }, [selectedEnemies, myTeamSlots, isUrlLoaded]);

  // Selection mode:
  //   'enemy'                  → clicking hero adds to enemy pool
  //   { pos: N }               → clicking hero assigns to my-team slot N
  type SelectionMode = 'enemy' | { pos: PositionNumber };
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('enemy');
  const [hideOffRole, setHideOffRole] = useState(true);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header Ad Banner */}
      <div className="max-w-7xl mx-auto px-4">
        <HeaderAd />
      </div>

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 shadow-md z-20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
              <Swords className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">Dota 2 Counter Picker</h1>
              </div>
              <p className="text-xs text-slate-400">{t('tagline')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-full p-0.5">
              <button onClick={() => setLanguage('en')} className={`px-2.5 py-1 text-xs font-bold rounded-full transition-colors ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>EN</button>
              <button onClick={() => setLanguage('ru')} className={`px-2.5 py-1 text-xs font-bold rounded-full transition-colors ${language === 'ru' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>RU</button>
            </div>
            {/* Ko-fi */}
            <a
              href="https://ko-fi.com/dota2picker"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF5E5B] hover:bg-[#ff4744] text-white text-xs font-bold rounded-full transition-colors shadow-sm"
            >
              {t('support')}
            </a>
            {/* Crypto */}
            <CryptoDonate />
            {/* Share Button */}
            <ShareButton
              selectedEnemies={selectedEnemies}
              myTeam={myTeam}
              topCounters={topCounters}
            />
            {/* Clear All */}
            {(selectedEnemies.length > 0 || myTeam.length > 0) && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors bg-slate-800 border border-slate-700 hover:bg-slate-700 px-3 py-1.5 rounded-full"
              >
                <RotateCcw className="h-3 w-3" />
                {t('reset')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero CTA Section - Only show when no heroes selected */}
      {selectedEnemies.length === 0 && myTeam.length === 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 py-6 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {t('dominateDrafts')}
              </span>
            </h2>
            <p className="text-slate-400 mb-4 max-w-xl mx-auto">
              {t('ctaDesc')}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span>{t('instantResults')}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span>{t('proWinRates')}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Target className="h-4 w-4 text-red-400" />
                <span>{t('roleBasedPicks')}</span>
              </div>
            </div>

            <a href="#guide" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
              <BookOpen className="h-3 w-3" />
              {t('readGuide')}
            </a>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 overflow-hidden flex flex-col gap-6">

        {/* Teams Bar - Visual Only Now */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Enemy Team Display */}
          <section className={`rounded-xl p-4 border transition-colors ${selectionMode === 'enemy' ? 'bg-slate-800 border-red-500/50 shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]' : 'bg-slate-800/50 border-slate-700'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`flex items-center gap-2 font-bold uppercase tracking-wider text-sm ${selectionMode === 'enemy' ? 'text-red-400' : 'text-slate-500'}`}>
                <Shield className="h-4 w-4" />
                {t('enemyTeam')}
              </h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {Array.from({ length: 5 }).map((_, idx) => {
                const hero = selectedEnemies[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => hero && removeEnemy(hero.id)}
                    className={`relative flex-1 min-w-[60px] aspect-[16/9] rounded border-2 border-dashed flex items-center justify-center transition-all bg-slate-900/50 overflow-hidden group ${hero ? 'border-red-500/50 cursor-pointer hover:border-red-500' : 'border-slate-700'}`}
                  >
                    {hero ? (
                      <>
                        <img src={hero.img} alt={hero.localized_name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-xs text-red-500 font-bold">X</span>
                        </div>
                      </>
                    ) : <span className="text-slate-700 text-lg font-bold">{idx + 1}</span>}
                  </div>
                );
              })}
            </div>
          </section>

          {/* My Team Display — positioned slots 1–5 */}
          <section className={`rounded-xl p-4 border transition-colors ${selectionMode !== 'enemy' ? 'bg-slate-800 border-green-500/50 shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)]' : 'bg-slate-800/50 border-slate-700'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`flex items-center gap-2 font-bold uppercase tracking-wider text-sm ${selectionMode !== 'enemy' ? 'text-green-400' : 'text-slate-500'}`}>
                <Users className="h-4 w-4" />
                {t('myTeam')}
              </h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {([1, 2, 3, 4, 5] as PositionNumber[]).map((pos) => {
                const hero = myTeamSlots[pos - 1];
                const isActive = selectionMode !== 'enemy' && selectionMode.pos === pos;
                const posKey = NUMBER_TO_POSITION[pos];
                return (
                  <div key={pos} className="flex-1 min-w-[60px] flex flex-col gap-1">
                    <div className={`text-[9px] uppercase font-black tracking-wider text-center leading-none ${isActive ? 'text-green-400' : 'text-slate-500'}`}>
                      <span className="inline-block px-1 py-0.5 rounded bg-slate-900/60">{pos}</span>{' '}
                      {t(`posShort${posKey}` as any)}
                    </div>
                    <div
                      onClick={() => {
                        if (hero) removeMyTeamAt(pos);
                        else setSelectionMode({ pos });
                      }}
                      className={`relative aspect-[16/9] rounded border-2 flex items-center justify-center transition-all bg-slate-900/50 overflow-hidden group cursor-pointer
                        ${hero
                          ? 'border-green-500/50 hover:border-green-500 border-solid'
                          : isActive
                            ? 'border-green-400 border-dashed animate-pulse'
                            : 'border-slate-700 border-dashed hover:border-green-500/50'}`}
                      title={hero ? hero.localized_name : t('emptySlotHint')}
                    >
                      {hero ? (
                        <>
                          <img src={hero.img} alt={hero.localized_name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-xs text-green-500 font-bold">X</span>
                          </div>
                        </>
                      ) : <span className="text-slate-700 text-lg font-bold">+</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Selection Tabs & Grid */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex flex-col gap-2 mb-4 bg-slate-800 p-2 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 pl-1 shrink-0">{t('pickingFor')}</span>
                <button
                  onClick={() => setSelectionMode('enemy')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md font-bold text-xs transition-all ${selectionMode === 'enemy' ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-lg shadow-red-500/10' : 'text-slate-500 hover:bg-slate-700 border border-transparent'}`}
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
                      onClick={() => setSelectionMode({ pos })}
                      className={`flex-1 flex flex-col items-center justify-center py-1 rounded-md font-bold transition-all ${isActive ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-lg shadow-green-500/10' : 'text-slate-500 hover:bg-slate-700 border border-transparent'}`}
                      title={t(`posFull${posKey}` as any)}
                    >
                      <span className="text-[10px] leading-none opacity-70">{pos}</span>
                      <span className="text-[10px] leading-tight">{t(`posShort${posKey}` as any)}</span>
                    </button>
                  );
                })}
              </div>
              {selectionMode !== 'enemy' && (
                <div className="flex items-center gap-2 pl-1 text-[11px]">
                  <Filter className="h-3 w-3 text-slate-500" />
                  <button
                    onClick={() => setHideOffRole(true)}
                    className={`px-2 py-0.5 rounded-full font-bold transition-colors ${hideOffRole ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}
                  >
                    {t('onlyThisRole')}
                  </button>
                  <button
                    onClick={() => setHideOffRole(false)}
                    className={`px-2 py-0.5 rounded-full font-bold transition-colors ${!hideOffRole ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'text-slate-500 hover:text-slate-300 border border-transparent'}`}
                  >
                    {t('showAllHeroes')}
                  </button>
                </div>
              )}
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
              hideOffRole={hideOffRole}
            />
          </div>

          <div className="flex-none lg:w-96 min-h-[300px] lg:min-h-0 flex flex-col">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500 px-1">
              <span>{t('targetRole')}</span>
            </div>

            <div className="flex gap-1 mb-2 bg-slate-800 p-1 rounded-lg border border-slate-700 overflow-x-auto">
              {(['Any', 'Carry', 'Mid', 'Offlane', 'SoftSupport', 'HardSupport'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setTargetRole(role)}
                  className={`flex-1 px-2 py-1 text-[10px] uppercase font-bold rounded transition-colors ${targetRole === role ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-700 hover:text-slate-300'}`}
                >
                  {t(`role${role}` as any)}
                </button>
              ))}
            </div>

            <div className="mb-2 flex items-center justify-between text-xs text-slate-500 px-1">
              <span>{t('proDataHeuristics')}</span>
            </div>
            <CounterList counters={topCounters} loading={loading} selectedEnemies={selectedEnemies} matchupsMap={matchupsMap} />

            {/* Sidebar Ad */}
            <div className="mt-4 rounded-lg overflow-hidden">
              <SidebarAd />
            </div>
          </div>
        </div>

      </main>

      {/* SEO Content - Only show when no enemies selected (so guide link always works) */}
      {selectedEnemies.length === 0 && (
        <LandingContent />
      )}

      {/* Footer Ad Banner */}
      <div className="bg-slate-950 border-t border-slate-800 py-2 px-4 mt-auto">
        <div className="max-w-7xl mx-auto">
          <FooterAd />
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500">
          <p>{t('copyright')}</p>
          <div className="flex items-center gap-4">
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
