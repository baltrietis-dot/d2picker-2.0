/**
 * Post-build script: generates a static HTML page for every Dota 2 hero.
 * Each page has unique SEO meta tags and loads the same React bundle.
 * Also regenerates sitemap.xml with all hero URLs.
 * Run automatically after `vite build` via the build script in package.json.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HEROES_PATH = path.join(__dirname, '../src/data/heroes.json');
const DIST_PATH   = path.join(__dirname, '../dist');
const TEMPLATE    = fs.readFileSync(path.join(DIST_PATH, 'index.html'), 'utf-8');
const BASE_URL    = 'https://dota2picker.com';

const toSlug = (name) =>
    name.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const heroes = JSON.parse(fs.readFileSync(HEROES_PATH, 'utf-8'));

// 404.html — catches any path GitHub Pages can't serve directly
fs.writeFileSync(path.join(DIST_PATH, '404.html'), TEMPLATE);

let generated = 0;

for (const hero of heroes) {
    const slug  = toSlug(hero.localized_name);
    const url   = `${BASE_URL}/counter/${slug}`;
    const title = `Counter ${hero.localized_name} | Dota 2 Picker`;
    const desc  = `Best heroes to counter ${hero.localized_name} in Dota 2. Pro match win rates, item builds and draft tips — updated weekly.`;

    const html = TEMPLATE
        .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
        .replace(/(<meta name="description"\s+content=")[^"]*(")/,   `$1${desc}$2`)
        .replace(/(<link rel="canonical"\s+href=")[^"]*(")/,          `$1${url}$2`)
        .replace(/(<meta property="og:url"\s+content=")[^"]*(")/,     `$1${url}$2`)
        .replace(/(<meta property="og:title"\s+content=")[^"]*(")/,   `$1${title}$2`)
        .replace(/(<meta property="og:description"\s+content=")[^"]*(")/,`$1${desc}$2`)
        .replace(/(<meta name="twitter:url"\s+content=")[^"]*(")/,    `$1${url}$2`)
        .replace(/(<meta name="twitter:title"\s+content=")[^"]*(")/,  `$1${title}$2`)
        .replace(/(<meta name="twitter:description"\s+content=")[^"]*(")/,`$1${desc}$2`);

    const dir = path.join(DIST_PATH, 'counter', slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    generated++;
}

// Sitemap
const heroUrls = heroes.map(h => `
  <url>
    <loc>${BASE_URL}/counter/${toSlug(h.localized_name)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>${heroUrls}
</urlset>`;

fs.writeFileSync(path.join(DIST_PATH, 'sitemap.xml'), sitemap);

console.log(`✓ Generated ${generated} hero pages + sitemap.xml`);
