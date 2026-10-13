// 404 page: blue screen of death + "404 Invaders" mini-game below the fold.
// Standalone page script (not part of the resume game): its tunables live here, not in gameConfig.
// Units: the playfield is measured in sprite pixels ("field units"); timings in ms, speeds in field units per ms.

const invadersConfig = Object.freeze({
    autoDebugDelay: 5000,
    viewThreshold: 0.6,
    fieldMinWidth: 220,
    fieldMinHeight: 150,
    maxUnit: 6,
    cellWidth: 16,
    cellHeight: 12,
    formationTop: 14,
    levelDrop: 4,
    maxLevelDrop: 24,
    marchStep: 2,
    dropStep: 8,
    edgeMargin: 4,
    marchIntervalMax: 650,
    marchIntervalMin: 45,
    levelSpeedup: 0.8,
    playerSpeed: 0.16,
    playerBottomMargin: 6,
    playerBulletSpeed: 0.32,
    enemyBulletSpeed: 0.085,
    enemyFireMin: 500,
    enemyFireMax: 1400,
    maxEnemyBullets: 3,
    lives: 3,
    respawnDelay: 1200,
    explosionDuration: 250,
    maxFrameDelta: 50,
    rowPoints: Object.freeze([30, 20, 20, 10, 10]),
    rowTypes: Object.freeze(["squid", "crab", "crab", "octopus", "octopus"]),
    formationText: "404",
    // Alien glitches on the blue screen (all ms unless noted)
    glitch: Object.freeze({
        startDelay: 1300,
        garbageLineLength: 64,
        garbageInterval: 90,
        garbageChanges: 3,
        bitFlipInterval: 220,
        bitFlipDuration: 120,
        eaterInterval: 1800,
        eaterStep: 70,
        maxEaters: 8,
        minLineLength: 6,
        biteChance: 0.35,
        leaveGarbageChance: 0.25,
        rasterInterval: 700,
        rasterChance: 0.25,
        rasterDuration: 140,
        rasterMaxRows: 4
    })
});

// 3×5 glyphs: every "#" is one invader, so the formation spells the error code.
const invaderGlyphs = {
    "4": ["#.#", "#.#", "###", "..#", "..#"],
    "0": ["###", "#.#", "#.#", "#.#", "###"]
};

const spriteBitmaps = {
    squid: [
        ["...##...", "..####..", ".######.", "##.##.##", "########", "..#..#..", ".#.##.#.", "#.#..#.#"],
        ["...##...", "..####..", ".######.", "##.##.##", "########", ".#.##.#.", "#......#", ".#....#."]
    ],
    crab: [
        ["..#.....#..", "...#...#...", "..#######..", ".##.###.##.", "###########", "#.#######.#", "#.#.....#.#", "...##.##..."],
        ["..#.....#..", "#..#...#..#", "#.#######.#", "###.###.###", "###########", ".#########.", "..#.....#..", ".#.......#."]
    ],
    octopus: [
        ["....####....", ".##########.", "############", "###..##..###", "############", "...##..##...", "..##.##.##..", "##........##"],
        ["....####....", ".##########.", "############", "###..##..###", "############", "..###..###..", ".##..##..##.", "..##....##.."]
    ],
    player: [
        ["......#......", ".....###.....", ".....###.....", ".###########.", "#############", "#############", "#############", "#############"]
    ],
    playerHit: [
        [".#....#...#..", "...#.....#...", "#...##.#....#", "..#######..#.", ".###########.", "#############", "#############", "#############"]
    ],
    explosion: [
        [".#...#...#.", "..#..#..#..", "...#...#...", "##.......##", "...#...#...", "..#..#..#..", ".#...#...#."]
    ]
};

function parseSprite(rows) {
    const pixels = [];
    for (let y = 0; y < rows.length; y++) {
        for (let x = 0; x < rows[y].length; x++) {
            if (rows[y][x] === "#") pixels.push([x, y]);
        }
    }
    return { width: rows[0].length, height: rows.length, pixels };
}

