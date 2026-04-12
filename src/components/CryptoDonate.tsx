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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-full transition-colors border border-slate-600"
            >
                ₿ Donate Crypto
            </button>

            {open && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-slate-700">
                            <div>
                                <h3 className="font-bold text-white">Donate Crypto</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Support dota2picker.com</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-3">
                            {WALLETS.map(w => (
                                <div key={w.symbol} className={`rounded-xl p-3 border ${w.border} ${w.bg}`}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`text-xs font-bold ${w.color}`}>{w.symbol}</span>
                                        <span className="text-[10px] text-slate-500">{w.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-slate-300 font-mono truncate flex-1">{w.address}</span>
                                        <button
                                            onClick={() => copy(w.address)}
                                            className="shrink-0 p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
                                        >
                                            {copied === w.address
                                                ? <Check className="h-3.5 w-3.5 text-green-400" />
                                                : <Copy className="h-3.5 w-3.5 text-slate-400" />
                                            }
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-5 pb-5 text-center text-xs text-slate-500">
                            Every contribution keeps the tool free & updated 🙏
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
