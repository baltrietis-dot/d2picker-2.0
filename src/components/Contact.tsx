import { X, MessageCircle } from 'lucide-react';

interface ContactProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Contact({ isOpen, onClose }: ContactProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl max-w-xl w-full max-h-[80vh] overflow-hidden border border-slate-700 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">Contact Us</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] text-slate-300 space-y-6">
                    <div>
                        <p className="mb-6">
                            Have feedback, found a bug, or just want to chat? We'd love to hear from you!
                            Choose the method that works best for you below.
                        </p>
                    </div>

                    <div className="grid gap-4">
                        <a
                            href="https://discord.com/invite/xrPY4de57"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all group"
                        >
                            <div className="p-3 bg-indigo-500 rounded-full text-white group-hover:scale-110 transition-transform">
                                <MessageCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors">Join our Discord</h3>
                                <p className="text-sm text-slate-400">Best for quick chats, bug reports, and community discussion.</p>
                            </div>
                        </a>

                    </div>

                    <div className="pt-4 border-t border-slate-700">
                        <p className="text-xs text-slate-500 text-center">
                            We aim to respond to all inquiries within 24-48 hours.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
