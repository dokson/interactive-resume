const { test, expect } = require('@playwright/test');

const ANIMATION_SETTLE_MS = 2000;
const SCROLL_SETTLE_MS = 500;

async function waitForSiteReady(page) {
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(ANIMATION_SETTLE_MS);
}

async function disableAnimations(page) {
    await page.addStyleTag({
        content: `
            *, *::before, *::after {
                animation-duration: 0s !important;
                animation-delay: 0s !important;
                transition-duration: 0s !important;
                transition-delay: 0s !important;
            }
        `,
    });
}

async function scrollToPercent(page, percent) {
    await page.evaluate((pct) => {
        var maxScroll = document.getElementById('page').offsetHeight - window.innerHeight;
        window.scrollTo(0, maxScroll * pct / 100);
    }, percent);
    await page.waitForTimeout(SCROLL_SETTLE_MS);
}

// Scroll positions mapped to approximate site sections.
// These percentages target the midpoint of each visual section
// based on the horizontal layer layout.
const sections = [
    { name: '01-splash',      percent: 0 },
    { name: '02-about-plants', percent: 8 },
    { name: '03-about-buildings', percent: 15 },
    { name: '04-experience-1', percent: 25 },
    { name: '05-sea-entry',    percent: 35 },
    { name: '06-skills-fish',  percent: 42 },
    { name: '07-skills-crabs', percent: 50 },
    { name: '08-experience-2', percent: 58 },
    { name: '09-experience-3', percent: 68 },
    { name: '10-about-buildings-2', percent: 78 },
    { name: '11-vertical-section', percent: 88 },
    { name: '12-contact',      percent: 100 },
];

test.describe('Visual Regression', () => {
    test('00-preloader', async ({ page }) => {
        // Block a JS file to keep preloader visible
        await page.route('**/state.min.js', route => route.abort());
        await page.goto('/index.html');
        await page.waitForSelector('#preloader', { state: 'visible' });
        await page.waitForTimeout(500);
        await expect(page).toHaveScreenshot('00-preloader.png');
    });

    test.describe('Sections', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/index.html');
            await waitForSiteReady(page);
            await disableAnimations(page);
        });

        for (const section of sections) {
            test(`section ${section.name}`, async ({ page }) => {
                await scrollToPercent(page, section.percent);
                await expect(page).toHaveScreenshot(`${section.name}.png`);
            });
        }
    });
});
