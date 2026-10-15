// Builds dist/logos.svg: one <symbol id="NAME"> per pinned mark in image/logos/NAME.svg.
// The about page draws each tech chip's mark with <use href="dist/logos.svg#NAME">, so the
// whole stack costs one cached request. Symbols are addressed by name, never by position,
// so adding a mark cannot shift another chip onto the wrong logo.
const fs = require('fs');
const path = require('path');

const packageJson = require(path.join(__dirname, '../../package.json'));

console.log('🔄 Generating logo sprite...');

try {
    const rootDir = path.join(__dirname, '../..');
    const logosDir = path.join(rootDir, 'image/logos');
    const distDir = path.join(rootDir, packageJson.config.build.outputDir);
    const outputPath = path.join(distDir, 'logos.svg');

    const symbols = fs.readdirSync(logosDir)
        .filter(file => file.endsWith('.svg'))
        .map(file => {
            const svg = fs.readFileSync(path.join(logosDir, file), 'utf8');
            const openTag = svg.match(/<svg[^>]*>/)?.[0];
            const viewBox = openTag?.match(/viewBox="([^"]+)"/)?.[1];
            const body = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/)?.[1];
            if (!viewBox || body === undefined) {
                throw new Error(`${file}: no viewBox or <svg> body`);
            }
            // Presentation attributes on the root (e.g. sql.svg is drawn with fill="none" and a
            // stroke) move onto a <g>: dropping them would paint a stroked mark as a filled blob.
            const presentation = [...openTag.matchAll(/\s([\w-]+)="([^"]*)"/g)]
                .filter(([, name]) => !['viewBox', 'xmlns', 'role', 'width', 'height'].includes(name))
                .map(([, name, value]) => ` ${name}="${value === '#000' ? 'currentColor' : value}"`)
                .join('');
            const content = body.replace(/<title>[\s\S]*?<\/title>/g, '').trim();
            const inner = presentation ? `<g${presentation}>${content}</g>` : content;
            return `<symbol id="${path.basename(file, '.svg')}" viewBox="${viewBox}">${inner}</symbol>`;
        });

    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, `<svg xmlns="http://www.w3.org/2000/svg">${symbols.join('')}</svg>`, 'utf8');
    console.log(`✅ dist/logos.svg generated with ${symbols.length} marks`);
} catch (error) {
    console.error('❌ Error generating logo sprite:', error);
    process.exit(1);
}
