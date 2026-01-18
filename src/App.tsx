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
import { Swords, RotateCcw, Shield, Users, Zap, TrendingUp, Target, BookOpen } from 'lucide-react';
import { type Position } from './data/heroPositions';

function App() {
  // Version Log
  useEffect(() => {
    console.log('App Version: 2.1 (Share Fix)');
  }, []);

  const [targetRole, setTargetRole] = useState<Position | 'Any'>('Any');

  const {
    heroes,
    selectedEnemies,
    myTeam,
    topCounters,
    loading,
    loadHeroes,
    addEnemy,
    removeEnemy,
    addMyTeam,
    removeMyTeam,
    clearAll
  } = useCounterPicker(targetRole);

  useEffect(() => {
    loadHeroes();
  }, [loadHeroes]);

  // State to track if we've processed the initial URL params
  const [isUrlLoaded, setIsUrlLoaded] = useState(false);

  // Load shared draft from URL parameters
  useEffect(() => {
    if (heroes.length === 0) return; // Wait for heroes to load

    const params = new URLSearchParams(window.location.search);
    const enemyIds = params.get('e')?.split(',').map(Number).filter(n => !isNaN(n)) || [];
    const teamIds = params.get('t')?.split(',').map(Number).filter(n => !isNaN(n)) || [];

    // Only load if we have params and haven't already loaded
    if (!isUrlLoaded && (enemyIds.length > 0 || teamIds.length > 0) && selectedEnemies.length === 0 && myTeam.length === 0) {
      enemyIds.forEach(id => {
        const hero = heroes.find(h => h.id === id);
        if (hero) addEnemy(hero);
      });
      teamIds.forEach(id => {
        const hero = heroes.find(h => h.id === id);
        if (hero) addMyTeam(hero);
      });
    }

    // Mark as loaded so we can start syncing updates to URL
    setIsUrlLoaded(true);
  }, [heroes, isUrlLoaded, selectedEnemies.length, myTeam.length, addEnemy, addMyTeam]);

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
    if (myTeam.length > 0) {
      params.set('t', myTeam.map(h => h.id).join(','));
    }

    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);

  }, [selectedEnemies, myTeam, isUrlLoaded]);

  const [selectionMode, setSelectionMode] = useState<'enemy' | 'friendly'>('enemy');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

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
                <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                  7.37 Ready
                </span>
              </div>
              <p className="text-xs text-slate-400">Pro match data • 126 heroes • Instant counters</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
                Reset
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
                Dominate Your Drafts
              </span>
            </h2>
            <p className="text-slate-400 mb-4 max-w-xl mx-auto">
              Select enemy heroes below to get instant counter-pick recommendations powered by pro match data.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span>Instant Results</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span>Pro Win Rates</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Target className="h-4 w-4 text-red-400" />
                <span>Role-Based Picks</span>
              </div>
            </div>

            <a href="#guide" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
              <BookOpen className="h-3 w-3" />
              Read Drafting Guide
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
                Enemy Team
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

          {/* My Team Display */}
          <section className={`rounded-xl p-4 border transition-colors ${selectionMode === 'friendly' ? 'bg-slate-800 border-green-500/50 shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)]' : 'bg-slate-800/50 border-slate-700'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`flex items-center gap-2 font-bold uppercase tracking-wider text-sm ${selectionMode === 'friendly' ? 'text-green-400' : 'text-slate-500'}`}>
                <Users className="h-4 w-4" />
                My Team
              </h2>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {Array.from({ length: 5 }).map((_, idx) => {
                const hero = myTeam[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => hero && removeMyTeam(hero.id)}
                    className={`relative flex-1 min-w-[60px] aspect-[16/9] rounded border-2 border-dashed flex items-center justify-center transition-all bg-slate-900/50 overflow-hidden group ${hero ? 'border-green-500/50 cursor-pointer hover:border-green-500' : 'border-slate-700'}`}
                  >
                    {hero ? (
                      <>
                        <img src={hero.img} alt={hero.localized_name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-xs text-green-500 font-bold">X</span>
                        </div>
                      </>
                    ) : <span className="text-slate-700 text-lg font-bold">{idx + 1}</span>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Selection Tabs & Grid */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center gap-4 mb-4 bg-slate-800 p-2 rounded-lg border border-slate-700">
              <span className="text-sm font-bold text-slate-400 pl-2">Picking for:</span>
              <button
                onClick={() => setSelectionMode('enemy')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-bold text-sm transition-all ${selectionMode === 'enemy' ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-lg shadow-red-500/10' : 'text-slate-500 hover:bg-slate-700'}`}
              >
                <Shield className="h-4 w-4" />
                Enemy Team
              </button>
              <button
                onClick={() => setSelectionMode('friendly')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-bold text-sm transition-all ${selectionMode === 'friendly' ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-lg shadow-green-500/10' : 'text-slate-500 hover:bg-slate-700'}`}
              >
                <Users className="h-4 w-4" />
                My Team
              </button>
            </div>

            <HeroGrid
              heroes={heroes}
              onSelect={selectionMode === 'enemy' ? addEnemy : addMyTeam}
              selectedIds={[...selectedEnemies, ...myTeam].map(e => e.id)}
            />
          </div>

          <div className="flex-none lg:w-96 min-h-[300px] lg:min-h-0 flex flex-col">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Target Role:</span>
            </div>

            <div className="flex gap-1 mb-2 bg-slate-800 p-1 rounded-lg border border-slate-700 overflow-x-auto">
              {(['Any', 'Carry', 'Mid', 'Offlane', 'Support'] as const).map(role => (
                <button
                  key={role}
                  onClick={() => setTargetRole(role)}
                  className={`flex-1 px-2 py-1 text-[10px] uppercase font-bold rounded transition-colors ${targetRole === role ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-700 hover:text-slate-300'}`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="mb-2 flex items-center justify-between text-xs text-slate-500 px-1">
              <span>* Pro Data + Heuristics</span>
            </div>
            <CounterList counters={topCounters} loading={loading} selectedEnemies={selectedEnemies} />

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
          <p>© 2026 Dota2Picker.com - Not affiliated with Valve Corporation</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPrivacyPolicy(true)}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setShowTerms(true)}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PrivacyPolicy isOpen={showPrivacyPolicy} onClose={() => setShowPrivacyPolicy(false)} />
      <TermsOfService isOpen={showTerms} onClose={() => setShowTerms(false)} />
      <WelcomeModal
        onOpenTerms={() => setShowTerms(true)}
        onOpenPrivacy={() => setShowPrivacyPolicy(true)}
      />
    </div>
  );
}

export default App;
