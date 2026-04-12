import { useState } from 'react';
import { Shield, Cookie, FileText, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface WelcomeModalProps {
    onOpenTerms: () => void;
    onOpenPrivacy: () => void;
}

export function WelcomeModal({ onOpenTerms, onOpenPrivacy }: WelcomeModalProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(() => {
        // PERMANENT FIX: Bumped to V2 to ensure all users (new and returning) see this update
        return !localStorage.getItem('terms_accepted_v2');
    });

    const handleAccept = () => {
        localStorage.setItem('terms_accepted_v2', 'true');
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl shadow-indigo-500/20 max-w-lg w-full overflow-hidden relative">
                <div className="p-8 text-center space-y-6">
                    {/* Icon */}
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Shield className="h-10 w-10 text-white" />
                    </div>

                    {/* Content */}
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-3">{t('welcomeTitle')}</h2>
                        <p className="text-slate-400 leading-relaxed">{t('welcomeDesc')}</p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-indigo-400 text-sm mb-1">{t('realStats')}</h4>
                            <p className="text-xs text-slate-500">{t('realStatsDesc')}</p>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <h4 className="font-bold text-green-400 text-sm mb-1">{t('freeForever')}</h4>
                            <p className="text-xs text-slate-500">{t('freeForeverDesc')}</p>
                        </div>
                    </div>

                    {/* Legal Consent */}
                    <div className="bg-slate-800 rounded-lg p-4 text-left border border-slate-700">
                        <div className="flex items-start gap-3">
                            <Cookie className="h-5 w-5 text-slate-400 mt-0.5 shrink-0" />
                            <div className="space-y-3">
                                <p className="text-sm text-slate-300">{t('cookieNotice')}</p>
                                <div className="flex gap-4 text-xs font-bold">
                                    <button
                                        onClick={onOpenTerms}
                                        className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
                                    >
                                        <FileText className="h-3 w-3" />
                                        {t('termsOfService')}
                                    </button>
                                    <button
                                        onClick={onOpenPrivacy}
                                        className="text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
                                    >
                                        <Shield className="h-3 w-3" />
                                        {t('privacyPolicy')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        onClick={handleAccept}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 group"
                    >
                        {t('startDrafting')}
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
