const fs = require('fs').promises;
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');
const distDir = path.join(rootDir, 'dist');

const indexTemplatePath = path.join(rootDir, 'index.html');
const seoMetaPath = path.join(rootDir, 'src', 'json', 'seo-meta.json');
const finalIndexPath = path.join(distDir, 'index.html');

async function injectJsonLd() {
    console.log(`🔄 Injecting JSON-LD into index.html...`);

    try {
        const [indexTemplate, seoMeta] = await Promise.all([
            fs.readFile(indexTemplatePath, 'utf8'),
            fs.readFile(seoMetaPath, 'utf8'),
        ]);

        try {
            JSON.parse(seoMeta)
        } catch (jsonError) {
            throw new Error(`Invalid JSON-LD in ${seoMetaPath}: ${jsonError.message}`);
        }

        const indentedSeoMeta = JSON.stringify(JSON.parse(seoMeta), null, 4)
            .split('\n')
            .map(line => `    ${line}`)
            .join('\n');

        const finalHtml = indexTemplate.replace(
            '</head>',
            `    <script type="application/ld+json">\n${indentedSeoMeta}\n    </script>\n</head>`
        );

        await fs.mkdir(distDir, { recursive: true });

        await fs.writeFile(finalIndexPath, finalHtml, 'utf8');

        console.log(`✅ Successfully created ${finalIndexPath}`);
    } catch (error) {
        console.error(`❌ Error during JSON-LD injection:`, error.message);
        process.exit(1);
    }
}

injectJsonLd();