const sprites = {};
for (const [name, frames] of Object.entries(spriteBitmaps)) {
    sprites[name] = frames.map(parseSprite);
}

const invadersCanvas = document.getElementById("invaders-canvas");
const invadersContext = invadersCanvas.getContext("2d");
const invadersStage = document.getElementById("invaders-stage");
const invadersOverlay = document.getElementById("invaders-overlay");
const invadersTitle = document.getElementById("invaders-title");
const invadersHint = document.getElementById("invaders-hint");
const debuggerSection = document.getElementById("debugger");
const bsodSection = document.getElementById("bsod");
const bsodCountdown = document.getElementById("bsod-countdown");
const hudElements = {
    wave: document.getElementById("invaders-wave"),
    aliens: document.getElementById("invaders-aliens"),
    lives: document.getElementById("invaders-lives"),
    score: document.getElementById("invaders-score")
};
const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const invaderKeys = { ArrowLeft: "left", ArrowRight: "right", KeyA: "left", KeyD: "right", Space: "fire" };

const game = {
    state: "ready", // ready | playing | paused | cleared | gameover
    level: 1,
    score: 0,
    lives: invadersConfig.lives,
    unit: 1,
    pixelRatio: 1,
    fieldWidth: invadersConfig.fieldMinWidth,
    fieldHeight: invadersConfig.fieldMinHeight,
    keys: { left: false, right: false, fire: false },
    pointer: { active: false, x: 0 },
    inView: false,
    isVisible: false,
    frameRequest: 0,
    lastFrameTime: 0,
    formation: null,
    player: null,
    playerBullet: null,
    enemyBullets: [],
    explosions: [],
    enemyFireTimer: 0
};

// ─── Blue screen ───────────────────────────────

function showRequestedPath() {
    const maxLength = 32;
    const path = window.location.pathname;
    const shownPath = path.length > maxLength ? `${path.slice(0, maxLength - 3)}...` : path;
    for (const element of document.querySelectorAll(".bsod-path")) {
        element.textContent = shownPath;
    }
}

function scrollToDebugger() {
    debuggerSection.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
}

/**
 * Counts down `autoDebugDelay` in the footer, then scrolls to the game.
 * Any wheel, touch, key, pointer or scroll input before then cancels it for good.
 * Skipped when the page opens already scrolled or on an anchor.
 */
function startAutoDebugCountdown() {
    if (window.scrollY > 0 || window.location.hash) return;
    const cancelEvents = ["wheel", "touchstart", "keydown", "pointerdown", "scroll"];
    const startTime = performance.now();
    let countdownTimer = 0;
    const cancel = () => {
        clearInterval(countdownTimer);
        bsodCountdown.textContent = "";
        for (const eventName of cancelEvents) window.removeEventListener(eventName, cancel);
    };
    const tick = () => {
        const remaining = invadersConfig.autoDebugDelay - (performance.now() - startTime);
        if (remaining <= 0) {
            cancel();
            scrollToDebugger();
            return;
        }
        bsodCountdown.textContent = ` IN ${Math.ceil(remaining / 1000)}`;
    };
    for (const eventName of cancelEvents) window.addEventListener(eventName, cancel, { passive: true });
    countdownTimer = setInterval(tick, 100);
    tick();
}

// ─── Alien glitches on the blue screen ─────────
// Invaders crawl along lines of text eating characters, bits flip into PETSCII graphics and raster
// bands of an alien signal flash across the screen. Lines holding links or markup are never touched.

const petsciiGlitchCodes = [];
for (let code = 0x21; code <= 0x3F; code++) petsciiGlitchCodes.push(code);
for (let code = 0xA1; code <= 0xDF; code++) petsciiGlitchCodes.push(code);

const alienGlitch = { isVisible: true, eaters: 0, busyLines: new Set(), rasterBand: null };

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

