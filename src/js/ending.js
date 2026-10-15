// ─── Ending scene positioning ────────────────────────────────────────────────
function positionEndingContainer() {
    endingContainerDiv.style.top = `${layerVerticalArray[layerVerticalArray.length - 1].offsetTop}px`;
    endingContainerDiv.style.left = `${layerVerticalArray[layerVerticalArray.length - 1].offsetLeft}px`
}

function positionFireworksContainer() {
    fireworksContainerDiv.style.top = `${layerVerticalArray[layerVerticalArray.length - 1].offsetTop}px`;
    fireworksContainerDiv.style.left = `${layerVerticalArray[layerVerticalArray.length - 1].offsetLeft}px`
}

// ─── Fireworks ───────────────────────────────────────────────────────────────
// A Mario-style sky show on one canvas: every shape is drawn on a grid of `cellSize` px "sprite pixels" and
// stepped at a retro frame rate. Original pixel art in the manner of:
// - Super Mario Bros.: fireworks come in volleys of 1, 3 or 6, and each pops in place as a chunky burst
//   (white core, yellow, orange, ragged red rim) that grows over three frames and opens into a ring;
// - Super Mario Bros. 3: star fireworks, a dotted five-point star opening out of a rising shell;
// - Super Mario Galaxy: showers of spiky Star Bits in their six colours, and comets crossing the sky.
// Dying sparks blink out, and some leave a four-point twinkle behind.

// Sprites are rows of cells: X takes the sprite's colour, H is a white highlight, dots are empty.
const FIREWORK_SPRITES = {
    starBit: ["X.X.X", ".XXX.", "XXHXX", ".XXX.", "X.X.X"],
    twinkleSmall: ["..X..", "..X..", "XXXXX", "..X..", "..X.."],
    twinkleLarge: ["...X...", "...X...", "..XXX..", "XXXHXXX", "..XXX..", "...X...", "...X..."],
    cometHead: ["...X...", "..XXX..", "XXXXXXX", ".XXHXX.", "..XXX..", ".XX.XX.", "XX...XX"]
};

function sizeFireworksCanvas() {
    fireworksCanvas.width = fireworksContainerDiv.clientWidth;
    fireworksCanvas.height = fireworksContainerDiv.clientHeight
}

function framesFromMs(ms) {
    return Math.max(1, Math.round(ms / gameConfig.fireworks.frameInterval))
}

function startFireworks() {
    if (timers.fireworks !== undefined || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    fireworksFrame = 0;
    fireworksNextVolleyFrame = 0;
    fireworksNextCometFrame = framesFromMs(gameConfig.fireworks.cometInterval[0]);
    timers.fireworks = setRafInterval(stepFireworks, gameConfig.fireworks.frameInterval)
}

function stopFireworks() {
    clearRafInterval(timers.fireworks);
    timers.fireworks = undefined;
    fireworkLaunchQueue = [];
    fireworkShells = [];
    fireworkBursts = [];
    fireworkStars = [];
    fireworkComets = [];
    fireworkParticles = [];
    fireworksContext.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height)
}

function isFireworksSkyEmpty() {
    return [fireworkShells, fireworkBursts, fireworkStars, fireworkComets, fireworkParticles].every((list) => list.length === 0)
}

// The show is scheduled only at the end of the page; away from it the sky finishes what is in the air, then the loop stops.
function stepFireworks() {
    if (scrollState.layersMovement === LayersMovement.atRocket) {
        scheduleFireworks();
        launchQueuedFireworks()
    } else {
        fireworkLaunchQueue = [];
        if (isFireworksSkyEmpty()) {
            stopFireworks();
            return
        }
    }
    updateFireworkShells();
    updateFireworkBursts();
    updateFireworkStars();
    updateFireworkComets();
    updateFireworkParticles();
    drawFireworks();
    fireworksFrame += 1
}

function randomBetween(min, max) {
    return min + Math.random() * (max - min)
}

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)]
}

function randomFireworkLife() {
    const { particleLife } = gameConfig.fireworks;
    return Math.round(randomBetween(particleLife[0], particleLife[1]))
}

