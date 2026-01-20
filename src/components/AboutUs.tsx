import { X } from 'lucide-react';

interface AboutUsProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AboutUs({ isOpen, onClose }: AboutUsProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-slate-700 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">About Us</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] text-slate-300 space-y-6">
                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">Our Mission</h3>
                        <p>
                            Dota 2 Counter Picker was created with a simple goal: to help Dota 2 players of all skill levels draft better and win more games.
                            We believe that the draft phase is one of the most critical parts of the game, and having the right information at your fingertips can make all the difference.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">How It Works</h3>
                        <p className="mb-2">
                            Our tool analyzes thousands of professional matches to identify the most statistically effective counters for every hero.
                            We consider various factors, including:
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2 text-slate-400">
                            <li>Win rates in professional play</li>
                            <li>Lane-specific matchups</li>
                            <li>Synergy with teammates</li>
                            <li>Meta trends and recent patches</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">Developed for the Community</h3>
                        <p>
                            We are passionate Dota 2 players ourselves, dedicated to maintaining and improving this tool for the community.
                            Features are regularly updated to reflect the latest game patches and meta shifts.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">Disclaimer</h3>
                        <p className="text-sm text-slate-400">
                            Dota 2 is a registered trademark of Valve Corporation. This site is not affiliated with, endorsed by, or sponsored by Valve Corporation.
                            All game images and names are property of their respective owners.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
