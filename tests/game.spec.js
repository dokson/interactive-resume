const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

async function waitForRunPrompt(page) {
    await page.goto('/index.html');
    await page.waitForSelector('#preloader.c64-waiting');
}

async function enterGame(page) {
    await waitForRunPrompt(page);
    await page.mouse.click(10, 10);
    await page.waitForSelector('#preloader', { state: 'hidden' });
    await page.waitForFunction(() => flags.preloadShiftUpDone);
}

async function scrollTo(page, position) {
    await page.evaluate((y) => window.scrollTo(0, y), position);
    await page.waitForFunction((y) => scrollState.position === y, position);
}

const maxScroll = (page) => page.evaluate(() => pageDiv.offsetHeight - containerDiv.offsetHeight);

test.describe('Preloader', () => {
    test('plays the tape-loading sequence, then waits for RUN', async ({ page }) => {
        await waitForRunPrompt(page);
        const lines = await page.locator('#preloader-screen p').allInnerTexts();
        const text = lines.map((line) => line.trim()).filter(Boolean);
        const expected = ['LOAD', 'PRESS PLAY ON TAPE', 'OK', 'SEARCHING FOR RESUME', 'FOUND COLACE.ME', 'LOADING', 'READY.'];
        let cursor = text.indexOf('LOAD');
        for (const line of expected) {
            const found = text.indexOf(line, cursor);
            expect(found, `"${line}" after position ${cursor}`).toBeGreaterThanOrEqual(cursor);
            cursor = found;
        }
        await expect(page.locator('.c64-prompt')).toHaveText('CLICK OR PRESS A KEY TO RUN');
        await expect(page.locator('#preloader')).not.toHaveClass(/c64-loading/);
    });

    test('a key press runs the game', async ({ page }) => {
        await waitForRunPrompt(page);
        await page.keyboard.press('Enter');
        await page.waitForSelector('#preloader', { state: 'hidden' });
        await page.waitForFunction(() => flags.preloadShiftUpDone && scrollState.canScrollOrSwipe);
    });

    test('the world only rises after RUN', async ({ page }) => {
        await waitForRunPrompt(page);
        expect(await page.locator('.layer-risen').count()).toBe(0);
        await page.mouse.click(10, 10);
        await page.waitForFunction(() => document.querySelectorAll('.layer-risen').length === layerHorizontalArray.length);
    });
});

test.describe('Config', () => {
    test('gameConfig is deeply frozen', async ({ page }) => {
        await page.goto('/index.html');
        const frozen = await page.evaluate(() => [
            Object.isFrozen(gameConfig),
            Object.isFrozen(gameConfig.ale.jump),
            Object.isFrozen(gameConfig.seaAnimals.rows.fish)
        ]);
        expect(frozen).toEqual([true, true, true]);
    });

    test('every sea species has a row layout matching its markup', async ({ page }) => {
        await page.goto('/index.html');
        await page.waitForFunction(() => seaAnimalSpecies[0].animals.length > 0);
        const species = await page.evaluate(() => seaAnimalSpecies.map((s) => ({
            name: s.name,
            animals: s.animals.length,
            slots: gameConfig.seaAnimals.rows[s.name].reduce((sum, row) => sum + row, 0)
        })));
        for (const s of species) expect(s.animals, s.name).toBe(s.slots);
    });
});

test.describe('Scenes', () => {
    test('every scene is complete and bound to an existing container', async ({ page }) => {
        await page.goto('/index.html');
        const problems = await page.evaluate(() => scenes.flatMap((scene) => {
            const issues = [];
            if (!(scene.container instanceof HTMLElement)) issues.push(`${scene.name}: missing container`);
            if (!['land', 'sea'].includes(scene.world)) issues.push(`${scene.name}: bad world`);
            for (const hook of ['reset', 'layout', 'enter']) if (typeof scene[hook] !== 'function') issues.push(`${scene.name}: missing ${hook}`);
            return issues;
        }));
        expect(problems).toEqual([]);
        const names = await page.evaluate(() => scenes.map((scene) => scene.name));
        expect(new Set(names).size).toBe(names.length);
    });

    test('crossing a scene plays its entry once; scrolling back to the start resets it', async ({ page }) => {
        await enterGame(page);
        expect(await page.evaluate(() => flags.canAnimatePlant)).toBe(true);
        const plantsCenter = await page.evaluate(() => about1ContainerDiv.offsetLeft + about1ContainerDiv.offsetWidth / 2 - containerDiv.offsetWidth / 2);
        await scrollTo(page, Math.round(plantsCenter));
        expect(await page.evaluate(() => flags.canAnimatePlant)).toBe(false);
        await scrollTo(page, 0);
        expect(await page.evaluate(() => flags.canAnimatePlant)).toBe(true);
    });

    test('a boss lands when its experience scene is entered', async ({ page }) => {
        await enterGame(page);
        const robotCenter = await page.evaluate(() => experience1ContainerDiv.offsetLeft + experience1ContainerDiv.offsetWidth / 2 - containerDiv.offsetWidth / 2);
        await scrollTo(page, Math.round(robotCenter));
        expect(await page.evaluate(() => bosses[0].canAnimate)).toBe(false);
        await page.waitForFunction(() => robotDiv.offsetLeft === gameConfig.bosses.robot.landingLeft);
    });
});

