const fs = require('fs');
const path = require('path');

const packageJson = require(path.join(__dirname, '../../package.json'));

const uglifyJS = require('uglify-js');
const CleanCSS = require('clean-css');
const { minify: minifyHTML } = require('html-minifier-terser');

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
        const saved = (((jsCode.length - result.code.length) / jsCode.length) * 100).toFixed(1);
        console.log(`✅ ${file} → ${path.basename(outputFile)} (−${saved}%)`);
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
        const saved = (((cssFile.length - result.styles.length) / cssFile.length) * 100).toFixed(1);
        console.log(`✅ ${file} → ${path.basename(outputFile)} (−${saved}%)`);
    } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
        process.exit(1);
    }
});

console.log('🔄 HTML minification...');

const rootDir = path.resolve(__dirname, '../..');
const distDir = path.join(rootDir, packageJson.config.build.outputDir);

// index.html is already in dist/ after SEO injection — we minify it in-place
// cv.html and 404.html are copied from the root and minified into dist/
const htmlFiles = [
    { input: path.join(distDir, 'index.html'), output: path.join(distDir, 'index.html') },
    { input: path.join(rootDir, 'cv.html'), output: path.join(distDir, 'cv.html') },
    { input: path.join(rootDir, '404.html'), output: path.join(distDir, '404.html') }
];

const htmlMinifyOptions = {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeEmptyAttributes: true,
    minifyCSS: true,
    minifyJS: true,
    useShortDoctype: true
};

(async () => {
    for (const { input, output } of htmlFiles) {
        if (!fs.existsSync(input)) {
            console.warn(`⚠️  Skipped (not found): ${input}`);
            continue;
        }
        try {
            const source = fs.readFileSync(input, 'utf8');
            const minified = await minifyHTML(source, htmlMinifyOptions);
            fs.writeFileSync(output, minified, 'utf8');
            const saved = (((source.length - minified.length) / source.length) * 100).toFixed(1);
            console.log(`✅ ${path.basename(input)} → dist/${path.basename(output)} (−${saved}%)`);
        } catch (error) {
            console.error(`❌ Error minifying ${input}:`, error.message);
            process.exit(1);
        }
    }
})();
