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

// Scrolls toward the target in steps a user could make (a jump wider than the viewport skips cutscenes)
// until a cutscene (pipe warp, power-up) takes over.
async function walkUntilCutscene(page, target) {
    await page.evaluate(async (y) => {
        const from = scrollState.position;
        const steps = Math.ceil(Math.abs(y - from) / 100);
        for (let i = 1; i <= steps && !cutscene.isActive; i++) {
            window.scrollTo(0, from + (y - from) * i / steps);
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        }
    }, target);
    expect(await page.evaluate(() => cutscene.isActive)).toBe(true);
}

const cutsceneEnded = (page) => page.waitForFunction(() => !cutscene.isActive, null, { timeout: 10000 });

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
            Object.isFrozen(gameConfig.seaAnimals.rows.puffer)
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

    test('the bottom of the page is the end even when scrollY is fractional', async ({ page }) => {
        await enterGame(page);
        const end = await maxScroll(page);
        await scrollTo(page, end - 100);
        // Zoom and display scaling stop scrollY short of the end, e.g. at 26179.6 instead of 26180.
        const state = await page.evaluate((y) => {
            Object.defineProperty(window, 'scrollY', { configurable: true, get: () => y });
            window.onscroll();
            return { position: scrollState.position, phase: scrollState.layersMovement };
        }, end - 0.4);
        expect(state).toEqual({ position: end, phase: 'at-rocket' });
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

test.describe('Touch devices', () => {
    test.use({ isMobile: true, hasTouch: true, viewport: { width: 360, height: 800 } });

    async function enterGameByTap(page) {
        await waitForRunPrompt(page);
        await page.touchscreen.tap(10, 10);
        await page.waitForSelector('#preloader', { state: 'hidden' });
        await page.waitForFunction(() => flags.preloadShiftUpDone);
    }

    // Real touch events, drifting a little vertically like a thumb does. holdBeforeLift keeps the finger
    // still on the glass before lifting it.
    async function swipeLeft(page, distance, { holdBeforeLift = 0 } = {}) {
        const cdp = await page.context().newCDPSession(page);
        const startX = 300;
        const y = 400;
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y }] });
        for (let step = 1; step <= 10; step++) {
            await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: startX - distance * step / 10, y: y - 4 * step }] });
        }
        if (holdBeforeLift) await page.waitForTimeout(holdBeforeLift);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        return cdp;
    }

    const position = (page) => page.evaluate(() => scrollState.position);

    test('portrait gets the narrow layout, landscape one tall enough for the scenes', async ({ page }) => {
        await waitForRunPrompt(page);
        expect(await page.evaluate(() => window.innerWidth === gameConfig.viewport.portraitWidth)).toBe(true);

        await page.setViewportSize({ width: 800, height: 360 });
        // The layout viewport follows the orientation change (viewport.js): wait for it, then check its size.
        await page.waitForFunction(() => window.innerWidth !== gameConfig.viewport.portraitWidth);
        const landscape = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight, ...gameConfig.viewport }));
        expect(landscape.width).toBeGreaterThanOrEqual(landscape.minWidth);
        expect(landscape.height).toBeGreaterThanOrEqual(landscape.minHeight);
    });

    // A touchmove left to the browser scrolls the page, toggles the address bar (a resize per swipe) and
    // can pull to refresh: the game must cancel every one (a passive listener silently cannot).
    test('a swipe walks the world and is never handed to the browser', async ({ page }) => {
        await enterGameByTap(page);
        await page.evaluate(() => {
            window.touchMovesLeftToBrowser = 0;
            document.addEventListener('touchmove', (event) => {
                if (!event.defaultPrevented) window.touchMovesLeftToBrowser++;
            });
        });
        await swipeLeft(page, 200);
        await page.waitForFunction(() => scrollState.position > 0);
        expect(await page.evaluate(() => window.touchMovesLeftToBrowser)).toBe(0);
    });

    test('a quick swipe keeps the world gliding after the finger lifts, until a touch stops it', async ({ page }) => {
        await enterGameByTap(page);
        const cdp = await swipeLeft(page, 200);
        const lifted = await position(page);
        await page.waitForFunction((at) => scrollState.position > at + 100, lifted);

        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 400 }] });
        const caught = await position(page);
        await page.waitForTimeout(300);
        expect(await position(page)).toBe(caught);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    });

    test('a swipe that stops before lifting does not glide', async ({ page }) => {
        await enterGameByTap(page);
        await swipeLeft(page, 200, { holdBeforeLift: 300 });
        const lifted = await position(page);
        await page.waitForTimeout(300);
        expect(await position(page)).toBe(lifted);
    });

    test('a resize while the page is still loading leaves the game working', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        // Holding one image back keeps the load event (and storeDivs) from running yet.
        let releaseImage;
        const imageHeld = new Promise((resolve) => { releaseImage = resolve; });
        await page.route('**/cloud.png', async (route) => {
            await imageHeld;
            await route.continue();
        });
        await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
        const readyState = await page.evaluate(() => {
            window.dispatchEvent(new Event('resize'));
            return document.readyState;
        });
        releaseImage();
        expect(readyState).not.toBe('complete');
        await page.waitForSelector('#preloader.c64-waiting');
        expect(errors).toEqual([]);
    });

    test('at the end of the portrait layout the ABOUT ME sign stays clear of the rocket', async ({ page }) => {
        await enterGameByTap(page);
        await page.evaluate(() => {
            scrollState.positionOnTouch = 0;
            scrollState.touchStartX = 0;
            scrollState.touchCurrentX = -(pageDiv.offsetHeight - containerDiv.offsetHeight);
            detectPageVerticalPosition();
            runTheseFunctionsAfterScrollOrSwipe();
        });
        await page.waitForFunction(() => scrollState.layersMovement === 'at-rocket');
        const layout = await page.evaluate(() => {
            const sign = aboutSignTitleSvg.getBoundingClientRect();
            const scale = sign.height / aboutSignTitleSvg.height.baseVal.value;
            const { textLeft, aboveDepth } = gameConfig.world.aboutSign;
            return {
                textLeft: sign.left + textLeft * scale,
                textRight: sign.right,
                visibleBottom: sign.top + aboveDepth * scale,
                boardTop: document.querySelector('.rocket-sign').getBoundingClientRect().top,
                width: window.innerWidth
            };
        });
        expect(layout.textLeft).toBeGreaterThanOrEqual(0);
        expect(layout.textRight).toBeLessThanOrEqual(layout.width);
        expect(layout.visibleBottom).toBeLessThanOrEqual(layout.boardTop);
    });
});