// Volleys of 1, 3 or 6 (the Super Mario Bros. flagpole rule), and a comet now and then.
function scheduleFireworks() {
    const { volleySizes, volleyInterval, volleyStagger, cometInterval } = gameConfig.fireworks;
    if (fireworksFrame >= fireworksNextVolleyFrame) {
        const size = randomItem(volleySizes);
        for (let i = 0; i < size; i++) fireworkLaunchQueue.push(fireworksFrame + i * framesFromMs(volleyStagger));
        fireworksNextVolleyFrame = fireworksFrame + size * framesFromMs(volleyStagger) + framesFromMs(volleyInterval)
    }
    if (fireworksFrame >= fireworksNextCometFrame) {
        launchFireworkComet();
        fireworksNextCometFrame = fireworksFrame + framesFromMs(randomBetween(cometInterval[0], cometInterval[1]))
    }
}

function launchQueuedFireworks() {
    const dueCount = fireworkLaunchQueue.filter((frame) => frame <= fireworksFrame).length;
    fireworkLaunchQueue = fireworkLaunchQueue.filter((frame) => frame > fireworksFrame);
    for (let i = 0; i < dueCount; i++) launchFirework()
}

// A burst pops in place, as in Super Mario Bros.; star fireworks and Star Bits rise as a shell first,
// with just the speed they need to stop (and open) at their chosen height.
function launchFirework() {
    const { showMix, launchSpread, burstHeight, shellGravity, shellDrift } = gameConfig.fireworks;
    const kind = randomItem(showMix);
    const x = fireworksCanvas.width * randomBetween(launchSpread[0], launchSpread[1]);
    const y = fireworksCanvas.height * randomBetween(burstHeight[0], burstHeight[1]);
    if (kind === "burst") {
        popFireworkBurst(x, y, 1);
        return
    }
    fireworkShells.push({ x, y: fireworksCanvas.height, vx: randomBetween(-shellDrift, shellDrift), vy: -Math.sqrt(2 * shellGravity * (fireworksCanvas.height - y)), kind })
}

function popFireworkBurst(x, y, scale) {
    const { burstSparks, burstSparkSpeed, burstColors, particleGravity } = gameConfig.fireworks;
    fireworkBursts.push({ x, y, frame: 0, scale });
    for (let i = 0; i < burstSparks; i++) {
        const angle = (i / burstSparks) * 2 * Math.PI;
        const speed = randomBetween(burstSparkSpeed[0], burstSparkSpeed[1]) * scale;
        fireworkParticles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, gravity: particleGravity, life: randomFireworkLife(), color: randomItem(burstColors.slice(1)), twinkles: i % 3 === 0 })
    }
}

function updateFireworkShells() {
    const { shellGravity, trailColor, trailLife } = gameConfig.fireworks;
    for (const shell of fireworkShells) {
        shell.x += shell.vx;
        shell.y += shell.vy;
        shell.vy += shellGravity;
        fireworkParticles.push({ x: shell.x, y: shell.y, vx: randomBetween(-0.3, 0.3), vy: randomBetween(0.3, 1), gravity: 0, life: trailLife, color: trailColor })
    }
    for (const shell of fireworkShells) if (shell.vy >= 0) openFireworkShell(shell);
    fireworkShells = fireworkShells.filter((shell) => shell.vy < 0)
}

function openFireworkShell(shell) {
    const { starRadius, palette, starBits, starBitSpeed, starBitPalette, particleGravity } = gameConfig.fireworks;
    if (shell.kind === "star") {
        fireworkStars.push({ x: shell.x, y: shell.y, frame: 0, radius: randomBetween(starRadius[0], starRadius[1]), color: randomItem(palette) });
        return
    }
    popFireworkBurst(shell.x, shell.y, 0.5);
    for (let i = 0; i < starBits; i++) {
        const angle = randomBetween(0, 2 * Math.PI);
        const speed = randomBetween(starBitSpeed[0], starBitSpeed[1]);
        fireworkParticles.push({ x: shell.x, y: shell.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.5, gravity: particleGravity, life: randomFireworkLife(), color: randomItem(starBitPalette), sprite: FIREWORK_SPRITES.starBit, twinkles: true })
    }
}

function updateFireworkBursts() {
    const { burstRadius, burstFrameHold } = gameConfig.fireworks;
    for (const burst of fireworkBursts) burst.frame += 1;
    fireworkBursts = fireworkBursts.filter((burst) => burst.frame < burstRadius.length * burstFrameHold)
}