// C64 Pro Mono maps the PETSCII uppercase/graphics set to U+E000 + PETSCII code
function randomPetsciiGlyph() {
    return String.fromCharCode(0xE000 + randomItem(petsciiGlitchCodes));
}

function fillGarbageLines() {
    const length = invadersConfig.glitch.garbageLineLength;
    for (const line of document.querySelectorAll(".bsod-garbage p")) {
        line.textContent = Array.from({ length }, randomPetsciiGlyph).join("");
    }
}

function scrambleGarbageLine() {
    const line = randomItem([...document.querySelectorAll(".bsod-garbage p")]);
    const characters = [...line.textContent];
    for (let i = 0; i < invadersConfig.glitch.garbageChanges; i++) {
        characters[Math.floor(Math.random() * characters.length)] = randomPetsciiGlyph();
    }
    line.textContent = characters.join("");
}

/**
 * Text rows the aliens may corrupt: plain-text `<p>` (no links or markup) on screen,
 * not already being glitched and long enough to be worth a bite.
 * @returns {HTMLParagraphElement[]}
 */
function glitchableLines() {
    const bottom = bsodSection.getBoundingClientRect().bottom;
    return [...bsodSection.querySelectorAll(".bsod-col p")].filter((line) =>
        line.children.length === 0 &&
        !line.closest(".bsod-garbage") &&
        !alienGlitch.busyLines.has(line) &&
        line.textContent.trim().length >= invadersConfig.glitch.minLineLength &&
        line.offsetParent !== null &&
        line.getBoundingClientRect().bottom <= bottom
    );
}

function flipBit() {
    const line = randomItem(glitchableLines());
    if (!line) return;
    const original = line.textContent;
    const characters = [...original];
    const index = Math.floor(Math.random() * characters.length);
    if (characters[index] === " ") return;
    alienGlitch.busyLines.add(line);
    characters[index] = randomPetsciiGlyph();
    line.textContent = characters.join("");
    setTimeout(() => {
        line.textContent = original;
        alienGlitch.busyLines.delete(line);
    }, invadersConfig.glitch.bitFlipDuration);
}

function drawEaterFrame(eater, sprite) {
    const context = eater.getContext("2d");
    context.clearRect(0, 0, eater.width, eater.height);
    context.fillStyle = "#ffffff";
    for (const [pixelX, pixelY] of sprite.pixels) context.fillRect(pixelX, pixelY, 1, 1);
}

/**
 * One invader walks along a random text row, one character per `eaterStep`, in a random direction.
 * Each character it passes is bitten with `biteChance`: replaced by a space or, sometimes, PETSCII garbage.
 * The row switches to `white-space: pre` so the gaps it leaves don't collapse.
 */
function sendEater() {
    const settings = invadersConfig.glitch;
    const line = randomItem(glitchableLines());
    if (!line) return;
    alienGlitch.eaters++;
    alienGlitch.busyLines.add(line);
    line.classList.add("bsod-eaten");
    const characters = [...line.textContent];
    const textRange = document.createRange();
    textRange.selectNodeContents(line);
    const textRect = textRange.getBoundingClientRect();
    const bsodRect = bsodSection.getBoundingClientRect();
    const charWidth = textRect.width / characters.length;
    const frames = sprites[randomItem(["squid", "crab", "octopus"])];
    const scale = textRect.height / frames[0].height;
    const eaterWidth = frames[0].width * scale;
    const eater = document.createElement("canvas");
    eater.className = "bsod-eater";
    eater.width = frames[0].width;
    eater.height = frames[0].height;
    eater.style.width = `${eaterWidth}px`;
    eater.style.height = `${textRect.height}px`;
    eater.style.top = `${textRect.top - bsodRect.top}px`;
    bsodSection.appendChild(eater);
    const direction = Math.random() < 0.5 ? 1 : -1;
    let column = direction > 0 ? -2 : characters.length + 1;
    let frame = 0;
    const place = () => {
        drawEaterFrame(eater, frames[frame]);
        eater.style.left = `${textRect.left - bsodRect.left + column * charWidth - (eaterWidth - charWidth) / 2}px`;
    };
    const stepTimer = setInterval(() => {
        column += direction;
        frame = 1 - frame;
        place();
        if (column >= 0 && column < characters.length && characters[column] !== " " && Math.random() < settings.biteChance) {
            characters[column] = Math.random() < settings.leaveGarbageChance ? randomPetsciiGlyph() : " ";
            line.textContent = characters.join("");
        }
        if (column < -2 || column > characters.length + 1) {
            clearInterval(stepTimer);
            eater.remove();
            alienGlitch.busyLines.delete(line);
        }
    }, settings.eaterStep);
    place();
}

