// Indexable pages and the date of their last significant content change: the single source for
// sitemap <lastmod> and for the dateModified/og:updated_time stamped into each page, so the two
// always agree. Only real content changes count: dependency bumps, build runs and assets that
// belong to another page don't make a page look fresher than it is (CI checks out full history).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.join(__dirname, '../..');

const pages = [
    {
        file: 'index.html',
        urlPath: '/',
        sources: [
            'index.html', 'src/js', 'src/css', 'src/json', 'image', 'font',
            ':(exclude)src/css/about.css', ':(exclude)src/css/404.css', ':(exclude)src/js/404.js', ':(exclude)image/logos'
        ]
    },
    { file: 'about.html', urlPath: '/about.html', sources: ['about.html'] }
];

// Full ISO 8601 datetime with offset (git %cI): structured-data validators reject a bare date in dateModified.
function lastContentChange(page) {
    try {
        const date = execFileSync('git', ['log', '-1', '--format=%cI', '--', ...page.sources], { cwd: repoRoot, encoding: 'utf8' }).trim();
        if (date) return date;
    } catch {
        // not a git checkout: fall back to the file's mtime
    }
    return fs.statSync(path.join(repoRoot, page.file)).mtime.toISOString();
}

function findPage(file) {
    return pages.find(page => page.file === file);
}

module.exports = { pages, lastContentChange, findPage };
