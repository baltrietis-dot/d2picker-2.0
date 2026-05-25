import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

const WALLETS = [
    { symbol: 'BTC', name: 'Bitcoin', color: 'text-orange-400', border: 'border-orange-500/30', bg: 'bg-orange-500/10', address: 'bc1qkwpkp73yqphcpqps7504ppknwmxa2t7vd5wn2z' },
    { symbol: 'ETH', name: 'Ethereum', color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', address: '0xEBe384ECA2762A4A4196d07D1e21121B72c203c8' },
    { symbol: 'XRP', name: 'XRP', color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10', address: 'rGq46i5yyhVzqYH6wuukwuwMXgja3Uzwew' },
    { symbol: 'SOL', name: 'Solana', color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', address: 'GSLm3f8AX7MmQMmw2ciR1oAqYoZn28r4vsaLhy5ZrakX' },
];

export const CryptoDonate = () => {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    const copy = (address: string) => {
        navigator.clipboard.writeText(address);
        setCopied(address);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="toolbar-button"
            >
                Donate Crypto
            </button>

            {open && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-obsidian-900/85 p-4 backdrop-blur-md">
                    <div className="surface gold-frame w-full max-w-sm overflow-hidden rounded-lg">
                        <div className="flex items-center justify-between border-b border-white/10 p-5">
                            <div>
                                <h3 className="font-display font-bold tracking-wide text-white">Donate Crypto</h3>
                                <p className="mt-0.5 text-xs text-white/45">Support dota2picker.com</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="rounded-md p-1 text-white/45 transition-colors hover:bg-white/5 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-3">
                            {WALLETS.map(w => (
                                <div key={w.symbol} className={`rounded-md p-3 border ${w.border} ${w.bg}`}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`text-xs font-bold ${w.color}`}>{w.symbol}</span>
                                        <span className="text-[10px] text-white/35">{w.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="flex-1 truncate font-mono text-[11px] text-white/65">{w.address}</span>
                                        <button
                                            onClick={() => copy(w.address)}
                                            className="shrink-0 rounded-md border border-white/10 bg-obsidian-900/70 p-1.5 transition-colors hover:border-gold-500/30 hover:bg-white/5"
                                        >
                                            {copied === w.address
                                                ? <Check className="h-3.5 w-3.5 text-green-400" />
                                                : <Copy className="h-3.5 w-3.5 text-white/45" />
                                            }
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-5 pb-5 text-center text-xs text-white/40">
                            Every contribution keeps the tool free and updated.
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
