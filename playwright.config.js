const { defineConfig } = require('@playwright/test');

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
    ],
    webServer: {
        command: 'npx serve . -l 3000 -s',
        port: 3000,
        reuseExistingServer: true,
    },
});
