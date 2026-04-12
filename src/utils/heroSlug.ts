import type { Hero } from '../services/api';

// "Anti-Mage" → "anti-mage", "Nature's Prophet" → "natures-prophet"
export const toSlug = (name: string): string =>
    name.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Read slug and language from path like /counter/anti-mage or /ru/counter/anti-mage
export const getSlugFromPath = (): { slug: string; lang: 'en' | 'ru' } | null => {
    const enMatch = window.location.pathname.match(/^\/counter\/([^/]+)\/?$/);
    if (enMatch) return { slug: enMatch[1], lang: 'en' };

    const ruMatch = window.location.pathname.match(/^\/ru\/counter\/([^/]+)\/?$/);
    if (ruMatch) return { slug: ruMatch[1], lang: 'ru' };

    return null;
};

// Find hero by slug
export const heroFromSlug = (slug: string, heroes: Hero[]): Hero | null =>
    heroes.find(h => toSlug(h.localized_name) === slug) ?? null;