test.describe('Scroll phases', () => {
    test('layers move horizontally, then vertically, then Ale walks to the rocket', async ({ page }) => {
        await enterGame(page);
        await scrollTo(page, 10);
        expect(await page.evaluate(() => scrollState.layersMovement)).toBe('horizontal');

        const end = await maxScroll(page);
        const { verticalStart, distance } = await page.evaluate(() => {
            const last = layerHorizontalArray[layerHorizontalArray.length - 1];
            return { verticalStart: last.offsetWidth - containerDiv.offsetWidth, distance: gameConfig.world.aleToRocketDistance };
        });
        await scrollTo(page, Math.round((verticalStart + end - distance) / 2));
        expect(await page.evaluate(() => scrollState.layersMovement)).toBe('vertical');

        await scrollTo(page, end - Math.round(distance / 2));
        expect(await page.evaluate(() => scrollState.layersMovement)).toBe('walking-to-rocket');

        await scrollTo(page, end);
        expect(await page.evaluate(() => scrollState.layersMovement)).toBe('at-rocket');
        await page.waitForFunction(() => ale.isHappy);
    });

    test('scroll progress bar tracks the position', async ({ page }) => {
        await enterGame(page);
        const end = await maxScroll(page);
        await scrollTo(page, Math.round(end / 2));
        const value = Number(await page.locator('#progress-track').getAttribute('aria-valuenow'));
        expect(value).toBeGreaterThanOrEqual(49);
        expect(value).toBeLessThanOrEqual(51);
    });
});

test.describe('Sea', () => {
    test('Ale swims inside the sea and walks again outside it', async ({ page }) => {
        await enterGame(page);
        const { enter, exit } = await page.evaluate(() => ({
            enter: Math.round(sea1Div.offsetLeft - ale.leftEdge + 50),
            exit: Math.round(sea1Div.offsetLeft + sea1Div.offsetWidth - ale.rightEdge + 50)
        }));
        await scrollTo(page, enter);
        expect(await page.evaluate(() => ale.isSwimming)).toBe(true);
        await scrollTo(page, exit);
        expect(await page.evaluate(() => ale.isSwimming)).toBe(false);
    });
});

test.describe('Contact form', () => {
    test('an invalid email shows the first confirmation and focuses the field', async ({ page }) => {
        await enterGame(page);
        await page.evaluate(() => {
            emailAddressDiv.value = 'not-an-email';
            sendEmail();
        });
        await page.waitForFunction(() => flags.contactConfirmationVisible);
        const opacity = await page.evaluate(() => getComputedStyle(contactConfirmationContainerArray[0].children[0].children[0]).opacity);
        expect(opacity).toBe('1');
        expect(await page.evaluate(() => document.activeElement === emailAddressDiv)).toBe(true);
    });

    test('a valid email with an empty subject shows the second confirmation', async ({ page }) => {
        await enterGame(page);
        await page.evaluate(() => {
            emailAddressDiv.value = 'someone@example.com';
            emailSubjectDiv.value = '';
            emailMessageDiv.value = 'hi';
            sendEmail();
        });
        await page.waitForFunction(() => getComputedStyle(contactConfirmationContainerArray[1].children[0].children[0]).opacity === '1');
        expect(await page.evaluate(() => document.activeElement === emailSubjectDiv)).toBe(true);
    });
});

test.describe('Blinks', () => {
    test('the contact alien blinks at the configured rhythm', async ({ page }) => {
        await enterGame(page);
        const result = await page.evaluate(async () => {
            let closes = 0;
            new MutationObserver(() => { if (alienEyes.style.opacity === '1') closes += 1 }).observe(alienEyes, { attributes: true });
            const duration = 3000;
            await new Promise((resolve) => setTimeout(resolve, duration));
            return { closes, expected: Math.floor(duration / gameConfig.bosses.alien.eyesInterval) };
        });
        expect(result.closes).toBeGreaterThanOrEqual(result.expected - 1);
    });
});

test.describe('Super Star', () => {
    test('stars cycle through the whole palette', async ({ page }) => {
        await enterGame(page);
        const result = await page.evaluate(async () => {
            const seen = new Set();
            for (let i = 0; i < 20; i++) {
                seen.add(stars[0].style.filter || 'none');
                await new Promise((resolve) => setTimeout(resolve, gameConfig.stars.interval / 2));
            }
            return { seen: [...seen].sort(), palette: [...gameConfig.stars.palette].sort() };
        });
        expect(result.seen).toEqual(result.palette);
    });

    test('stars stay still when the user prefers reduced motion', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await enterGame(page);
        await page.waitForTimeout(500);
        expect(await page.evaluate(() => stars[0].style.filter)).toBe('');
    });
});

test.describe('rAF interval utility', () => {
    test('fires repeatedly and stops when cleared', async ({ page }) => {
        await page.goto('/index.html');
        const counts = await page.evaluate(async () => {
            let calls = 0;
            const id = setRafInterval(() => { calls += 1 }, 50);
            await new Promise((resolve) => setTimeout(resolve, 400));
            clearRafInterval(id);
            const atClear = calls;
            await new Promise((resolve) => setTimeout(resolve, 200));
            return { atClear, after: calls };
        });
        expect(counts.atClear).toBeGreaterThanOrEqual(3);
        expect(counts.after).toBe(counts.atClear);
    });
});

test.describe('Build output', () => {
    const sitemapPath = path.join(__dirname, '..', 'dist', 'sitemap.xml');

    test.skip(!fs.existsSync(sitemapPath), 'run `npm run deploy` first');

    test('sitemap lists the public pages with ISO lastmod dates', () => {
        const sitemap = fs.readFileSync(sitemapPath, 'utf8');
        expect(sitemap).toContain('<loc>https://www.colace.me/</loc>');
        expect(sitemap).toContain('<loc>https://www.colace.me/about.html</loc>');
        const dates = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
        expect(dates.length).toBe(2);
        for (const date of dates) expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
});
