const fs = require('fs');
const path = require('path');

console.log('🗺️ Generating sitemap.xml...');

try {
    const config = require('../../package.json');
    const homepage = config.homepage || 'https://www.colace.me';

    // Define public indexable pages
    const pages = [
        { file: 'index.html', urlPath: '/' },
        { file: 'about.html', urlPath: '/about.html' }
    ];

    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of pages) {
        const filePath = path.join(__dirname, '../../', page.file);
        // Only include the url block if the physical file exists
        if (fs.existsSync(filePath)) {
            let loc = homepage + page.urlPath;
            // Avoid double slashes in the domain (e.g. https://www.colace.me//index.html)
            loc = loc.replace(/([^:]\/)\/+/g, "$1");
            const lastmod = fs.statSync(filePath).mtime.toISOString().split('T')[0];

            sitemapContent += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>\n`;
        }
    }

    sitemapContent += `\n</urlset>\n`;

    const distDir = path.join(__dirname, '../../dist');
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }

    const outputPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemapContent, 'utf8');

    console.log('✅ dist/sitemap.xml generated successfully!');
} catch (error) {
    console.error('❌ Error generating sitemap.xml:', error);
    process.exit(1);
}