// A star firework opens for a few frames, then its dots fall away as sparks; its tips twinkle.
function updateFireworkStars() {
    const { starGrowFrames, particleGravity } = gameConfig.fireworks;
    for (const star of fireworkStars) {
        star.frame += 1;
        if (star.frame < starGrowFrames) continue;
        for (const point of starOutline(star, 1)) {
            fireworkParticles.push({ x: point.x, y: point.y, vx: (point.x - star.x) * 0.02, vy: (point.y - star.y) * 0.02, gravity: particleGravity * 0.6, life: randomFireworkLife(), color: point.isTip ? "#ffffff" : star.color, twinkles: point.isTip })
        }
    }
    fireworkStars = fireworkStars.filter((star) => star.frame < starGrowFrames)
}

// Dots every `starDotSpacing` cells along a five-point star; `progress` 0–1 eases the star open.
function starOutline(star, progress) {
    const { cellSize, starDotSpacing } = gameConfig.fireworks;
    const outerRadius = star.radius * cellSize * (1 - (1 - progress) ** 3);
    const vertices = [];
    for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outerRadius : outerRadius * 0.42;
        const angle = -Math.PI / 2 + i * Math.PI / 5;
        vertices.push({ x: star.x + Math.cos(angle) * radius, y: star.y + Math.sin(angle) * radius })
    }
    const points = [];
    for (let i = 0; i < 10; i++) {
        const from = vertices[i];
        const to = vertices[(i + 1) % 10];
        const steps = Math.max(1, Math.round(Math.hypot(to.x - from.x, to.y - from.y) / (starDotSpacing * cellSize)));
        for (let j = 0; j < steps; j++) points.push({ x: from.x + (to.x - from.x) * j / steps, y: from.y + (to.y - from.y) * j / steps, isTip: j === 0 && i % 2 === 0 })
    }
    return points
}

function launchFireworkComet() {
    const { cometSpeed, cometHeight, cometTailPalettes } = gameConfig.fireworks;
    const fromLeft = Math.random() < 0.5;
    const speed = randomBetween(cometSpeed[0], cometSpeed[1]);
    fireworkComets.push({
        x: fromLeft ? -40 : fireworksCanvas.width + 40,
        y: fireworksCanvas.height * randomBetween(cometHeight[0], cometHeight[1]),
        vx: fromLeft ? speed : -speed,
        vy: speed * 0.3,
        trail: [],
        tailColors: randomItem(cometTailPalettes)
    })
}

// A comet moves in two half steps per frame, so its tail has no gaps; it drops twinkles as it goes.
function updateFireworkComets() {
    const { cometTail, cometSparkleEvery, sparkleLife } = gameConfig.fireworks;
    for (const comet of fireworkComets) {
        for (let i = 0; i < 2; i++) {
            comet.trail.unshift({ x: comet.x, y: comet.y });
            comet.x += comet.vx / 2;
            comet.y += comet.vy / 2
        }
        comet.trail.length = Math.min(comet.trail.length, cometTail);
        if (fireworksFrame % cometSparkleEvery === 0) addFireworkTwinkle(comet.trail[comet.trail.length - 1].x, comet.trail[comet.trail.length - 1].y, sparkleLife)
    }
    fireworkComets = fireworkComets.filter((comet) => comet.x > -80 && comet.x < fireworksCanvas.width + 80 && comet.y < fireworksCanvas.height)
}

function addFireworkTwinkle(x, y, life) {
    fireworkParticles.push({ x, y, vx: 0, vy: 0, gravity: 0, life, color: "#ffffff", twinkle: true })
}

function updateFireworkParticles() {
    const { particleDrag, sparkleLife } = gameConfig.fireworks;
    const twinkles = [];
    for (const particle of fireworkParticles) {
        particle.vx *= particleDrag;
        particle.vy = particle.vy * particleDrag + particle.gravity;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 1;
        if (particle.life === 0 && particle.twinkles) twinkles.push(particle)
    }
    fireworkParticles = fireworkParticles.filter((particle) => particle.life > 0);
    for (const particle of twinkles) addFireworkTwinkle(particle.x, particle.y, sparkleLife)
}

function snapToCell(value) {
    const { cellSize } = gameConfig.fireworks;
    return Math.round(value / cellSize) * cellSize
}

function drawFireworkCell(x, y, color) {
    const { cellSize } = gameConfig.fireworks;
    fireworksContext.fillStyle = color;
    fireworksContext.fillRect(x, y, cellSize, cellSize)
}

