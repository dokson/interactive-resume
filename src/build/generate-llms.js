const fs = require('fs');
const path = require('path');

const packageJson = require(path.join(__dirname, '../../package.json'));
const { buildReplacements, applyReplacements } = require('./placeholders');

console.log('🔄 Generating llms.txt...');

try {
    const rootDir = path.join(__dirname, '../..');
    const templatePath = path.join(rootDir, 'llms.txt');
    const distDir = path.join(rootDir, packageJson.config.build.outputDir);
    const outputPath = path.join(distDir, 'llms.txt');

    const template = fs.readFileSync(templatePath, 'utf8');
    const output = applyReplacements(template, buildReplacements(packageJson));

    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`✅ dist/llms.txt generated successfully!`);
} catch (error) {
    console.error('❌ Error generating llms.txt:', error);
    process.exit(1);
}
