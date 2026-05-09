/**
 * Post-build script: generates static HTML pages for every Dota 2 hero in EN and RU.
 * - /counter/[slug]/          → English page
 * - /ru/counter/[slug]/       → Russian page
 * Each page has hreflang tags pointing to its counterpart.
 * Also regenerates sitemap.xml with all URLs.
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

// Russian hero name map — transliterated/known RU names for SEO keywords
const RU_HERO_NAMES = {
    'Anti-Mage': 'Анти-Маг', 'Axe': 'Акс', 'Bane': 'Бэйн', 'Bloodseeker': 'Кровопийца',
    'Crystal Maiden': 'Кристальная Дева', 'Drow Ranger': 'Охотница', 'Earthshaker': 'Земной Дух',
    'Juggernaut': 'Джаггернаут', 'Mirana': 'Мирана', 'Morphling': 'Морфлинг',
    'Phantom Lancer': 'Фантомный Улан', 'Puck': 'Пак', 'Pudge': 'Пудж', 'Razor': 'Резак',
    'Sand King': 'Песчаный Король', 'Shadow Fiend': 'Тёмный Призрак', 'Storm Spirit': 'Дух Бури',
    'Sven': 'Свен', 'Tiny': 'Тайни', 'Vengeful Spirit': 'Дух Мести', 'Windranger': 'Лучница',
    'Zeus': 'Зевс', 'Kunkka': 'Кункка', 'Lina': 'Лина', 'Lion': 'Лион',
    'Witch Doctor': 'Знахарь', 'Lich': 'Лич', 'Riki': 'Рики', 'Enigma': 'Энигма',
    'Tinker': 'Тинкер', 'Sniper': 'Снайпер', 'Necrophos': 'Некрофос', 'Warlock': 'Чернокнижник',
    'Beastmaster': 'Повелитель Зверей', 'Queen of Pain': 'Королева Боли', 'Venomancer': 'Веномансер',
    'Faceless Void': 'Безликий', 'Wraith King': 'Король-Призрак', 'Death Prophet': 'Пророк Смерти',
    'Phantom Assassin': 'Призрачный Убийца', 'Pugna': 'Пугна', 'Templar Assassin': 'Тамплиер',
    'Viper': 'Вайпер', 'Luna': 'Луна', 'Dragon Knight': 'Рыцарь Дракона', 'Dazzle': 'Дазл',
    'Clockwerk': 'Часовщик', 'Leshrac': 'Лешрак', "Nature's Prophet": 'Пророк', 'Lifestealer': 'Похититель Жизни',
    'Dark Seer': 'Тёмный Провидец', 'Clinkz': 'Клинкз', 'Omniknight': 'Рыцарь Омни',
    'Enchantress': 'Чаровница', 'Huskar': 'Хускар', 'Night Stalker': 'Ночной Сталкер',
    'Broodmother': 'Паучиха', 'Bounty Hunter': 'Охотник за Головами', 'Weaver': 'Ткач',
    'Jakiro': 'Джакиро', 'Batrider': 'Наездник на Летучей Мыши', 'Chen': 'Чен',
    'Spectre': 'Призрак', 'Ancient Apparition': 'Древний Призрак', 'Doom': 'Дум',
    'Ursa': 'Урса', 'Spirit Breaker': 'Сокрушитель Духа', 'Gyrocopter': 'Гирокоптер',
    'Alchemist': 'Алхимик', 'Invoker': 'Инвокер', 'Silencer': 'Молчун',
    'Outworld Devourer': 'Пожиратель Миров', 'Lycan': 'Ликан', 'Brewmaster': 'Пивовар',
    'Shadow Demon': 'Теневой Демон', 'Lone Druid': 'Одинокий Друид', 'Chaos Knight': 'Рыцарь Хаоса',
    'Meepo': 'Мипо', 'Treant Protector': 'Страж Дерево', 'Ogre Magi': 'Маг-Огр',
    'Undying': 'Неумирающий', 'Rubick': 'Рубик', 'Disruptor': 'Нарушитель',
    'Nyx Assassin': 'Убийца Никс', 'Naga Siren': 'Сирена Нага', 'Keeper of the Light': 'Хранитель Света',
    'Io': 'Ио', 'Visage': 'Визаж', 'Slark': 'Сларк', 'Medusa': 'Медуза',
    'Troll Warlord': 'Тролль', 'Centaur Warrunner': 'Кентавр', 'Magnus': 'Магнус',
    'Timbersaw': 'Лесоруб', 'Bristleback': 'Ёжик', 'Tusk': 'Бивень',
    'Skywrath Mage': 'Маг Небесного Гнева', 'Abaddon': 'Абаддон', 'Elder Titan': 'Старейший Титан',
    'Legion Commander': 'Командир Легиона', 'Techies': 'Техники', 'Ember Spirit': 'Дух Пламени',
    'Earth Spirit': 'Дух Земли', 'Underlord': 'Подземный Властелин', 'Terrorblade': 'Клинок Ужаса',
    'Phoenix': 'Феникс', 'Oracle': 'Оракул', 'Winter Wyvern': 'Зимний Виверн',
    'Arc Warden': 'Страж Дуги', 'Monkey King': 'Король Обезьян', 'Dark Willow': 'Тёмная Ива',
    'Pangolier': 'Панголир', 'Grimstroke': 'Гримстрок', 'Hoodwink': 'Простофиля',
    'Void Spirit': 'Дух Пустоты', 'Snapfire': 'Снэпфайр', 'Mars': 'Марс',
    'Dawnbreaker': 'Рассветница', 'Marci': 'Марси', 'Primal Beast': 'Первобытный Зверь',
    'Muerta': 'Муэрта', 'Ringmaster': 'Шпрехшталмейстер', 'Kez': 'Кез',
};

const heroes = JSON.parse(fs.readFileSync(HEROES_PATH, 'utf-8'));

// Build page HTML by replacing meta tags in the template
function buildPage({ title, desc, url, enUrl, ruUrl, lang }) {
    const hreflang = `
  <link rel="alternate" hreflang="en" href="${enUrl}" />
  <link rel="alternate" hreflang="ru" href="${ruUrl}" />
  <link rel="alternate" hreflang="x-default" href="${enUrl}" />`;

    return TEMPLATE
        .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`)
        .replace(/(<html\s+lang=")[^"]*(")/,                                  `$1${lang}$2`)
        .replace(/(<meta name="description"\s+content=")[^"]*(")/,            `$1${desc}$2`)
        .replace(/(<link rel="canonical"\s+href=")[^"]*(")/,                  `$1${url}$2`)
        .replace(/(<meta property="og:url"\s+content=")[^"]*(")/,             `$1${url}$2`)
        .replace(/(<meta property="og:title"\s+content=")[^"]*(")/,           `$1${title}$2`)
        .replace(/(<meta property="og:description"\s+content=")[^"]*(")/,     `$1${desc}$2`)
        .replace(/(<meta name="twitter:url"\s+content=")[^"]*(")/,            `$1${url}$2`)
        .replace(/(<meta name="twitter:title"\s+content=")[^"]*(")/,          `$1${title}$2`)
        .replace(/(<meta name="twitter:description"\s+content=")[^"]*(")/,    `$1${desc}$2`)
        .replace(/(<link rel="canonical"[^>]*>)/, `$1${hreflang}`);
}

// 404.html — catches any path GitHub Pages can't serve directly
fs.writeFileSync(path.join(DIST_PATH, '404.html'), TEMPLATE);

// Russian homepage /ru/index.html
const ruHomeHtml = TEMPLATE
    .replace(/<title>[^<]*<\/title>/, '<title>Dota 2 Контрпик | Бесплатный инструмент для драфта — Dota2Picker</title>')
    .replace(/(<html\s+lang=")[^"]*(")/,  '$1ru$2')
    .replace(/(<meta name="description"\s+content=")[^"]*(")/,  '$1Бесплатный инструмент контрпика Dota 2. Мгновенные рекомендации по героям на основе данных про-матчей. Доминируй в драфте.$2')
    .replace(/(<link rel="canonical"\s+href=")[^"]*(")/,  `$1${BASE_URL}/ru/$2`);
fs.mkdirSync(path.join(DIST_PATH, 'ru'), { recursive: true });
fs.writeFileSync(path.join(DIST_PATH, 'ru', 'index.html'), ruHomeHtml);

let generated = 0;

for (const hero of heroes) {
    const slug   = toSlug(hero.localized_name);
    const enUrl  = `${BASE_URL}/counter/${slug}/`;
    const ruUrl  = `${BASE_URL}/ru/counter/${slug}/`;
    const ruName = RU_HERO_NAMES[hero.localized_name] || hero.localized_name;

    // English page
    const enHtml = buildPage({
        lang:  'en',
        url:   enUrl,
        enUrl, ruUrl,
        title: `Counter ${hero.localized_name} | Dota 2 Picker`,
        desc:  `Best heroes to counter ${hero.localized_name} in Dota 2. Pro match win rates, item builds and draft tips — updated weekly.`,
    });
    const enDir = path.join(DIST_PATH, 'counter', slug);
    fs.mkdirSync(enDir, { recursive: true });
    fs.writeFileSync(path.join(enDir, 'index.html'), enHtml);

    // Russian page
    const ruHtml = buildPage({
        lang:  'ru',
        url:   ruUrl,
        enUrl, ruUrl,
        title: `Контрпик против ${ruName} (${hero.localized_name}) | Dota 2 Picker`,
        desc:  `Лучшие герои против ${ruName} в Dota 2. Контрпики по данным про-матчей, винрейты и советы по драфту — обновляется еженедельно.`,
    });
    const ruDir = path.join(DIST_PATH, 'ru', 'counter', slug);
    fs.mkdirSync(ruDir, { recursive: true });
    fs.writeFileSync(path.join(ruDir, 'index.html'), ruHtml);

    generated++;
}

// Sitemap with hreflang xhtml namespace
const urlEntries = heroes.map(h => {
    const slug = toSlug(h.localized_name);
    return `
  <url>
    <loc>${BASE_URL}/counter/${slug}/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/counter/${slug}/"/>
    <xhtml:link rel="alternate" hreflang="ru" href="${BASE_URL}/ru/counter/${slug}/"/>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/ru/counter/${slug}/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}/counter/${slug}/"/>
    <xhtml:link rel="alternate" hreflang="ru" href="${BASE_URL}/ru/counter/${slug}/"/>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${BASE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/ru/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>${urlEntries}
</urlset>`;

fs.writeFileSync(path.join(DIST_PATH, 'sitemap.xml'), sitemap);

console.log(`✓ Generated ${generated * 2} hero pages (${generated} EN + ${generated} RU) + sitemap.xml`);