function drawFireworkSprite(rows, x, y, color) {
    const { cellSize } = gameConfig.fireworks;
    const left = snapToCell(x) - Math.floor(rows[0].length / 2) * cellSize;
    const top = snapToCell(y) - Math.floor(rows.length / 2) * cellSize;
    for (let row = 0; row < rows.length; row++) {
        for (let column = 0; column < rows[row].length; column++) {
            const cell = rows[row][column];
            if (cell === ".") continue;
            drawFireworkCell(left + column * cellSize, top + row * cellSize, cell === "H" ? "#ffffff" : color)
        }
    }
}

function burstColorIndex(distance) {
    if (distance < 0.35) return 0;
    if (distance < 0.6) return 1;
    return distance < 0.8 ? 2 : 3
}

// The burst: a disc of cells that grows each frame (white core, yellow, orange, a ragged red rim)
// and opens into a ring on its last frame.
function drawFireworkBurst(burst) {
    const { cellSize, burstRadius, burstFrameHold, burstColors } = gameConfig.fireworks;
    const step = Math.min(Math.floor(burst.frame / burstFrameHold), burstRadius.length - 1);
    const radius = burstRadius[step] * burst.scale;
    const cells = Math.ceil(radius);
    const isLastStep = step === burstRadius.length - 1;
    for (let row = -cells; row <= cells; row++) {
        for (let column = -cells; column <= cells; column++) {
            const distance = Math.hypot(row, column) / radius;
            if (distance > 1 || (distance > 0.8 && (row + column) % 2 !== 0) || (isLastStep && distance < 0.45)) continue;
            drawFireworkCell(snapToCell(burst.x) + column * cellSize, snapToCell(burst.y) + row * cellSize, burstColors[burstColorIndex(distance)])
        }
    }
}

// The tail runs from white at the head through the comet's colours; its far half thins out.
function drawFireworkComet(comet) {
    const { cellSize } = gameConfig.fireworks;
    for (let i = 0; i < comet.trail.length; i++) {
        if (i > comet.trail.length / 2 && i % 2 === 1) continue;
        const color = comet.tailColors[Math.min(comet.tailColors.length - 1, Math.floor(i / comet.trail.length * comet.tailColors.length))];
        drawFireworkCell(snapToCell(comet.trail[i].x), snapToCell(comet.trail[i].y), color);
        if (i < comet.trail.length / 3) drawFireworkCell(snapToCell(comet.trail[i].x), snapToCell(comet.trail[i].y) + cellSize, color)
    }
    drawFireworkSprite(FIREWORK_SPRITES.cometHead, comet.x, comet.y, "#fff200")
}

function drawFireworks() {
    const { flickerFrames, starGrowFrames } = gameConfig.fireworks;
    fireworksContext.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
    for (const comet of fireworkComets) drawFireworkComet(comet);
    for (const star of fireworkStars) {
        for (const point of starOutline(star, star.frame / starGrowFrames)) drawFireworkCell(snapToCell(point.x), snapToCell(point.y), point.isTip ? "#ffffff" : star.color)
    }
    for (const burst of fireworkBursts) drawFireworkBurst(burst);
    for (const particle of fireworkParticles) {
        if (particle.twinkle) {
            drawFireworkSprite(particle.life % 4 < 2 ? FIREWORK_SPRITES.twinkleLarge : FIREWORK_SPRITES.twinkleSmall, particle.x, particle.y, particle.color);
            continue
        }
        // Dying sparks blink on alternate frames, like the sprites of the 8-bit era.
        if (particle.life < flickerFrames && particle.life % 2 === 0) continue;
        if (particle.sprite) drawFireworkSprite(particle.sprite, particle.x, particle.y, particle.color);
        else drawFireworkCell(snapToCell(particle.x), snapToCell(particle.y), particle.color)
    }
}

// ─── Rocket portal to the About page ─────────────────────────────────────────
// The rocket can be boarded only at the end of the page; before that it is inert.
function setRocketBoardable(isBoardable) {
    if (flags.isRocketLaunching) return;
    rocketDiv.inert = !isBoardable;
    rocketDiv.classList.toggle("rocket-boardable", isBoardable)
}

function initRocketPortal() {
    rocketDiv.addEventListener("click", boardRocket)
}

// Reduced motion, or a rocket not boardable yet, keeps the plain link: the browser navigates immediately.
function boardRocket(event) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || rocketDiv.inert) return;
    event.preventDefault();
    if (flags.isRocketLaunching) return;
    flags.isRocketLaunching = true;
    rocketDiv.classList.add("rocket-launching");
    disableScrollOrSwipe();
    clearHappyAleTimer();
    clearShiftAleFrameTimer();
    boardAleInRocket()
        .then(liftOffRocket)
        .then(() => { window.location.assign(rocketDiv.href) })
        .catch((error) => {
            // resetRocketLaunch() cancels the animations when the page comes back from the back/forward cache
            if (error.name !== "AbortError") throw error
        })
}

