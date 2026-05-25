import { X } from 'lucide-react';
import { useLanguage } from '../context/useLanguage';

interface AboutUsProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AboutUs({ isOpen, onClose }: AboutUsProps) {
    const { t } = useLanguage();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-slate-700 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">{t('aboutTitle')}</h2>
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
                        <h3 className="text-lg font-semibold text-white mb-2">{t('ourMission')}</h3>
                        <p>{t('missionDesc')}</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">{t('howItWorksFull')}</h3>
                        <p className="mb-2">{t('howItWorksDesc')}</p>
                        <ul className="list-disc list-inside space-y-1 ml-2 text-slate-400">
                            {t('howItWorksList').map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">{t('developedForCommunity')}</h3>
                        <p>{t('communityDesc')}</p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">{t('disclaimer')}</h3>
                        <p className="text-sm text-slate-400">{t('disclaimerDesc')}</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