function flashRaster() {
    const settings = invadersConfig.glitch;
    const rowHeight = parseFloat(getComputedStyle(bsodSection).fontSize);
    const rows = 1 + Math.floor(Math.random() * settings.rasterMaxRows);
    const band = alienGlitch.rasterBand;
    band.style.top = `${Math.floor(Math.random() * (bsodSection.clientHeight / rowHeight - rows)) * rowHeight}px`;
    band.style.height = `${rows * rowHeight}px`;
    band.hidden = false;
    setTimeout(() => {
        band.hidden = true;
    }, settings.rasterDuration);
}

function startAlienGlitches() {
    fillGarbageLines();
    if (prefersReducedMotion) return;
    const settings = invadersConfig.glitch;
    alienGlitch.rasterBand = document.createElement("div");
    alienGlitch.rasterBand.className = "bsod-raster";
    alienGlitch.rasterBand.hidden = true;
    bsodSection.appendChild(alienGlitch.rasterBand);
    const whileVisible = (action) => () => {
        if (alienGlitch.isVisible && !document.hidden) action();
    };
    new IntersectionObserver((entries) => {
        for (const entry of entries) alienGlitch.isVisible = entry.isIntersecting;
    }).observe(bsodSection);
    setTimeout(() => {
        setInterval(whileVisible(scrambleGarbageLine), settings.garbageInterval);
        setInterval(whileVisible(flipBit), settings.bitFlipInterval);
        setInterval(whileVisible(() => {
            if (Math.random() < settings.rasterChance) flashRaster();
        }), settings.rasterInterval);
        const eaterTimer = setInterval(whileVisible(() => {
            if (alienGlitch.eaters >= settings.maxEaters) clearInterval(eaterTimer);
            else sendEater();
        }), settings.eaterInterval);
        sendEater();
    }, settings.startDelay);
}

// ─── Game setup ────────────────────────────────

/**
 * Builds a wave: one invader per "#" of the `formationText` glyphs, centred, lower on later waves.
 * @returns {{invaders: object[], total: number, width: number, x: number, y: number, direction: number, frame: number, marchTimer: number}}
 */
function createFormation() {
    const invaders = [];
    const glyphWidth = 3;
    const glyphGap = 1;
    [...invadersConfig.formationText].forEach((character, digitIndex) => {
        invaderGlyphs[character].forEach((glyphRow, row) => {
            for (let column = 0; column < glyphWidth; column++) {
                if (glyphRow[column] !== "#") continue;
                invaders.push({
                    gridColumn: digitIndex * (glyphWidth + glyphGap) + column,
                    row,
                    type: invadersConfig.rowTypes[row],
                    alive: true
                });
            }
        });
    });
    const columns = invadersConfig.formationText.length * (glyphWidth + glyphGap) - glyphGap;
    const width = columns * invadersConfig.cellWidth;
    const levelDrop = Math.min((game.level - 1) * invadersConfig.levelDrop, invadersConfig.maxLevelDrop);
    return {
        invaders,
        total: invaders.length,
        width,
        x: Math.round((game.fieldWidth - width) / 2),
        y: invadersConfig.formationTop + levelDrop,
        direction: 1,
        frame: 0,
        marchTimer: 0
    };
}

