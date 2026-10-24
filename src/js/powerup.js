// ═══════════════════════════════════════════════════════════════════════════════
// POWER-UP — the Super Mario mushroom between Bologna and Kyiv. Ale starts with his hair (ale-slides.png).
// Walking under the ? block plays a cutscene (cutscene.js): he jumps and hits it with his head, it bumps and
// empties, a mushroom rises out of it and slides off the edge while he steps forward under it, then drops
// onto his head and he flickers into the shaved Ale (ale-shave-slides.png). He stays shaved for good, back
// to the start too, until a reload.
// Timings and distances: gameConfig.powerUp.
// ═══════════════════════════════════════════════════════════════════════════════

// Scroll position with Ale right under the block.
function getPowerUpStop() {
    return Math.round(powerUpBlockDiv.offsetLeft + .5 * powerUpBlockDiv.offsetWidth - .5 * containerDiv.offsetWidth)
}

// First on every scroll or swipe step. Walking past the block with his hair starts the cutscene, which then
// owns the step (true). A jump wider than the viewport past it (End, a jump to a later section) is no walk
// under the block: Ale is shaved at once.
function handlePowerUp() {
    const { position, delta } = scrollState;
    if (ale.isShaved || position - getPowerUpStop() <= cutsceneCrossTolerance) return false;
    if (Math.abs(delta) > containerDiv.offsetWidth) {
        usePowerUp();
        return false;
    }
    if (delta <= 0) return false;
    hitPowerUpBlock();
    return true;
}

function hitPowerUpBlock() {
    const config = gameConfig.powerUp;
    const frames = gameConfig.ale.frames;
    const stop = getPowerUpStop();
    // Bottoms in px from the container's bottom; the land is never shifted here.
    const ground = containerDiv.offsetHeight - groundAndGrassContainer1Div.offsetTop;
    const blockBottom = containerDiv.offsetHeight - powerUpBlockDiv.offsetTop - powerUpBlockDiv.offsetHeight;
    const blockHeight = powerUpBlockDiv.offsetHeight;
    const hitBottom = blockBottom - config.aleJumpReach;
    // The mushroom moves from inside the block: x from its centre, y up from its bottom.
    const headY = ground + config.aleHeadTop - blockBottom;
    startCutscene(1, stop + config.stepDistance, [
        settleAle(stop, ground),
        {
            duration: config.jumpDuration,
            start: () => setAleFrame(frames.jumpUp),
            frame: (t) => setAleBottom(ground + (hitBottom - ground) * cutsceneEaseOut(t))
        },
        {
            duration: config.fallDuration,
            start: () => {
                powerUpBlockDiv.classList.add("power-up-used");
                setAleFrame(frames.jumpDown)
            },
            frame: (t) => {
                setAleBottom(hitBottom + (ground - hitBottom) * cutsceneEaseIn(t));
                powerUpBlockDiv.style.transform = `translateY(${-config.bumpHeight * Math.sin(Math.PI * t)}px)`;
                if (t === 1) setAleStaticFrame()
            }
        },
        {
            // The block paints over the mushroom, so it comes out of it.
            duration: config.riseDuration,
            start: () => {
                powerUpMushroomDiv.style.visibility = "visible"
            },
            frame: (t) => placeMushroom(0, blockHeight * t)
        },
        {
            duration: config.stepDuration,
            frame: (t) => {
                placeMushroom(config.stepDistance * t, blockHeight);
                walkAle(stop, stop + config.stepDistance, t, config.stepDuration)
            }
        },
        {
            duration: config.dropDuration,
            frame: (t) => placeMushroom(config.stepDistance, blockHeight + (headY - blockHeight) * cutsceneEaseIn(t))
        },
        {
            duration: config.growDuration,
            start: () => {
                powerUpMushroomDiv.style.visibility = "hidden"
            },
            frame: (t) => setAleShaved(t === 1 || Math.floor(t * config.growDuration / config.growFlickerInterval) % 2 === 1)
        }
    ], usePowerUp)
}

// The block empty, the mushroom taken, Ale shaved: at the end of the cutscene, or at once after a jump.
function usePowerUp() {
    ale.isShaved = true;
    setAleShaved(true);
    powerUpBlockDiv.classList.add("power-up-used");
    powerUpBlockDiv.style.transform = "";
    powerUpMushroomDiv.style.visibility = "hidden"
}

function setAleShaved(isShaved) {
    aleDiv.classList.toggle("ale-shaved", isShaved)
}

function placeMushroom(x, y) {
    powerUpMushroomDiv.style.transform = `translate(${x}px, ${-y}px)`
}
