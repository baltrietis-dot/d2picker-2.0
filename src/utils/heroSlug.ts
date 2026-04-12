import type { Hero } from '../services/api';

// "Anti-Mage" → "anti-mage", "Nature's Prophet" → "natures-prophet"
export const toSlug = (name: string): string =>
    name.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Read slug from path like /counter/anti-mage
export const getSlugFromPath = (): string | null => {
    const match = window.location.pathname.match(/^\/counter\/([^/]+)\/?$/);
    return match ? match[1] : null;
};

// Find hero by slug
export const heroFromSlug = (slug: string, heroes: Hero[]): Hero | null =>
    heroes.find(h => toSlug(h.localized_name) === slug) ?? null;