function createPlayer() {
    const sprite = sprites.player[0];
    return {
        x: Math.round((game.fieldWidth - sprite.width) / 2),
        y: game.fieldHeight - invadersConfig.playerBottomMargin - sprite.height,
        width: sprite.width,
        height: sprite.height,
        respawnTimer: 0
    };
}

function randomEnemyFireDelay() {
    const range = invadersConfig.enemyFireMax - invadersConfig.enemyFireMin;
    const levelFactor = invadersConfig.levelSpeedup ** (game.level - 1);
    return (invadersConfig.enemyFireMin + Math.random() * range) * levelFactor;
}

function setupWave() {
    game.formation = createFormation();
    game.player = createPlayer();
    game.playerBullet = null;
    game.enemyBullets = [];
    game.explosions = [];
    game.enemyFireTimer = randomEnemyFireDelay();
    updateHud();
}

function startNewGame() {
    game.level = 1;
    game.score = 0;
    game.lives = invadersConfig.lives;
    setupWave();
    setGameState("playing");
}

function startNextLevel() {
    game.level++;
    setupWave();
    setGameState("playing");
}

// ─── HUD and overlay ───────────────────────────

function updateHud() {
    hudElements.wave.textContent = game.level;
    hudElements.aliens.textContent = aliveInvaders().length;
    hudElements.lives.textContent = game.lives;
    hudElements.score.textContent = game.score;
}

function overlayMessage(state) {
    const press = (action) => (isTouchDevice ? `TAP TO ${action}` : `PRESS FIRE TO ${action}`);
    const reboot = isTouchDevice ? "" : " OR ENTER TO REBOOT";
    switch (state) {
        case "ready":
            return { title: "THEY ATE YOUR PAGE", hint: press("FIGHT BACK") };
        case "paused":
            return { title: "PAUSED", hint: press("CONTINUE") };
        case "cleared":
            return { title: "SECTOR 404 RECLAIMED!", hint: `${press(`FACE WAVE ${game.level + 1}`)}${reboot}` };
        case "gameover":
            return { title: "GAME OVER: THE PAGE IS LOST", hint: `${press("TRY AGAIN")}${reboot}` };
        default:
            return null;
    }
}

function setGameState(state) {
    game.state = state;
    game.keys.fire = false;
    const message = overlayMessage(state);
    invadersOverlay.hidden = message === null;
    invadersOverlay.classList.toggle("invaders-over", state === "cleared" || state === "gameover");
    if (message) {
        invadersTitle.textContent = message.title;
        invadersHint.textContent = message.hint;
    }
}

function primaryAction() {
    if (game.state === "ready" || game.state === "gameover") startNewGame();
    else if (game.state === "paused") setGameState("playing");
    else if (game.state === "cleared") startNextLevel();
}

function pauseGame() {
    if (game.state === "playing") setGameState("paused");
}

// ─── Geometry ──────────────────────────────────

function aliveInvaders() {
    return game.formation.invaders.filter((invader) => invader.alive);
}

function invaderBox(invader) {
    const sprite = sprites[invader.type][game.formation.frame];
    const offset = (invadersConfig.cellWidth - sprite.width) / 2;
    return {
        x: game.formation.x + invader.gridColumn * invadersConfig.cellWidth + offset,
        y: game.formation.y + invader.row * invadersConfig.cellHeight,
        width: sprite.width,
        height: sprite.height
    };
}

function boxesOverlap(boxA, boxB) {
    return boxA.x < boxB.x + boxB.width && boxA.x + boxA.width > boxB.x && boxA.y < boxB.y + boxB.height && boxA.y + boxA.height > boxB.y;
}

/**
 * Fits the playfield to the stage: one sprite pixel = `game.unit` CSS px (integer when ≥ 2, so pixels stay crisp),
 * canvas backed at devicePixelRatio. Keeps player and formation inside the new bounds; sets up the first wave on first call.
 */
