import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const heroes = JSON.parse(fs.readFileSync(path.join(root, 'src/data/heroes.json'), 'utf8'));
const heroPositionsText = fs.readFileSync(path.join(root, 'src/data/heroPositions.ts'), 'utf8');
const quiet = process.argv.includes('--quiet');

const allowedRoles = new Set(['Carry', 'Mid', 'Offlane', 'SoftSupport', 'HardSupport']);
const heroesById = new Map(heroes.map(hero => [hero.id, hero]));
const entries = new Map();
const errors = [];

const normalize = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '');

for (const [index, line] of heroPositionsText.split(/\r?\n/).entries()) {
    const match = line.match(/^\s*(\d+):\s*\[([^\]]*)\],\s*\/\/\s*(.+)$/);
    if (!match) continue;

    const id = Number(match[1]);
    const roles = [...match[2].matchAll(/'([^']+)'/g)].map(roleMatch => roleMatch[1]);
    const comment = match[3].trim();
    const lineNumber = index + 1;

    if (entries.has(id)) {
        errors.push(`Duplicate mapping for hero id ${id} at lines ${entries.get(id).lineNumber} and ${lineNumber}`);
        continue;
    }

    const hero = heroesById.get(id);
    if (!hero) {
        errors.push(`Unknown hero id ${id} at line ${lineNumber}`);
    } else {
        const commentName = comment.replace(/\(.+?\)/g, '').split('/')[0].trim();
        if (!normalize(commentName).includes(normalize(hero.localized_name)) && !normalize(hero.localized_name).includes(normalize(commentName))) {
            errors.push(`Comment mismatch for id ${id} at line ${lineNumber}: expected ${hero.localized_name}, found "${comment}"`);
        }
    }

    for (const role of roles) {
        if (!allowedRoles.has(role)) {
            errors.push(`Invalid role "${role}" for hero id ${id} at line ${lineNumber}`);
        }
    }

    if (roles.length === 0) {
        errors.push(`Empty role list for hero id ${id} at line ${lineNumber}`);
    }

    entries.set(id, { roles, comment, lineNumber });
}

const fallbackRoles = hero => {
    const positions = [];
    const apiRoles = hero.roles;
    const isUniversal = hero.primary_attr === 'all' || hero.primary_attr === 'universal';

    if (apiRoles.includes('Carry')) positions.push('Carry');

    if (apiRoles.includes('Support')) {
        const leansHardSupport = apiRoles.includes('Disabler') && !apiRoles.includes('Escape');
        positions.push(...(leansHardSupport ? ['HardSupport', 'SoftSupport'] : ['SoftSupport', 'HardSupport']));
    }

    if (apiRoles.includes('Nuker') && (hero.primary_attr === 'int' || isUniversal)) positions.push('Mid');
    if (apiRoles.includes('Initiator') && (hero.primary_attr === 'str' || isUniversal)) positions.push('Offlane');

    return positions.length > 0 ? [...new Set(positions)] : ['SoftSupport', 'HardSupport'];
};

const rows = [...heroes].sort((a, b) => a.id - b.id).map(hero => {
    const entry = entries.get(hero.id);
    const roles = entry?.roles ?? fallbackRoles(hero);
    const source = entry ? 'manual' : 'fallback';

    if (roles.length === 0) {
        errors.push(`No roles resolved for ${hero.localized_name} (${hero.id})`);
    }

    return {
        id: hero.id,
        name: hero.localized_name,
        roles,
        source,
    };
});

if (!quiet) {
    for (const row of rows) {
        console.log(`${String(row.id).padStart(3)}  ${row.name.padEnd(22)} ${row.roles.join(', ').padEnd(34)} (${row.source})`);
    }
}

if (errors.length > 0) {
    console.error('\nRole audit failed:');
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exitCode = 1;
} else {
    console.log(`\nRole audit passed: ${rows.length} heroes, ${entries.size} manual mappings.`);
}
