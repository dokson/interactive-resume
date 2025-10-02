const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../../');
const packageJson = require(path.join(rootDir, 'package.json'));

const libsDir = path.join(rootDir, packageJson.config.build.libsDir);
const emailJsDir = path.join(rootDir, 'node_modules', '@emailjs', 'browser', 'dist');
const outputDir = path.join(rootDir, packageJson.config.build.outputDir);

console.log('🔄 Copy external libs...');

fs.readdirSync(libsDir).forEach(file => {
    try {
        const srcPath = path.join(libsDir, file);
        const destPath = path.join(outputDir, file);
        fs.copyFileSync(srcPath, destPath);
        console.log(`✅ Copied ${file} to ${outputDir}`);
    } catch (error) {
        console.error(`❌ Error copying ${file} from libsDir: ${error.message}`);
        process.exit(1);
    }
});

try {
    emailJsLibFile = 'email.min.js'
    const emailjsSrcPath = path.join(emailJsDir, emailJsLibFile);
    const emailjsDestPath = path.join(outputDir, emailJsLibFile);

    fs.copyFileSync(emailjsSrcPath, emailjsDestPath);
    console.log(`✅ Copied ${emailJsLibFile} from node_modules to ${outputDir}`);
} catch (error) {
    console.error(`❌ Error copying email.min.js from node_modules: ${error.message}`);
    process.exit(1);
}
