import { useEffect, useRef } from 'react';

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

export function AdBanner({
    slot,
    format = 'auto',
    responsive = true,
    className = ''
}: AdBannerProps) {
    const adRef = useRef<HTMLDivElement>(null);
    const isAdPushed = useRef(false);

    useEffect(() => {
        // Only push ad once per component mount
        if (!isAdPushed.current && adRef.current) {
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                isAdPushed.current = true;
            } catch (err) {
                console.error('AdSense error:', err);
            }
        }
    }, []);

    return (
        <div ref={adRef} className={`ad-container ${className}`}>
            <ins
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
            className="w-full"
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
            className="w-full"
        />
    );
}
