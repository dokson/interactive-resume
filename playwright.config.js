const { defineConfig } = require('@playwright/test');

// Touch layouts (src/js/viewport.js): a mid-range Android phone held both ways. Only the visual
// regression runs on them; the touch behaviour tests live in game.spec.js.
const androidPhone = {
    browserName: 'chromium',
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-A556B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
};

module.exports = defineConfig({
    testDir: './tests',
    timeout: 30000,
    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.01,
        },
    },
    use: {
        baseURL: 'http://localhost:3000',
        viewport: { width: 1280, height: 720 },
        launchOptions: {
            args: ['--font-render-hinting=none'],
        },
    },
    projects: [
        { name: 'chromium', use: { browserName: 'chromium' } },
        { name: 'mobile-portrait', testMatch: /visual-regression/, use: { ...androidPhone, viewport: { width: 360, height: 800 } } },
        { name: 'mobile-landscape', testMatch: /visual-regression/, use: { ...androidPhone, viewport: { width: 800, height: 360 } } },
    ],
    webServer: {
        command: 'npx serve . -l 3000 -s',
        port: 3000,
        reuseExistingServer: true,
    },
});
