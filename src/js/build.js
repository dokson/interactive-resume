const fs = require('fs');
const uglifyJS = require('uglify-js');
const CleanCSS = require('clean-css');
const path = require('path');

const inputDir = __dirname;
const outputDir = path.join(__dirname, '../../dist');

//Minify all JS files (except build.js)
fs.readdirSync(inputDir).forEach(file => {
    // Process only .js files, excluding build.js
    if (file.endsWith('.js') && file !== 'build.js') {
        const inputFile = path.join(inputDir, file);
        const outputFile = path.join(outputDir, `${file.replace('.js', '.min.js')}`);

        // Read file
        const code = fs.readFileSync(inputFile, 'utf8');

        // Minification
        const result = uglifyJS.minify(code, { compress: true, mangle: true });

        if (result.error) {
            console.error(`Minification error for ${file}:`, result.error);
            process.exit(1);
        }

        // Write minified file
        fs.writeFileSync(outputFile, result.code);
        console.log(`${file} minified to ${outputFile}`);
    }
});

// CSS
const cssInputFile = path.join(__dirname, '../css/style.css');
const cssOutputFile = path.join(__dirname, '../../dist/style.min.css');

if (fs.existsSync(cssInputFile)) {
    // Read file
    const cssFile = fs.readFileSync(cssInputFile, 'utf8');

    // Aggressive minification
    const cleanCSS = new CleanCSS({ level: 2 });
    const result = cleanCSS.minify(cssFile);

    if (result.errors.length > 0) {
        console.error(`CSS minification error for style.css:`, result.errors);
        process.exit(1);
    }

    fs.writeFileSync(cssOutputFile, result.styles);
    console.log(`${cssInputFile} minified to ${cssOutputFile}`);
} else {
    console.warn(`Warning: ${cssInputFile} not found`);
}