function resizeGame() {
    const width = invadersStage.clientWidth;
    const height = invadersStage.clientHeight;
    if (width === 0 || height === 0) return;
    const fitUnit = Math.min(width / invadersConfig.fieldMinWidth, height / invadersConfig.fieldMinHeight, invadersConfig.maxUnit);
    game.unit = fitUnit >= 2 ? Math.floor(fitUnit) : fitUnit;
    game.pixelRatio = window.devicePixelRatio ?? 1;
    game.fieldWidth = width / game.unit;
    game.fieldHeight = height / game.unit;
    invadersCanvas.width = Math.round(width * game.pixelRatio);
    invadersCanvas.height = Math.round(height * game.pixelRatio);
    if (!game.formation) {
        setupWave();
        setGameState("ready");
        return;
    }
    const player = game.player;
    player.y = game.fieldHeight - invadersConfig.playerBottomMargin - player.height;
    player.x = Math.min(Math.max(player.x, invadersConfig.edgeMargin), game.fieldWidth - invadersConfig.edgeMargin - player.width);
    const formation = game.formation;
    const maxFormationX = game.fieldWidth - invadersConfig.edgeMargin - formation.width;
    formation.x = Math.max(invadersConfig.edgeMargin, Math.min(formation.x, maxFormationX));
    if (game.state === "ready") formation.x = Math.round((game.fieldWidth - formation.width) / 2);
    drawGame();
}

// ─── Update ────────────────────────────────────

/**
 * One march tick: step sideways or, at an edge, drop and reverse; toggle the animation frame.
 * Invaders reaching the player's row end the game.
 */
function marchFormation() {
    const formation = game.formation;
    const boxes = aliveInvaders().map(invaderBox);
    const left = Math.min(...boxes.map((box) => box.x));
    const right = Math.max(...boxes.map((box) => box.x + box.width));
    const nextLeft = left + invadersConfig.marchStep * formation.direction;
    const nextRight = right + invadersConfig.marchStep * formation.direction;
    if (nextLeft < invadersConfig.edgeMargin || nextRight > game.fieldWidth - invadersConfig.edgeMargin) {
        formation.y += invadersConfig.dropStep;
        formation.direction *= -1;
    } else {
        formation.x += invadersConfig.marchStep * formation.direction;
    }
    formation.frame = 1 - formation.frame;
    const bottom = Math.max(...aliveInvaders().map(invaderBox).map((box) => box.y + box.height));
    if (bottom >= game.player.y) {
        game.lives = 0;
        updateHud();
        setGameState("gameover");
    }
}

function marchInterval() {
    const formation = game.formation;
    const aliveRatio = aliveInvaders().length / formation.total;
    const levelFactor = invadersConfig.levelSpeedup ** (game.level - 1);
    return Math.max(invadersConfig.marchIntervalMin, invadersConfig.marchIntervalMax * aliveRatio * levelFactor);
}

function fireEnemyBullet() {
    const bottomInvaders = new Map();
    for (const invader of aliveInvaders()) {
        const current = bottomInvaders.get(invader.gridColumn);
        if (!current || invader.row > current.row) bottomInvaders.set(invader.gridColumn, invader);
    }
    const shooters = [...bottomInvaders.values()];
    const shooter = shooters[Math.floor(Math.random() * shooters.length)];
    const box = invaderBox(shooter);
    game.enemyBullets.push({ x: Math.floor(box.x + box.width / 2), y: box.y + box.height, width: 1, height: 5 });
}

function hitPlayer() {
    game.lives--;
    game.enemyBullets = [];
    game.playerBullet = null;
    game.player.respawnTimer = invadersConfig.respawnDelay;
    updateHud();
}

