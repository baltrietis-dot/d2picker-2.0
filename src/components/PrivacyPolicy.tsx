import { X } from 'lucide-react';

interface PrivacyPolicyProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden border border-slate-700 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-white">Privacy Policy</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] text-slate-300 space-y-4">
                    <p className="text-sm text-slate-400">Last updated: January 18, 2026</p>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">Introduction</h3>
                        <p>
                            Welcome to Dota2Picker.com ("we," "our," or "us"). We are committed to protecting your privacy.
                            This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">Information We Collect</h3>
                        <p className="mb-2">We may collect the following types of information:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong>Usage Data:</strong> Information about how you use our website, including pages visited and time spent.</li>
                            <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers.</li>
                            <li><strong>Cookies:</strong> Small data files stored on your device to enhance your experience.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">How We Use Your Information</h3>
                        <p className="mb-2">We use the collected information to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Provide and maintain our Dota 2 counter picking tool</li>
                            <li>Analyze usage patterns to improve our service</li>
                            <li>Display relevant advertisements through Google AdSense</li>
                            <li>Understand user preferences and optimize user experience</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">Third-Party Services</h3>
                        <p className="mb-2">We use the following third-party services:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li><strong>Google Analytics:</strong> To analyze website traffic and usage patterns. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google Privacy Policy</a></li>
                            <li><strong>Google AdSense:</strong> To display advertisements. Google may use cookies to serve ads based on your prior visits. <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Learn more</a></li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">Cookies</h3>
                        <p>
                            We use cookies and similar tracking technologies to track activity on our website and hold certain information.
                            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                            However, if you do not accept cookies, you may not be able to use some portions of our service.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">Your Rights</h3>
                        <p className="mb-2">You have the right to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Opt out of personalized advertising via <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google Ads Settings</a></li>
                            <li>Clear cookies from your browser at any time</li>
                            <li>Request information about data we hold about you</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">Data Security</h3>
                        <p>
                            We value your trust in providing us your information and strive to use commercially acceptable means of protecting it.
                            However, no method of transmission over the Internet or method of electronic storage is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">Children's Privacy</h3>
                        <p>
                            Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">Changes to This Policy</h3>
                        <p>
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page
                            and updating the "Last updated" date.
                        </p>
                    </section>

                    <section>
                        <h3 className="text-lg font-semibold text-white mb-2">Contact Us</h3>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us through the website.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
