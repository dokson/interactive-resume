const fs = require('fs');
const uglifyJS = require('uglify-js');
const CleanCSS = require('clean-css');
const path = require('path');

const CONFIG = {
    outputDir: path.join(__dirname, '../../dist'),
    jsDir: path.join(__dirname, '../js'),
    cssDir: path.join(__dirname, '../css'),
    cssFile: 'style.css'
};

// JS
fs.readdirSync(CONFIG.jsDir).forEach(file => {
    const inputFile = path.join(CONFIG.jsDir, file);
    const outputFile = path.join(CONFIG.outputDir, `${file.replace('.js', '.min.js')}`);

    const jsCode = fs.readFileSync(inputFile, 'utf8');
    const result = uglifyJS.minify(jsCode, { compress: true, mangle: true });

    if (result.error) {
        console.error(`Minification error for ${file}:`, result.error);
        process.exit(1);
    }

    fs.writeFileSync(outputFile, result.code);
    console.log(`✅ ${file} minified to ${outputFile}`);
});

// CSS
const cssInputFile = path.join(CONFIG.cssDir, CONFIG.cssFile);
const cssOutputFile = path.join(CONFIG.outputDir, CONFIG.cssFile.replace('.css', '.min.css'));

if (fs.existsSync(cssInputFile)) {
    const cssFile = fs.readFileSync(cssInputFile, 'utf8');
    const cleanCSS = new CleanCSS({ level: 2 });

    const result = cleanCSS.minify(cssFile);

    if (result.errors.length > 0) {
        console.error(`CSS minification error for ${CONFIG.cssFile}:`, result.errors);
        process.exit(1);
    }

    fs.writeFileSync(cssOutputFile, result.styles);
    console.log(`✅ ${CONFIG.cssFile} minified to ${cssOutputFile}`);
} else {
    console.warn(`Warning: ${cssInputFile} not found`);
}