function updatePlayer(delta) {
    const player = game.player;
    if (player.respawnTimer > 0) {
        player.respawnTimer -= delta;
        if (player.respawnTimer <= 0 && game.lives === 0) setGameState("gameover");
        return;
    }
    let direction = (game.keys.right ? 1 : 0) - (game.keys.left ? 1 : 0);
    if (game.pointer.active) {
        const distance = game.pointer.x - (player.x + player.width / 2);
        direction = Math.abs(distance) < 1 ? 0 : Math.sign(distance);
    }
    const minX = invadersConfig.edgeMargin;
    const maxX = game.fieldWidth - invadersConfig.edgeMargin - player.width;
    player.x = Math.min(Math.max(player.x + direction * invadersConfig.playerSpeed * delta, minX), maxX);
    const wantsFire = game.keys.fire || game.pointer.active;
    if (wantsFire && !game.playerBullet) {
        game.playerBullet = { x: Math.floor(player.x + player.width / 2), y: player.y - 4, width: 1, height: 4 };
    }
}

function updatePlayerBullet(delta) {
    const bullet = game.playerBullet;
    if (!bullet) return;
    bullet.y -= invadersConfig.playerBulletSpeed * delta;
    if (bullet.y + bullet.height < 0) {
        game.playerBullet = null;
        return;
    }
    for (const invader of aliveInvaders()) {
        const box = invaderBox(invader);
        if (!boxesOverlap(bullet, box)) continue;
        invader.alive = false;
        game.score += invadersConfig.rowPoints[invader.row] * game.level;
        game.explosions.push({ x: box.x + (box.width - sprites.explosion[0].width) / 2, y: box.y, timer: invadersConfig.explosionDuration });
        game.playerBullet = null;
        updateHud();
        if (aliveInvaders().length === 0) setGameState("cleared");
        return;
    }
    const enemyBulletIndex = game.enemyBullets.findIndex((enemyBullet) => boxesOverlap(bullet, enemyBullet));
    if (enemyBulletIndex >= 0) {
        game.enemyBullets.splice(enemyBulletIndex, 1);
        game.playerBullet = null;
    }
}

function updateEnemyBullets(delta) {
    const player = game.player;
    for (const bullet of game.enemyBullets) bullet.y += invadersConfig.enemyBulletSpeed * delta;
    game.enemyBullets = game.enemyBullets.filter((bullet) => bullet.y < game.fieldHeight);
    if (player.respawnTimer <= 0 && game.enemyBullets.some((bullet) => boxesOverlap(bullet, player))) hitPlayer();
    game.enemyFireTimer -= delta;
    if (game.enemyFireTimer <= 0 && player.respawnTimer <= 0) {
        if (game.enemyBullets.length < invadersConfig.maxEnemyBullets) fireEnemyBullet();
        game.enemyFireTimer = randomEnemyFireDelay();
    }
}

function updateGame(delta) {
    for (const explosion of game.explosions) explosion.timer -= delta;
    game.explosions = game.explosions.filter((explosion) => explosion.timer > 0);
    if (game.state !== "playing") return;
    updatePlayer(delta);
    if (game.state !== "playing" || game.player.respawnTimer > 0) return;
    updatePlayerBullet(delta);
    if (game.state !== "playing") return;
    updateEnemyBullets(delta);
    game.formation.marchTimer += delta;
    if (game.formation.marchTimer >= marchInterval()) {
        game.formation.marchTimer = 0;
        marchFormation();
    }
}

// ─── Draw ──────────────────────────────────────

function fillFieldRect(x, y, width, height) {
    const scale = game.unit * game.pixelRatio;
    const left = Math.round(x * scale);
    const top = Math.round(y * scale);
    invadersContext.fillRect(left, top, Math.round((x + width) * scale) - left, Math.round((y + height) * scale) - top);
}

function drawSprite(sprite, x, y) {
    const originX = Math.round(x);
    const originY = Math.round(y);
    for (const [pixelX, pixelY] of sprite.pixels) fillFieldRect(originX + pixelX, originY + pixelY, 1, 1);
}

