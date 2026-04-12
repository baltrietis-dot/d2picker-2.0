/**
 * One-time keystore setup script for the Dota 2 Picker Android build.
 * Run with:  node scripts/setup-keystore.mjs
 *
 * What it does:
 *  1. Generates android.keystore (PKCS12) in the project root
 *  2. Prints the SHA-256 certificate fingerprint → paste into assetlinks.json
 *  3. Prints the base64-encoded keystore   → add as KEYSTORE_BASE64 GitHub Secret
 *
 * Requires Java (keytool) to be installed.
 * Install on Windows:  winget install Microsoft.OpenJDK.17
 * Install on Linux:    sudo apt install openjdk-17-jdk
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const KEYSTORE = path.join(ROOT, 'android.keystore');
const ALIAS = 'dota2picker';
const VALIDITY = 10000; // days (~27 years)

if (existsSync(KEYSTORE)) {
    console.log('⚠️  android.keystore already exists — skipping generation.');
    console.log('   Delete it first if you want to regenerate.\n');
} else {
    console.log('🔑 Generating android.keystore...\n');

    // Prompt for passwords (hardcoded defaults for dev — change before release)
    const storePass = process.env.STORE_PASS || 'dota2picker2024';
    const keyPass   = process.env.KEY_PASS   || 'dota2picker2024';

    execSync(
        `keytool -genkeypair` +
        ` -keystore "${KEYSTORE}"` +
        ` -alias ${ALIAS}` +
        ` -keyalg RSA -keysize 2048` +
        ` -validity ${VALIDITY}` +
        ` -storepass "${storePass}"` +
        ` -keypass "${keyPass}"` +
        ` -storetype PKCS12` +
        ` -dname "CN=Dota2Picker, OU=App, O=Dota2Picker, L=London, ST=England, C=GB"`,
        { stdio: 'inherit' }
    );

    console.log('\n✅ Keystore generated.\n');
}

// --- Print SHA-256 fingerprint ---
const storePass = process.env.STORE_PASS || 'dota2picker2024';

console.log('🔍 Certificate SHA-256 fingerprint:');
const fingerprint = execSync(
    `keytool -list -v -keystore "${KEYSTORE}" -alias ${ALIAS} -storepass "${storePass}"`,
    { encoding: 'utf-8' }
)
.split('\n')
.find(l => l.includes('SHA256:'))
?.replace(/.*SHA256:\s*/, '')
.trim();

if (!fingerprint) {
    console.error('❌ Could not extract SHA-256. Check your keystore and password.');
    process.exit(1);
}

console.log(`\n  ${fingerprint}\n`);
console.log('👉 Paste this into:  public/.well-known/assetlinks.json\n');

// --- Print base64 keystore ---
const b64 = readFileSync(KEYSTORE).toString('base64');
console.log('━'.repeat(70));
console.log('📋 Add these 4 values as GitHub Actions Secrets:');
console.log('   (Settings → Secrets and variables → Actions → New repository secret)');
console.log('━'.repeat(70));
console.log('\nSecret name:   KEYSTORE_BASE64');
console.log('Secret value:');
console.log(b64);
console.log('\nSecret name:   KEY_ALIAS');
console.log(`Secret value:  ${ALIAS}`);
console.log('\nSecret name:   KEY_PASSWORD');
console.log(`Secret value:  ${process.env.KEY_PASS || 'dota2picker2024'}`);
console.log('\nSecret name:   STORE_PASSWORD');
console.log(`Secret value:  ${process.env.STORE_PASS || 'dota2picker2024'}`);
console.log('\n' + '━'.repeat(70));
console.log('✅ Once secrets are added, push a tag to trigger the build:');
console.log('   git tag v1.0.0 && git push origin v1.0.0');
console.log('━'.repeat(70) + '\n');
