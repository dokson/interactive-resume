const fs = require('fs');
const path = require('path');

console.log('🗺️ Generating sitemap.xml...');

try {
    const config = require('../../package.json');
    const homepage = config.homepage || 'https://www.colace.me';

    // Definiamo le pagine pubbliche e le loro priorità
    const pages = [
        { file: 'index.html', urlPath: '/', priority: '1.00', changefreq: 'monthly' },
        { file: 'cv.html', urlPath: '/cv.html', priority: '0.80', changefreq: 'yearly' }
    ];

    // Otteniamo la data odierna in formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const page of pages) {
        const filePath = path.join(__dirname, '../../', page.file);
        // Aggiungiamo il blocco url solo se il file fisico esiste
        if (fs.existsSync(filePath)) {
            let loc = homepage + page.urlPath;
            // Evita doppi slash nel dominio (es: https://www.colace.me//cv.html)
            loc = loc.replace(/([^:]\/)\/+/g, "$1");

            sitemapContent += `
  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
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
