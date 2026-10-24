const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const packageJson = require(path.join(__dirname, '../../package.json'));

// Cloudflare serves static files with a one-month browser cache, the HTML with ten minutes. Unversioned
// asset URLs left phones running last month's JS and CSS under the new HTML. Every reference to a dist/
// file in the built pages gets ?v=<content hash>: a deploy that changes a file changes its URL.
// Runs last: jquery.min.js, site.webmanifest and logos.svg are generated after the HTML is minified.

console.log('🔄 Versioning asset URLs...');

try {
    const rootDir = path.join(__dirname, '../..');
    const outputDir = packageJson.config.build.outputDir;
    const distDir = path.join(rootDir, outputDir);
    // `dist/x` (index, about) and `/dist/x` (404, absolute); a #fragment (logos.svg#name) stays after the query.
    const assetReference = new RegExp(`(?<=["'=\\s(])(/?${outputDir}/[\\w./-]+)(?!\\?v=)`, 'g');
    const hashes = new Map();

    const hashOf = (file) => {
        if (!hashes.has(file)) {
            const content = fs.readFileSync(file);
            hashes.set(file, crypto.createHash('sha256').update(content).digest('hex').slice(0, 10));
        }
        return hashes.get(file);
    };

    for (const page of fs.readdirSync(distDir).filter((file) => file.endsWith('.html'))) {
        const pagePath = path.join(distDir, page);
        let versioned = 0;
        const html = fs.readFileSync(pagePath, 'utf8').replace(assetReference, (reference) => {
            const file = path.join(rootDir, reference.replace(/^\//, ''));
            if (!fs.existsSync(file)) return reference;
            versioned++;
            return `${reference}?v=${hashOf(file)}`;
        });
        fs.writeFileSync(pagePath, html, 'utf8');
        console.log(`✅ ${outputDir}/${page}: ${versioned} asset URLs versioned`);
    }
} catch (error) {
    console.error('❌ Error versioning asset URLs:', error);
    process.exit(1);
}
