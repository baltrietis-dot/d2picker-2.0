import { useState } from 'react';
import { Share2, Copy, Check, Twitter } from 'lucide-react';

interface ShareButtonProps {
    selectedEnemies: { id: number; localized_name: string }[];
    myTeam: { id: number; localized_name: string }[];
    topCounters: { id: number; localized_name: string }[];
}

export function ShareButton({ selectedEnemies, myTeam, topCounters }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    // Only show if there's something to share
    if (selectedEnemies.length === 0 && myTeam.length === 0) {
        return null;
    }

    // Generate shareable URL with hero IDs
    const generateShareUrl = () => {
        const params = new URLSearchParams();
        if (selectedEnemies.length > 0) {
            params.set('e', selectedEnemies.map(h => h.id).join(','));
        }
        if (myTeam.length > 0) {
            params.set('t', myTeam.map(h => h.id).join(','));
        }
        return `${window.location.origin}?${params.toString()}`;
    };

    // Generate tweet text
    const generateTweetText = () => {
        const enemyNames = selectedEnemies.map(h => h.localized_name).slice(0, 3).join(', ');
        const counterNames = topCounters.slice(0, 2).map(h => h.localized_name).join(' & ');

        let text = `🎮 Dota 2 Draft Analysis:\n`;
        if (selectedEnemies.length > 0) {
            text += `Enemy: ${enemyNames}${selectedEnemies.length > 3 ? '...' : ''}\n`;
        }
        if (topCounters.length > 0) {
            text += `Best Counters: ${counterNames}\n`;
        }
        text += `\nTry it yourself 👇`;
        return text;
    };

    const handleCopy = async () => {
        const url = generateShareUrl();
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTwitterShare = () => {
        const url = generateShareUrl();
        const text = generateTweetText();
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
    };

    const handleDiscordShare = async () => {
        const url = generateShareUrl();
        const text = `🎮 **Dota 2 Counter Picks**\n${selectedEnemies.length > 0 ? `Enemy: ${selectedEnemies.map(h => h.localized_name).join(', ')}\n` : ''}${topCounters.length > 0 ? `Best Counters: ${topCounters.slice(0, 3).map(h => h.localized_name).join(', ')}\n` : ''}\n${url}`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
            >
                <Share2 className="h-4 w-4" />
                Share Draft
            </button>

            {showMenu && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                        <button
                            onClick={() => { handleCopy(); setShowMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                            {copied ? 'Copied!' : 'Copy Link'}
                        </button>
                        <button
                            onClick={() => { handleTwitterShare(); setShowMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                            <Twitter className="h-4 w-4 text-sky-400" />
                            Share on X
                        </button>
                        <button
                            onClick={() => { handleDiscordShare(); setShowMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                        >
                            <svg className="h-4 w-4 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                            Copy for Discord
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
