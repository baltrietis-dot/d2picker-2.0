import { useLanguage } from '../context/useLanguage';

/**
 * Disclosure block for betting/affiliate placements.
 * Render this directly adjacent to (above or below) any block of affiliate
 * links — ad-labelling rules require the notice to be visible next to the
 * promotion itself, not tucked into the ToS.
 *
 * Not rendered anywhere yet: drop it in together with the first affiliate
 * placement, and add a small "18+" note to the site footer at the same time.
 */

const EN = {
    ad: 'Advertising',
    affiliate:
        'This block contains affiliate links — we may earn a commission if you sign up through them, at no extra cost to you.',
    responsible:
        'Betting may be illegal in your jurisdiction — check your local laws. Gambling can be addictive. Play responsibly.',
    help: 'Problem gambling help:',
};

const RU = {
    ad: 'Реклама',
    affiliate:
        'Этот блок содержит партнёрские ссылки — мы можем получать комиссию, если вы зарегистрируетесь по ним (для вас это бесплатно).',
    responsible:
        'Ставки могут быть запрещены в вашей юрисдикции — проверьте местное законодательство. Азартные игры могут вызывать зависимость. Играйте ответственно.',
    help: 'Помощь при игровой зависимости:',
};

export function AffiliateDisclosure({ className = '' }: { className?: string }) {
    const { language } = useLanguage();
    const copy = language === 'ru' ? RU : EN;

    return (
        <aside className={`surface rounded-lg p-3 text-[12px] leading-relaxed text-white/55 ${className}`}>
            <div className="mb-1.5 flex items-center gap-2">
                <span className="rounded border border-dire-500/60 bg-dire-900/40 px-1.5 py-0.5 text-[11px] font-black tracking-wide text-dire-300">
                    18+
                </span>
                <span className="label-sm">{copy.ad}</span>
            </div>
            <p>{copy.affiliate}</p>
            <p className="mt-1">{copy.responsible}</p>
            <p className="mt-1">
                {copy.help}{' '}
                <a
                    href="https://www.gamblingtherapy.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-300 hover:text-gold-200 underline"
                >
                    gamblingtherapy.org
                </a>
            </p>
        </aside>
    );
}
