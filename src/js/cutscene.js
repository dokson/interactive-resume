// ═══════════════════════════════════════════════════════════════════════════════
// CUTSCENES — scripted moments that take the world over from the scroll: the pipe warps (pipes.js) and
// the power-up (powerup.js). A cutscene is a list of steps, each start() once and then frame(t) on every
// animation frame with t from 0 to 1 over its duration. The input stays locked until it ends; whatever
// scrolled meanwhile is dropped and the scroll resyncs to where the cutscene left Ale.
// ═══════════════════════════════════════════════════════════════════════════════

// Zoom makes scrollY fractional: the scroll a cutscene ends with must not read as a step back across its stop.
const cutsceneCrossTolerance = 1;

const cutsceneEaseOut = (t) => 1 - (1 - t) ** 3;
const cutsceneEaseIn = (t) => t ** 2;
const cutsceneEaseInOut = (t) => .5 - .5 * Math.cos(Math.PI * t);

// ─── Steps shared by the cutscenes ───────────────────────────────────────────
// The step that crossed the stop overshot it: the world glides back onto the stop, Ale onto his feet there.
function settleAle(position, bottom) {
    let fromPosition;
    let fromBottom;
    return {
        duration: gameConfig.cutscene.settleDuration,
        start: () => {
            fromPosition = scrollState.position;
            fromBottom = getAleBottom();
            const frames = gameConfig.ale.frames;
            if (bottom > fromBottom) setAleFrame(frames.jumpUp);
            if (bottom < fromBottom) setAleFrame(ale.isSwimming ? frames.swimDown : frames.jumpDown)
        },
        frame: (t) => {
            const eased = cutsceneEaseOut(t);
            panWorld(fromPosition, position, eased);
            setAleBottom(fromBottom + (bottom - fromBottom) * eased);
            if (t === 1) setAleStaticFrame()
        }
    };
}

// Ale walks with the world as it pans: run frames, under water too (he walks on the floor).
function walkAle(fromPosition, toPosition, t, duration) {
    const { frames, frameInterval } = gameConfig.ale;
    const runFrameCount = frames.runStop - frames.runStart + 1;
    panWorld(fromPosition, toPosition, t);
    setAleFrame(t < 1 ? frames.runStart + Math.floor(t * duration / frameInterval) % runFrameCount : frames.idle)
}

function panWorld(fromPosition, toPosition, t) {
    scrollState.position = fromPosition + (toPosition - fromPosition) * t;
    moveLayers();
    updateScrollProgress()
}

function getAleBottom() {
    return containerDiv.offsetHeight - aleContainerDiv.offsetTop - aleContainerDiv.offsetHeight
}

function setAleBottom(bottom) {
    aleContainerDiv.style.bottom = `${bottom}px`
}

function hideAle() {
    aleContainerDiv.style.visibility = "hidden"
}

function showAle() {
    aleContainerDiv.style.visibility = ""
}

// ─── Runner ──────────────────────────────────────────────────────────────────
function startCutscene(facing, endPosition, steps, onEnd) {
    disableScrollOrSwipe();
    stopFling();
    $(aleContainerDiv).stop(true);
    clearShiftAleFrameTimer();
    disableIsAleJumpingAndFalling();
    if (facing > 0) {
        faceAleRight()
    } else {
        faceAleLeft()
    }
    // The world is still where the previous step left it.
    scrollState.position = scrollState.previousPosition;
    Object.assign(cutscene, { isActive: true, steps, stepIndex: -1, startPosition: scrollState.position, endPosition, onEnd });
    runNextCutsceneStep(performance.now());
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) finishCutscene()
}

function runNextCutsceneStep(startTime) {
    cutscene.stepIndex += 1;
    const step = cutscene.steps[cutscene.stepIndex];
    if (!step) {
        endCutscene();
        return;
    }
    step.start?.();
    const loop = (time) => {
        const t = Math.min(Math.max((time - startTime) / step.duration, 0), 1);
        step.frame(t);
        if (t < 1) {
            timers.cutscene = requestAnimationFrame(loop)
        } else {
            runNextCutsceneStep(time)
        }
    };
    timers.cutscene = requestAnimationFrame(loop)
}

// Lands a cutscene at once: resize and rotation (its stops move) and reduced motion.
function finishCutscene() {
    if (!cutscene.isActive) return;
    cancelAnimationFrame(timers.cutscene);
    const { steps, stepIndex } = cutscene;
    steps[stepIndex].frame(1);
    for (const step of steps.slice(stepIndex + 1)) {
        step.start?.();
        step.frame(1)
    }
    endCutscene()
}

function endCutscene() {
    const { startPosition, endPosition, onEnd } = cutscene;
    cutscene.isActive = false;
    onEnd();
    showAle();
    setAleStaticFrame();
    // Scenes see the whole cutscene as one step.
    scrollState.previousPosition = startPosition;
    scrollState.position = endPosition;
    moveLayers();
    triggerEnteredScenes();
    scrollState.previousPosition = endPosition;
    scrollState.delta = 0;
    moveInputTo(endPosition);
    updateScrollProgress();
    enableScrollOrSwipe()
}
