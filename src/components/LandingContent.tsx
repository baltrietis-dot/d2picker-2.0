import { TrendingUp, Shield, Zap, BookOpen, BarChart3, Target } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export function LandingContent() {
    const { t } = useLanguage();

    return (
        <div className="max-w-4xl mx-auto space-y-12 py-12 px-4 text-slate-300">

            {/* Introduction */}
            <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                        <BookOpen className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{t('landingTitle')}</h2>
                </div>
                <p className="leading-relaxed text-slate-400">{t('landingIntro1')}</p>
                <p className="leading-relaxed text-slate-400">{t('landingIntro2')}</p>
            </section>

            {/* Methodology Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <BarChart3 className="h-5 w-5 text-green-400" />
                        <h3 className="text-lg font-bold text-white">{t('algorithmTitle')}</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-4 inline-block">{t('algorithmDesc2')}</p>
                    <ul className="space-y-3 text-sm">
                        <li className="flex gap-2">
                            <span className="text-green-500 font-bold">•</span>
                            <span><strong>{t('counterSynergyTitle')}</strong> {t('counterSynergyDesc')}</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-green-500 font-bold">•</span>
                            <span><strong>{t('metaWeightTitle')}</strong> {t('metaWeightDesc')}</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-green-500 font-bold">•</span>
                            <span><strong>{t('laneMatchupTitle')}</strong> {t('laneMatchupDesc')}</span>
                        </li>
                    </ul>
                </section>

                <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <Target className="h-5 w-5 text-red-400" />
                        <h3 className="text-lg font-bold text-white">{t('understandingStats')}</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-bold text-white text-sm mb-1">{t('advantageStatTitle')}</h4>
                            <p className="text-xs text-slate-400">{t('advantageStatDesc')}</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm mb-1">{t('winRateStatTitle')}</h4>
                            <p className="text-xs text-slate-400">{t('winRateStatDesc')}</p>
                        </div>
                    </div>
                </section>
            </div>

            {/* Drafting Guide */}
            <section id="guide" className="space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{t('masteringDraft')}</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <article>
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            <Shield className="h-4 w-4 text-indigo-400" />
                            {t('phase1Title')}
                        </h3>
                        <p className="text-sm text-slate-400">{t('phase1Desc')}</p>
                    </article>

                    <article>
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-400" />
                            {t('cheeseTitle')}
                        </h3>
                        <p className="text-sm text-slate-400">{t('cheeseDesc')}</p>
                    </article>

                    <article>
                        <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-cyan-400" />
                            {t('synergyTitle')}
                        </h3>
                        <p className="text-sm text-slate-400">{t('synergyDesc')}</p>
                    </article>
                </div>
            </section>

            {/* SEO / Footer Content */}
            <section className="bg-slate-900/50 rounded-xl p-8 text-center space-y-4">
                <h3 className="text-xl font-bold text-white">{t('whyUsTitle')}</h3>
                <p className="max-w-2xl mx-auto text-slate-400">{t('whyUsDesc')}</p>
            </section>

        </div>
    );
}
