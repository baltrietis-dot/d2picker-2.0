import { X } from 'lucide-react';

interface TermsOfServiceProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TermsOfService({ isOpen, onClose }: TermsOfServiceProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-slate-700 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">Terms of Service</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] text-slate-300 space-y-4">
                    <p className="text-sm text-slate-400">Last updated: June 10, 2026</p>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h3>
                        <p>
                            By accessing and using Dota2Picker.com, you accept and agree to be bound by the terms and provision of this agreement.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">2. Description of Service</h3>
                        <p>
                            Dota2Picker.com provides a free Dota 2 counter picking tool ("Service"). The Service is provided "as is" and is for informational purposes only.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">3. Disclaimer</h3>
                        <p>
                            Dota2Picker.com is not affiliated with, endorsed, sponsored, or specifically approved by Valve Corporation. Dota 2 is a registered trademark of Valve Corporation.
                            All game images and names are property of their respective owners.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">4. User Conduct</h3>
                        <p>
                            You agree not to misuse the Service or help anyone else do so. You agree not to attempt to access the Service using a method other than the interface and instructions that we provide.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">5. Limitation of Liability</h3>
                        <p>
                            In no event shall Dota2Picker.com, nor its operators, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">6. Third-Party Links &amp; Affiliate Disclosure</h3>
                        <p>
                            The Service may contain links to third-party websites, including affiliate links for which we may earn
                            a commission if you visit or sign up through them. We do not own, operate, or control those websites,
                            do not endorse their content or services, and are not responsible for their availability, accuracy,
                            terms, or privacy practices. Any dealings you have with third parties linked from the Service are
                            solely between you and that third party.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">7. Betting &amp; Gambling Content</h3>
                        <p className="mb-2">
                            Parts of the Service may reference or link to third-party betting or gambling operators. Such content
                            is intended only for users aged 18 or older (or the higher minimum age in your jurisdiction).
                        </p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>We are not a gambling operator and do not accept, place, or process bets of any kind.</li>
                            <li>Nothing on the Service constitutes betting, financial, or legal advice. Draft statistics and match information are provided for informational purposes only.</li>
                            <li>Online betting is illegal in some jurisdictions. You are solely responsible for verifying that your use of any linked betting service is lawful where you live.</li>
                            <li>We are not liable for any losses incurred through third-party betting services. Gambling can be addictive — if it stops being fun, seek help (for example via <a href="https://www.gamblingtherapy.org/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Gambling Therapy</a>).</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">8. Changes to Terms</h3>
                        <p>
                            We reserve the right to modify these terms at any time. We will do so by posting and drawing attention to the updated terms on the Site. Your decision to continue to visit and make use of the Site after such changes have been made constitutes your formal acceptance of the new Terms of Service.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">Contact Us</h3>
                        <p>
                            If you have any questions about these Terms, please join our <a href="https://discord.com/invite/xrPY4de57" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Discord community</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