function playLaunchAnimation(element, keyframes, options) {
    const animation = element.animate(keyframes, options);
    rocketLaunchAnimations.push(animation);
    return animation
}

// Ale walks back behind the rocket's front to the spot he rides in during the climb, then climbs up
// by world.aleRocketPaddingBottom, so his face shows through the porthole exactly as on the way up.
// Resolves to his boarded offset, which the lift-off carries along with the rocket.
async function boardAleInRocket() {
    const { aleWalkDuration, aleClimbDuration } = gameConfig.launch;
    const { runStart, runStop } = gameConfig.ale.frames;
    const boarded = { x: ale.maxHorizontalDistance - aleContainerDiv.offsetLeft, y: -gameConfig.world.aleRocketPaddingBottom };
    let frame = runStart;
    faceAleLeft();
    clearRafInterval(timers.launchWalk);
    timers.launchWalk = setRafInterval(() => {
        setAleFrame(frame);
        frame = frame === runStart ? runStop : runStart
    }, gameConfig.ale.frameInterval);
    await playLaunchAnimation(aleContainerDiv, [{ transform: "translate(0, 0)" }, { transform: `translate(${boarded.x}px, 0)` }], { duration: aleWalkDuration, easing: "linear", fill: "forwards" }).finished;
    clearRafInterval(timers.launchWalk);
    setAleStaticFrame();
    await playLaunchAnimation(aleContainerDiv, [{ transform: `translate(${boarded.x}px, 0)` }, { transform: `translate(${boarded.x}px, ${boarded.y}px)` }], { duration: aleClimbDuration, easing: "ease-out", fill: "forwards" }).finished;
    return boarded
}

// The exhaust ignites while the rocket shakes, then the rocket accelerates out of the top of the screen;
// Ale, behind the porthole, shakes and lifts off with it.
async function liftOffRocket(boarded) {
    const { ignitionDuration, shakeDistance, shakeInterval, exhaustFlickerInterval, liftOffDuration } = gameConfig.launch;
    const liftOffDistance = rocketDiv.getBoundingClientRect().bottom - containerDiv.getBoundingClientRect().top + rocketExhaustDiv.offsetHeight;
    const shake = (element, x, y) => playLaunchAnimation(element, [
        { transform: `translate(${x}px, ${y}px)` },
        { transform: `translate(${x - shakeDistance}px, ${y}px)` },
        { transform: `translate(${x + shakeDistance}px, ${y}px)` },
        { transform: `translate(${x}px, ${y}px)` }
    ], { duration: shakeInterval, iterations: Math.round(ignitionDuration / shakeInterval) });
    const liftOff = (element, x, y) => playLaunchAnimation(element, [
        { transform: `translate(${x}px, ${y}px)` },
        { transform: `translate(${x}px, ${y - liftOffDistance}px)` }
    ], { duration: liftOffDuration, easing: "cubic-bezier(0.55, 0, 1, 0.45)", fill: "forwards" });
    const movers = [[rocketBackDiv, 0, 0], [rocketFrontDiv, 0, 0], [aleContainerDiv, boarded.x, boarded.y]];
    for (const [element, x, y] of movers) shake(element, x, y);
    await playLaunchAnimation(rocketExhaustDiv, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: ignitionDuration, easing: "ease-out", fill: "forwards" }).finished;
    playLaunchAnimation(rocketExhaustDiv, [{ transform: "scaleY(1)" }, { transform: "scaleY(0.75)" }], { duration: exhaustFlickerInterval, direction: "alternate", iterations: Infinity });
    await Promise.all(movers.map(([element, x, y]) => liftOff(element, x, y).finished))
}

function resetRocketLaunch() {
    for (const animation of rocketLaunchAnimations) animation.cancel();
    rocketLaunchAnimations = [];
    clearRafInterval(timers.launchWalk);
    setAleStaticFrame();
    rocketDiv.classList.remove("rocket-launching");
    flags.isRocketLaunching = false;
    enableScrollOrSwipe();
    detectPageVerticalPosition();
    runTheseFunctionsAfterScrollOrSwipe()
}
