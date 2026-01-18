import { TrendingUp, Shield, Zap, BookOpen, BarChart3, Target } from 'lucide-react';

export function LandingContent() {
    return (
        <div className="max-w-4xl mx-auto space-y-12 py-12 px-4 text-slate-300">

            {/* Introduction */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <BookOpen className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">The Ultimate Dota 2 Counter Picker</h2>
                </div>
                <p className="leading-relaxed text-slate-400">
                    Welcome to the most advanced <strong>Dota 2 Counter Picker</strong> tool, updated for Patch 7.37.
                    Unlike other drafting tools that rely on low-mmr pub data or subjective tier lists, our algorithm is powered exclusively by
                    <strong> professional match data</strong>. We analyze thousands of high-level matches to determine which heroes statistically
                    dominate specific matchups in the current meta.
                </p>
                <p className="leading-relaxed text-slate-400">
                    Whether you are drafting for a Battle Cup, ranking up in Immortal, or just want to crush your pub games,
                    picking the right hero is half the battle. This tool gives you the statistical edge you need to outdraft your opponents before the horn even sounds.
                </p>
            </section>

            {/* Methodology Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="h-5 w-5 text-green-400" />
                        <h3 className="text-lg font-bold text-white">How the Algorithm Works</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-4 inline-block">
                        We don't just look at general win rates. Our engine calculates a specific <strong>"Advantage Score"</strong> for every potential matchup.
                    </p>
                    <ul className="space-y-3 text-sm">
                        <li className="flex gap-2">
                            <span className="text-green-500 font-bold">•</span>
                            <span>
                                <strong>Direct Counter Synergy:</strong> How much better does a hero perform against a specific enemy compared to their average win rate?
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-green-500 font-bold">•</span>
                            <span>
                                <strong>Meta Weighting:</strong> Heroes that are currently strong in the pro meta are naturally prioritized, but only if they fit the matchup.
                            </span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-green-500 font-bold">•</span>
                            <span>
                                <strong>Lane Matchups:</strong> We consider laning dynamics to ensure you don't just counter the game, but also survive the laning stage.
                            </span>
                        </li>
                    </ul>
                </section>

                <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <Target className="h-5 w-5 text-red-400" />
                        <h3 className="text-lg font-bold text-white">Understanding the Stats</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-bold text-white text-sm mb-1">Advantage (+%)</h4>
                            <p className="text-xs text-slate-400">
                                This is the most important metric. A <span className="text-green-400">+2.00%</span> advantage means this hero wins 2% more often against this specific enemy team than they do on average. It isolates the matchup quality from the hero's raw strength.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm mb-1">Win Rate (%)</h4>
                            <p className="text-xs text-slate-400">
                                The hero's raw win rate in high-level pubs and pro matches. A hero with a high win rate is generally strong in the meta, but might not be a specific hard counter.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Drafting Guide */}
            <section className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Mastering the Draft in 7.37</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <article>
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-indigo-400" />
                            1. The "First Phase" Trap
                        </h3>
                        <p className="text-sm text-slate-400">
                            Never reveal your win-conditions early. Use the first phase to pick flexible supports or offlaners that don't have hard counters.
                            Our tool can help you find "Safe First Picks" by looking for heroes with high general win rates and few bad matchups.
                        </p>
                    </article>

                    <article>
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            2. Countering the "Cheese"
                        </h3>
                        <p className="text-sm text-slate-400">
                            Last pick Meepo, Arc Warden, or Huskar can destroy unprepared teams. Use our tool to instantly find the hard counters if you spot a cheese pick.
                            Usually, heavy disable or specific mechanics (like AA blast vs Huskar) are required.
                        </p>
                    </article>

                    <article>
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-cyan-400" />
                            3. Synergy vs Counter
                        </h3>
                        <p className="text-sm text-slate-400">
                            Don't just counter—picked heroes must also fit your team. If you need a stun, don't pick a Silencer just because he counters Enigma.
                            Use our "Role" filters to find a counter that also fills the gap in your lineup (e.g., "Hard Support" that counters "Spectre").
                        </p>
                    </article>
                </div>
            </section>

            {/* SEO / Footer Content */}
            <section className="bg-slate-900/50 rounded-xl p-8 text-center space-y-4">
                <h3 className="text-xl font-bold text-white">Why use Dota2Picker?</h3>
                <p className="max-w-2xl mx-auto text-slate-400">
                    This project is maintained by passionate Dota 2 developers who wanted a cleaner, faster, and more accurate alternative to ad-cluttered drafting sites.
                    We believe in free access to high-quality data. Our database is updated daily with the latest pro matches to ensure you're always ahead of the meta.
                </p>
            </section>

        </div>
    );
}