test.describe('Pipes', () => {
    const pipeStops = (page, name) => page.evaluate((pipeName) => getPipeStops(pipeName === 'dive' ? divePipe : climbPipe), name);

    const state = (page) => page.evaluate(() => ({
        level: scrollState.level,
        position: scrollState.position,
        scrollY: Math.round(window.scrollY),
        isSwimming: ale.isSwimming,
        aleBottom: aleContainerDiv.style.bottom,
        cameraDepth: Math.max(0, -layerHorizontalArray[0].offsetTop),
        seaFloorBottom: `${seaFloorDiv.offsetHeight}px`,
        seaDepth: gameConfig.world.seaShiftRatio * containerDiv.offsetHeight
    }));

    test('walking into the level 1 pipe warps Ale to the sea floor, ignoring the scroll meanwhile', async ({ page }) => {
        await enterGame(page);
        const dive = await pipeStops(page, 'dive');
        await scrollTo(page, dive.land - 300);
        await walkUntilCutscene(page, dive.land + 50);
        await page.evaluate(() => window.scrollTo(0, window.scrollY + 2000));
        await cutsceneEnded(page);
        const after = await state(page);
        expect(after).toMatchObject({ level: 2, position: dive.sea, scrollY: dive.sea, isSwimming: true, aleBottom: after.seaFloorBottom });
        expect(after.cameraDepth).toBeCloseTo(after.seaDepth, 0);
    });

    test('walking back into the side mouth warps Ale onto the level 1 pipe', async ({ page }) => {
        await enterGame(page);
        const dive = await pipeStops(page, 'dive');
        await scrollTo(page, dive.sea + 300);
        await walkUntilCutscene(page, dive.sea - 50);
        await cutsceneEnded(page);
        const after = await state(page);
        const pipeTopBottom = await page.evaluate(() => `${containerDiv.offsetHeight - divePipe.topDiv.offsetTop}px`);
        expect(after).toMatchObject({ level: 1, position: dive.land, isSwimming: false, aleBottom: pipeTopBottom, cameraDepth: 0 });
    });

    test('the level 3 pipe climbs out of the sea and back down', async ({ page }) => {
        await enterGame(page);
        const climb = await pipeStops(page, 'climb');
        await scrollTo(page, climb.sea - 300);
        await walkUntilCutscene(page, climb.sea + 50);
        await cutsceneEnded(page);
        expect(await state(page)).toMatchObject({ level: 3, position: climb.land, isSwimming: false, cameraDepth: 0 });

        await walkUntilCutscene(page, climb.land - 50);
        await cutsceneEnded(page);
        expect(await state(page)).toMatchObject({ level: 2, position: climb.sea, isSwimming: true });
    });

    test('a jump does not warp: it lands in the nearest level, never inside a pipe', async ({ page }) => {
        await enterGame(page);
        const dive = await pipeStops(page, 'dive');
        await page.evaluate((y) => window.scrollTo(0, y), dive.land + 50);
        await page.waitForFunction((y) => scrollState.position === y, dive.land);
        expect(await page.evaluate(() => cutscene.isActive)).toBe(false);
        expect(await state(page)).toMatchObject({ level: 1, isSwimming: false });

        await scrollTo(page, dive.sea + 2000);
        expect(await state(page)).toMatchObject({ level: 2, isSwimming: true });
    });

    test('a resize lands the warp at once, at the stops of the new viewport', async ({ page }) => {
        await enterGame(page);
        const dive = await pipeStops(page, 'dive');
        await scrollTo(page, dive.land - 300);
        await walkUntilCutscene(page, dive.land + 50);
        await page.setViewportSize({ width: 1000, height: 720 });
        await page.waitForFunction(() => !cutscene.isActive, null, { timeout: 1000 });
        const narrowDive = await pipeStops(page, 'dive');
        expect(await state(page)).toMatchObject({ level: 2, position: narrowDive.sea, isSwimming: true });
    });

    test('with reduced motion the warp lands at once', async ({ page }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await enterGame(page);
        const dive = await pipeStops(page, 'dive');
        await scrollTo(page, dive.land - 300);
        await page.evaluate((y) => window.scrollTo(0, y), dive.land + 50);
        await page.waitForFunction((y) => scrollState.position === y, dive.sea);
        expect(await state(page)).toMatchObject({ level: 2, isSwimming: true });
    });
});

