const fs = require('fs');
const path = require('path');

const packageJson = require(path.join(__dirname, '../../package.json'));

function getShortName(fullName) {
    if (!fullName || typeof fullName !== 'string') return '';

    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return '';

    const firstInitial = parts[0][0];
    const lastName = parts.length > 1 ? parts[parts.length - 1] : '';

    return `${firstInitial}. ${lastName}`;
}

const manifest = {
    name: `${packageJson.author} - ${packageJson.description}`,
    short_name: getShortName(packageJson.author),
    description: `${packageJson.description} of ${packageJson.author} | ${packageJson.job_title} - based on ${packageJson.based_on}`,
    icons: packageJson.config.manifest.icons,
    theme_color: packageJson.config.manifest.themeColor,
    background_color: packageJson.config.manifest.backgroundColor,
    display: packageJson.config.manifest.display,
    orientation: packageJson.config.manifest.orientation,
    start_url: packageJson.name + '/',
    scope: packageJson.name + '/',
    lang: packageJson.config.manifest.lang,
    categories: packageJson.config.manifest.keywords
};

console.log('🔄 Generating web manifest...');

fs.writeFileSync(path.join(packageJson.config.build.outputDir, packageJson.config.build.manifestFile), JSON.stringify(manifest, null, 4));

console.log(`✅ Created ${packageJson.config.build.manifestFile}`);
