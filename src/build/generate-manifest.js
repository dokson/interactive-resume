const fs = require('fs');
const path = require('path');

const CONFIG = {
    outputDir: path.join(__dirname, '../../dist'),
    packageJson: path.join(__dirname, '../../package.json'),
    manifestFile: 'site.webmanifest',
};

const packageJson = require(CONFIG.packageJson);

const manifest = {
    name: `${packageJson.config.personal.name} - Interactive Resume`,
    short_name: packageJson.config.personal.shortName,
    description: packageJson.config.personal.description,
    icons: packageJson.config.manifest.icons,
    theme_color: packageJson.config.manifest.themeColor,
    background_color: packageJson.config.manifest.backgroundColor,
    display: packageJson.config.manifest.display,
    orientation: packageJson.config.manifest.orientation,
    start_url: packageJson.config.manifest.startUrl,
    scope: packageJson.config.manifest.scope,
    lang: packageJson.config.manifest.lang,
    categories: packageJson.keywords
};

console.log('🔄 Generating web manifest...');

fs.writeFileSync(path.join(CONFIG.outputDir, CONFIG.manifestFile), JSON.stringify(manifest, null, 4));

console.log(`✅ ${CONFIG.packageJson} → dist/${CONFIG.manifestFile}`);
