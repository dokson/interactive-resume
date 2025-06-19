const fs = require('fs');
const path = require('path');

const packageJson = require(path.join(__dirname, '../../package.json'));

console.log('🔄 Copy external libs...');

fs.readdirSync(packageJson.config.build.libsDir).forEach(file => {
    try {
        const srcPath = path.join(packageJson.config.build.libsDir, file);
        const destPath = path.join(packageJson.config.build.outputDir, file);
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied to ${destPath}`);
    } catch (error) {
        console.error(`❌ Error copying ${file}: ${error.message}`);
        process.exit(1);
    }
});
