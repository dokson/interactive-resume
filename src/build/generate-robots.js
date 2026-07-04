const fs = require('fs');
const path = require('path');

const packageJson = require(path.join(__dirname, '../../package.json'));
const { buildReplacements, applyReplacements } = require('./placeholders');

console.log('🔄 Generating robots.txt...');

try {
    const rootDir = path.join(__dirname, '../..');
    const templatePath = path.join(rootDir, 'robots.txt');
    const distDir = path.join(rootDir, packageJson.config.build.outputDir);
    const outputPath = path.join(distDir, 'robots.txt');

    const template = fs.readFileSync(templatePath, 'utf8');
    const output = applyReplacements(template, buildReplacements(packageJson));

    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`✅ dist/robots.txt generated successfully!`);
} catch (error) {
    console.error('❌ Error generating robots.txt:', error);
    process.exit(1);
}
