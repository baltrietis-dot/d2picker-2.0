import { useEffect, useRef, useState } from 'react';

interface AdBannerProps {
    slot: string;                // AdSense ad slot ID
    format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
    responsive?: boolean;
    className?: string;
}

declare global {
    interface Window {
        adsbygoogle: unknown[];
    }
}

const LOCAL_AD_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const isLocalAdHost = () => LOCAL_AD_HOSTS.has(window.location.hostname);

export function AdBanner({
    slot,
    format = 'auto',
    responsive = true,
    className = ''
}: AdBannerProps) {
    const adRef = useRef<HTMLDivElement>(null);
    const insRef = useRef<HTMLModElement>(null);
    const isAdPushed = useRef(false);
    const [isFilled, setIsFilled] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(isLocalAdHost);

    useEffect(() => {
        if (isLocalAdHost()) return;

        const updateAdState = () => {
            if (!insRef.current) return;

            const status = insRef.current.getAttribute('data-ad-status');

            if (status === 'filled') {
                setIsFilled(true);
                setIsCollapsed(false);
                return;
            }

            if (status === 'unfilled') {
                setIsCollapsed(true);
            }
        };

        const pushAd = () => {
            if (isAdPushed.current || !adRef.current || !insRef.current) return;
            const wrapperWidth = adRef.current.getBoundingClientRect().width;
            const slotWidth = insRef.current.getBoundingClientRect().width;
            if (wrapperWidth < 1 || slotWidth < 1) return;
            if (insRef.current.getAttribute('data-adsbygoogle-status') === 'done') {
                isAdPushed.current = true;
                return;
            }

            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                isAdPushed.current = true;
            } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                if (!message.includes('No slot size')) {
                    console.error('AdSense error:', err);
                }
                setIsCollapsed(true);
            }
        };

        pushAd();

        const resizeObserver = new ResizeObserver(pushAd);
        if (adRef.current) resizeObserver.observe(adRef.current);
        if (insRef.current) resizeObserver.observe(insRef.current);

        const mutationObserver = new MutationObserver(updateAdState);
        if (insRef.current) {
            mutationObserver.observe(insRef.current, {
                attributes: true,
                childList: true,
                subtree: true,
            });
        }

        const collapseTimer = window.setTimeout(() => {
            if (!insRef.current) return;
            const status = insRef.current.getAttribute('data-ad-status');
            if (status !== 'filled') setIsCollapsed(true);
        }, 2500);

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            window.clearTimeout(collapseTimer);
        };
    }, []);

    if (isCollapsed) return null;

    return (
        <div
            ref={adRef}
            className={`ad-container w-full overflow-hidden rounded-md transition-all duration-200 ${
                isFilled ? 'border border-white/10 bg-obsidian-900/35' : 'border border-transparent bg-transparent'
            } ${className}`}
        >
            <ins
                ref={insRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-9589831915430505"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive ? 'true' : 'false'}
            />
        </div>
    );
}

// Pre-configured ad placements
export function HeaderAd() {
    return (
        <AdBanner
            slot="4352701520"
            format="auto"
            className="min-h-[90px]"
        />
    );
}

export function SidebarAd() {
    return (
        <AdBanner
            slot="1316486406"
            format="auto"
            className="min-h-[250px]"
        />
    );
}

export function InContentAd() {
    return (
        <AdBanner
            slot="1316486406"
            format="rectangle"
            className="mx-auto max-w-[336px]"
        />
    );
}

export function FooterAd() {
    return (
        <AdBanner
            slot="8898451193"
            format="auto"
            className="min-h-[90px]"
        />
    );
}
