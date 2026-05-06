import React, { useState } from 'react';
import { X, Sparkles, Check, Crown, Swords, TrendingUp, Coffee } from 'lucide-react';
import { useSupporter } from '../hooks/useSupporter';
import { useLanguage } from '../context/LanguageContext';

interface PremiumUnlockProps {
    /** Optional inline label shown next to the lock icon on the trigger button */
    label?: string;
    /** Size variant — "sm" is an inline chip, "md" is a full CTA block */
    variant?: 'sm' | 'md';
}

const KOFI_URL = 'https://ko-fi.com/dota2picker';

export const PremiumUnlock: React.FC<PremiumUnlockProps> = ({ label, variant = 'sm' }) => {
    const { t } = useLanguage();
    const { isSupporter, unlock } = useSupporter();
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    if (isSupporter) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const ok = unlock(code);
        if (ok) {
            setSuccess(true);
            setError(false);
            setTimeout(() => setOpen(false), 1400);
        } else {
            setError(true);
            setSuccess(false);
        }
    };

    const triggerSm = (
        <button
            onClick={() => setOpen(true)}
            className="group inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/40 hover:border-amber-400 transition-all shadow-sm hover:shadow-amber-500/20"
        >
            <Crown className="h-3 w-3 group-hover:scale-110 transition-transform" />
            {label || t('unlockPremium')}
        </button>
    );

    const triggerMd = (
        <button
            onClick={() => setOpen(true)}
            className="group w-full flex items-center justify-center gap-2 px-4 py-3 bg-premium-gradient animate-shimmer text-white font-bold rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] hover:shadow-amber-500/50"
        >
            <Crown className="h-4 w-4 group-hover:rotate-12 transition-transform" />
            {label || t('unlockPremium')}
            <Sparkles className="h-4 w-4 opacity-70" />
        </button>
    );

    return (
        <>
            {variant === 'sm' ? triggerSm : triggerMd}

            {open && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-2xl shadow-amber-500/20 max-w-md w-full overflow-hidden premium-border animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Ambient glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/30 text-slate-400 hover:text-white hover:bg-black/50 transition-colors"
                            aria-label="Close"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="relative p-6">
                            {/* Crown badge */}
                            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/40 rotate-3">
                                <Crown className="h-8 w-8 text-white drop-shadow" />
                            </div>

                            <h3 className="text-2xl font-black text-center mb-1">
                                <span className="text-premium-gradient">{t('unlockPremium')}</span>
                            </h3>
                            <p className="text-slate-400 text-sm text-center mb-5 leading-relaxed">{t('premiumDesc')}</p>

                            {/* Feature list */}
                            <div className="grid grid-cols-2 gap-2 mb-5">
                                <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/70">
                                    <Swords className="h-4 w-4 text-amber-400 mb-1.5" />
                                    <div className="text-xs font-bold text-white leading-tight">{t('matchupBreakdown')}</div>
                                </div>
                                <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/70">
                                    <TrendingUp className="h-4 w-4 text-amber-400 mb-1.5" />
                                    <div className="text-xs font-bold text-white leading-tight">{t('strategyGuide')}</div>
                                </div>
                            </div>

                            <a
                                href={KOFI_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative block w-full text-center px-4 py-3 bg-premium-gradient animate-shimmer text-white font-black rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] hover:shadow-amber-500/50 mb-4 overflow-hidden"
                            >
                                <span className="relative flex items-center justify-center gap-2">
                                    <Coffee className="h-4 w-4" />
                                    {t('supportOnKofi')}
                                </span>
                            </a>

                            <div className="flex items-center gap-3 my-4">
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t('enterCode')}</span>
                                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                            </div>

                            <p className="text-xs text-slate-500 mb-3 text-center leading-relaxed">{t('afterSupporting')}</p>

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={code}
                                        onChange={(e) => {
                                            setCode(e.target.value);
                                            setError(false);
                                        }}
                                        placeholder="D2PRO••••"
                                        className={`w-full px-4 py-3 bg-slate-950/60 border-2 rounded-lg text-white placeholder:text-slate-600 uppercase tracking-[0.3em] text-center font-mono outline-none transition-all ${
                                            error
                                                ? 'border-rose-500/60 focus:border-rose-500 shake'
                                                : success
                                                ? 'border-emerald-500/60 focus:border-emerald-500'
                                                : 'border-slate-700 focus:border-amber-500/70'
                                        }`}
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <div className="text-rose-400 text-xs text-center animate-fadeIn font-medium">
                                        ⚠ {t('invalidCode')}
                                    </div>
                                )}
                                {success && (
                                    <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-bold animate-fadeIn">
                                        <Check className="h-4 w-4" />
                                        {t('welcomePro')}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!code.trim() || success}
                                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                                >
                                    {t('unlockBtn')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
