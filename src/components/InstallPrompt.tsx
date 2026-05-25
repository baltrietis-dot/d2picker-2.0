import { useEffect, useState } from 'react';
import { X, Smartphone } from 'lucide-react';

const DISMISS_KEY = 'd2picker_install_dismissed';
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isDismissed(): boolean {
    try {
        const ts = localStorage.getItem(DISMISS_KEY);
        if (!ts) return false;
        return Date.now() - Number(ts) < DISMISS_DURATION_MS;
    } catch {
        return false;
    }
}

function isIos(): boolean {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showIosHint, setShowIosHint] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Already installed or user dismissed recently — do nothing
        if (isInStandaloneMode() || isDismissed()) return;

        if (isIos()) {
            // Show iOS tip after 3 s
            const t = setTimeout(() => {
                setShowIosHint(true);
                setVisible(true);
            }, 3000);
            return () => clearTimeout(t);
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        const onInstalled = () => setVisible(false);
        window.addEventListener('appinstalled', onInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', onInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setVisible(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setVisible(false);
        try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* noop */ }
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm animate-fadeIn">
            <div className="surface gold-frame flex items-start gap-3 rounded-lg p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 shadow-[0_10px_24px_-16px_rgba(251,191,36,0.95)]">
                    <Smartphone className="h-5 w-5 text-obsidian-900" />
                </div>

                <div className="flex-1 min-w-0">
                    {showIosHint ? (
                        <>
                            <p className="text-sm font-bold text-white">Add to Home Screen</p>
                            <p className="mt-0.5 text-xs text-white/45">
                                Tap <span className="text-gold-300">Share</span> → <span className="text-gold-300">Add to Home Screen</span> for instant draft access
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm font-bold text-white">Install D2Picker</p>
                            <p className="mt-0.5 text-xs text-white/45">Instant access during your draft — works offline too</p>
                            <button
                                onClick={handleInstall}
                                className="btn-gold mt-2 rounded-md px-4 py-1.5 text-xs font-black uppercase tracking-[0.14em]"
                            >
                                Install
                            </button>
                        </>
                    )}
                </div>

                <button
                    onClick={handleDismiss}
                    className="shrink-0 rounded-md p-1 text-white/35 transition-colors hover:bg-white/5 hover:text-white"
                    aria-label="Dismiss"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