test.describe('Power-up', () => {
    const look = (page) => page.evaluate(() => ({
        isShaved: ale.isShaved,
        sheet: getComputedStyle(aleFramesDiv).backgroundImage.split('/').pop().replace(/["')]/g, ''),
        blockUsed: powerUpBlockDiv.classList.contains('power-up-used'),
        mushroomVisible: getComputedStyle(powerUpMushroomDiv).visibility === 'visible',
        position: scrollState.position
    }));

    test('Ale starts with his hair, takes the mushroom under the ? block and stays shaved, back to the start too', async ({ page }) => {
        await enterGame(page);
        expect(await look(page)).toMatchObject({ isShaved: false, sheet: 'ale-slides.png', blockUsed: false });
        const { stop, step } = await page.evaluate(() => ({ stop: getPowerUpStop(), step: gameConfig.powerUp.stepDistance }));
        await scrollTo(page, stop - 300);
        expect(await look(page)).toMatchObject({ isShaved: false, sheet: 'ale-slides.png' });

        await walkUntilCutscene(page, stop + 50);
        await cutsceneEnded(page);
        expect(await look(page)).toMatchObject({ isShaved: true, sheet: 'ale-shave-slides.png', blockUsed: true, mushroomVisible: false, position: stop + step });

        await scrollTo(page, 0);
        expect(await look(page)).toMatchObject({ isShaved: true, sheet: 'ale-shave-slides.png', blockUsed: true });
    });

    test('a jump past the block shaves Ale at once, without the cutscene', async ({ page }) => {
        await enterGame(page);
        const stop = await page.evaluate(() => getPowerUpStop());
        await scrollTo(page, stop + 2000);
        expect(await page.evaluate(() => cutscene.isActive)).toBe(false);
        expect(await look(page)).toMatchObject({ isShaved: true, sheet: 'ale-shave-slides.png', blockUsed: true });
    });
});

test.describe('Blinks', () => {
    test('the ending alien blinks at the configured rhythm', async ({ page }) => {
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
