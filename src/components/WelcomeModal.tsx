import { useState } from 'react';
import { Shield, Cookie, FileText, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/useLanguage';

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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-obsidian-900/90 p-4 backdrop-blur-md">
            <div className="surface gold-frame relative w-full max-w-lg overflow-hidden rounded-lg">
                <div className="space-y-5 p-6 text-center">
                    {/* Icon */}
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-[0_10px_28px_-16px_rgba(251,191,36,0.95),inset_0_1px_0_rgba(253,230,138,0.55)]">
                        <Shield className="h-8 w-8 text-obsidian-900" />
                    </div>

                    {/* Content */}
                    <div>
                        <h2 className="mb-2 font-display text-2xl font-bold tracking-wide text-white">{t('welcomeTitle')}</h2>
                        <p className="text-sm leading-relaxed text-white/55">{t('welcomeDesc')}</p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-3 text-left">
                        <div className="surface-quiet rounded-md p-3">
                            <h4 className="mb-1 text-sm font-bold text-gold-300">{t('realStats')}</h4>
                            <p className="text-xs text-white/40">{t('realStatsDesc')}</p>
                        </div>
                        <div className="surface-quiet rounded-md p-3">
                            <h4 className="mb-1 text-sm font-bold text-radiant-400">{t('freeForever')}</h4>
                            <p className="text-xs text-white/40">{t('freeForeverDesc')}</p>
                        </div>
                    </div>

                    {/* Legal Consent */}
                    <div className="surface-quiet rounded-md p-4 text-left">
                        <div className="flex items-start gap-3">
                            <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-gold-400" />
                            <div className="space-y-3">
                                <p className="text-sm text-white/70">{t('cookieNotice')}</p>
                                <div className="flex gap-4 text-xs font-bold">
                                    <button
                                        onClick={onOpenTerms}
                                        className="flex items-center gap-1 text-gold-300 hover:text-gold-200 hover:underline"
                                    >
                                        <FileText className="h-3 w-3" />
                                        {t('termsOfService')}
                                    </button>
                                    <button
                                        onClick={onOpenPrivacy}
                                        className="flex items-center gap-1 text-gold-300 hover:text-gold-200 hover:underline"
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
                        className="btn-gold group flex w-full items-center justify-center gap-2 rounded-md py-3 text-sm font-black uppercase tracking-[0.14em]"
                    >
                        {t('startDrafting')}
                        <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
