const fs = require('fs').promises;
const path = require('path');

const packageJson = require(path.join(__dirname, '../../package.json'));
const { buildReplacements, applyReplacements } = require('./placeholders');

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

        const resolvedSeoMeta = applyReplacements(seoMeta, buildReplacements(packageJson));

        let parsedSeoMeta;
        try {
            parsedSeoMeta = JSON.parse(resolvedSeoMeta);
        } catch (jsonError) {
            throw new Error(`Invalid JSON-LD in ${seoMetaPath}: ${jsonError.message}`);
        }

        // Full ISO 8601 datetime with timezone; a bare date fails dateModified validation.
        const buildTimestamp = new Date().toISOString();
        const profilePage = (parsedSeoMeta['@graph'] || []).find(node => node['@type'] === 'ProfilePage');
        if (profilePage) {
            profilePage.dateModified = buildTimestamp;
        }

        const indentedSeoMeta = JSON.stringify(parsedSeoMeta, null, 4)
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