function drawGame() {
    invadersContext.clearRect(0, 0, invadersCanvas.width, invadersCanvas.height);
    invadersContext.fillStyle = "#ffffff";
    for (const invader of aliveInvaders()) {
        const box = invaderBox(invader);
        drawSprite(sprites[invader.type][game.formation.frame], box.x, box.y);
    }
    for (const explosion of game.explosions) drawSprite(sprites.explosion[0], explosion.x, explosion.y);
    const player = game.player;
    const isRespawning = player.respawnTimer > 0;
    if (!isRespawning || game.lives === 0 || Math.floor(player.respawnTimer / 150) % 2 === 0) {
        drawSprite(isRespawning ? sprites.playerHit[0] : sprites.player[0], player.x, player.y);
    }
    for (const bullet of [game.playerBullet, ...game.enemyBullets]) {
        if (bullet) fillFieldRect(Math.round(bullet.x), bullet.y, bullet.width, bullet.height);
    }
    fillFieldRect(0, game.fieldHeight - 2, game.fieldWidth, 0.5);
}

function gameLoop(time) {
    const delta = Math.min(time - game.lastFrameTime, invadersConfig.maxFrameDelta);
    game.lastFrameTime = time;
    updateGame(delta);
    drawGame();
    game.frameRequest = requestAnimationFrame(gameLoop);
}

function startGameLoop() {
    if (game.frameRequest) return;
    game.lastFrameTime = performance.now();
    game.frameRequest = requestAnimationFrame(gameLoop);
}

function stopGameLoop() {
    cancelAnimationFrame(game.frameRequest);
    game.frameRequest = 0;
}

// ─── Input ─────────────────────────────────────

function isInteractiveTarget(target) {
    return target instanceof Element && target.closest("a, button, input, textarea, select") !== null;
}

// A link or button the user reached with the keyboard: Return must activate it, not reboot.
// Focus left on a link by a mouse click doesn't count (it isn't :focus-visible).
function isKeyboardFocusedControl(target) {
    return isInteractiveTarget(target) && target.matches(":focus-visible");
}

function handleKeyDown(event) {
    if (event.key === "Enter") {
        if (!isKeyboardFocusedControl(event.target)) {
            event.preventDefault();
            window.location.href = "/";
        }
        return;
    }
    const control = invaderKeys[event.code];
    if (!control || !game.inView) return;
    event.preventDefault();
    if (control === "fire" && game.state !== "playing") {
        if (!event.repeat) primaryAction();
        return;
    }
    game.keys[control] = true;
}

function handleKeyUp(event) {
    const control = invaderKeys[event.code];
    if (control) game.keys[control] = false;
}

function pointerFieldX(event) {
    return (event.clientX - invadersStage.getBoundingClientRect().left) / game.unit;
}

function handlePointerDown(event) {
    if (isInteractiveTarget(event.target)) return;
    if (game.state !== "playing") {
        primaryAction();
        return;
    }
    game.pointer.active = true;
    game.pointer.x = pointerFieldX(event);
    invadersStage.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
    if (game.pointer.active) game.pointer.x = pointerFieldX(event);
}

function releasePointer() {
    game.pointer.active = false;
}

function releaseAllInput() {
    game.keys.left = false;
    game.keys.right = false;
    game.keys.fire = false;
    releasePointer();
}

const debuggerObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
        game.isVisible = entry.isIntersecting;
        game.inView = entry.intersectionRatio >= invadersConfig.viewThreshold;
        if (game.isVisible) startGameLoop();
        else stopGameLoop();
        if (!game.inView) {
            releaseAllInput();
            pauseGame();
        }
    }
}, { threshold: [0, invadersConfig.viewThreshold] });

window.addEventListener("keydown", handleKeyDown);
window.addEventListener("keyup", handleKeyUp);
window.addEventListener("blur", () => {
    releaseAllInput();
    pauseGame();
});
document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseGame();
});
window.addEventListener("resize", resizeGame);
invadersStage.addEventListener("pointerdown", handlePointerDown);
invadersStage.addEventListener("pointermove", handlePointerMove);
invadersStage.addEventListener("pointerup", releasePointer);
invadersStage.addEventListener("pointercancel", releasePointer);

showRequestedPath();
resizeGame();
debuggerObserver.observe(debuggerSection);
startAlienGlitches();
startAutoDebugCountdown();
