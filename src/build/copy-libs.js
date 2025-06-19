const fs = require('fs');
const path = require('path');

const CONFIG = {
    outputDir: path.join(__dirname, '../../dist'),
    libsDir: path.join(__dirname, '../../src/libs')
};

console.log('🔄 Copy external libs...');

fs.readdirSync(CONFIG.libsDir).forEach(file => {
    try {
        const srcPath = path.join(CONFIG.libsDir, file);
        const destPath = path.join(CONFIG.outputDir, file);
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied to ${destPath}`);
    } catch (error) {
        console.error(`❌ Error copying ${file}: ${error.message}`);
        process.exit(1);
    }
});
