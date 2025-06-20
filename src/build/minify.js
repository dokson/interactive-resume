const fs = require('fs');
const path = require('path');

const packageJson = require(path.join(__dirname, '../../package.json'));

const uglifyJS = require('uglify-js');
const CleanCSS = require('clean-css');

console.log('🔄 JavaScript minification...');

fs.readdirSync(packageJson.config.build.jsDir).forEach(file => {
    const inputFile = path.join(packageJson.config.build.jsDir, file);
    const outputFile = path.join(packageJson.config.build.outputDir, `${file.replace('.js', '.min.js')}`);
    try {
        const jsCode = fs.readFileSync(inputFile, 'utf8');
        const result = uglifyJS.minify(jsCode, { compress: true, mangle: true, sourceMap: false });

        if (result.error) {
            console.error(`❌ Minification error for ${file}:`, result.error);
            process.exit(1);
        }

        fs.writeFileSync(outputFile, result.code);
        console.log(`✅ ${file} → ${path.basename(outputFile)}`);
    } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
        process.exit(1);
    }
});

console.log('🔄 CSS minification...');

fs.readdirSync(packageJson.config.build.cssDir).forEach(file => {
    const inputFile = path.join(packageJson.config.build.cssDir, file);
    const outputFile = path.join(packageJson.config.build.outputDir, `${file.replace('.css', '.min.css')}`);
    try {
        const cssFile = fs.readFileSync(inputFile, 'utf8');
        const cleanCSS = new CleanCSS({ level: 2, returnPromise: false });

        const result = cleanCSS.minify(cssFile);

        if (result.errors.length > 0) {
            console.error(`❌ CSS minification error for ${packageJson.config.build.cssFile}:`, result.errors);
            process.exit(1);
        }

        fs.writeFileSync(outputFile, result.styles);
        console.log(`✅ ${file} → ${path.basename(outputFile)}`);
    } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
        process.exit(1);
    }
});
