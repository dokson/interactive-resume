// ═══════════════════════════════════════════════════════════════════════════════
// PIPES — Super Mario warps between the levels. Levels 1 and 3 are on land, level 2 is the sea between
// them, and each land level reaches the sea through one pipe (state.js `pipes`): a mouth on top, standing
// on the land, and one in the sea's wall. Walking into a mouth plays the warp (a cutscene, cutscene.js):
// Ale sinks into the top mouth, the camera dives with him and he walks out of the side mouth onto the sea
// floor, or the same in reverse. Timings: gameConfig.pipes.
// ═══════════════════════════════════════════════════════════════════════════════
const seaLevel = 2;

// ─── Stops and levels ────────────────────────────────────────────────────────
// Scroll positions (Ale at the viewport centre) along a pipe:
//   land    Ale stands on the top mouth
//   inside  Ale is just hidden inside the side mouth
//   sea     Ale stands in the water, just clear of the side mouth
function getPipeStops(pipe) {
    const halfViewport = .5 * containerDiv.offsetWidth;
    const halfAle = gameConfig.pipes.aleHalfWidth;
    const { topDiv, mouthDiv, towardSea } = pipe;
    const mouthEdge = towardSea > 0 ? mouthDiv.offsetLeft + mouthDiv.offsetWidth : mouthDiv.offsetLeft;
    return {
        land: Math.round(topDiv.offsetLeft + .5 * topDiv.offsetWidth - halfViewport),
        inside: Math.round(mouthEdge - towardSea * halfAle - halfViewport),
        sea: Math.round(mouthEdge + towardSea * halfAle - halfViewport)
    };
}

// Where Ale can stand in a level: between two levels he is inside a pipe.
function getLevelRange(level) {
    const dive = getPipeStops(divePipe);
    const climb = getPipeStops(climbPipe);
    if (level === divePipe.landLevel) return { min: 0, max: dive.land };
    if (level === seaLevel) return { min: dive.sea, max: climb.sea };
    return { min: climb.land, max: Infinity };
}

function getLevelAt(position) {
    const dive = getPipeStops(divePipe);
    const climb = getPipeStops(climbPipe);
    if (position < .5 * (dive.land + dive.sea)) return divePipe.landLevel;
    if (position < .5 * (climb.sea + climb.land)) return seaLevel;
    return climbPipe.landLevel;
}

// A resize moves the stops and a jump can end inside a pipe: Ale goes back to where he can stand.
function clampPositionToLevel() {
    const { min, max } = getLevelRange(scrollState.level);
    const position = Math.min(Math.max(scrollState.position, min), max);
    if (position !== scrollState.position) moveInputTo(position)
}

// Swim state, camera and sea timers for the current level, without a warp (resize, jumps).
function applyLevelState() {
    const isSea = scrollState.level === seaLevel;
    ale.isSwimming = isSea;
    ale.isBelowSeaLevel = isSea;
    if (isSea) {
        positionLayerHorizontalToTop();
        createBubble()
    } else {
        if (scrollState.layersMovement === LayersMovement.horizontal) {
            positionLayerHorizontalToBottom()
        } else {
            positionHorizontalLayersAtBottomMost();
            positionHorizontalLayersToHaveSameRightPosition()
        }
        stopSeaTimers()
    }
}

function stopSeaTimers() {
    clearInterval(timers.bubble);
    clearInterval(timers.blinkSeaAnimals)
}

// ─── Scroll dispatch ─────────────────────────────────────────────────────────
// First on every scroll or swipe step, before anything moves. Walking past a stop toward its other mouth
// starts the warp, which then owns the step (true). A jump wider than the viewport (Home, End) is no walk:
// the level follows the position directly.
function handlePipes() {
    const { position, delta } = scrollState;
    if (Math.abs(delta) > containerDiv.offsetWidth) {
        const level = getLevelAt(position);
        const isNewLevel = level !== scrollState.level;
        scrollState.level = level;
        clampPositionToLevel();
        if (isNewLevel) {
            applyLevelState();
            positionAleContainerVertically();
            // A jump is no swim stroke: Ale stays on the sea floor.
            scrollState.delta = 0
        }
        return false;
    }
    for (const pipe of pipes) {
        const stops = getPipeStops(pipe);
        // 1 toward the side mouth, -1 toward the top one
        const direction = Math.sign(delta) * pipe.towardSea;
        if (scrollState.level === pipe.landLevel && direction > 0 && (position - stops.land) * pipe.towardSea > cutsceneCrossTolerance) {
            diveIntoPipe(pipe, stops);
            return true;
        }
        if (scrollState.level === seaLevel && direction < 0 && (stops.sea - position) * pipe.towardSea > cutsceneCrossTolerance) {
            surfaceThroughPipe(pipe, stops);
            return true;
        }
    }
    return false;
}

// ─── Warps ───────────────────────────────────────────────────────────────────
// Land → sea: Ale settles on the top mouth and sinks into it; hidden, he rides the camera down to the side
// mouth and walks out onto the sea floor.
function diveIntoPipe(pipe, stops) {
    const { sinkDepth, sinkDuration, transitDuration, walkDuration } = gameConfig.pipes;
    const topBottom = getPipeTopBottom(pipe);
    startCutscene(pipe.towardSea, stops.sea, [
        settleAle(stops.land, topBottom),
        { duration: sinkDuration, frame: (t) => setAleBottom(topBottom - sinkDepth * t) },
        {
            duration: transitDuration,
            // Between the mouths the pipe already covers him; hidden, he cannot show through the gaps of the bend.
            start: () => {
                hideAle();
                ale.isSwimming = true;
                setShiftUpLayerHorizontalDistance()
            },
            frame: (t) => moveCamera(stops.land, stops.inside, 0, 1, t)
        },
        {
            duration: walkDuration,
            start: () => {
                setAleBottom(seaFloorDiv.offsetHeight);
                showAle()
            },
            frame: (t) => walkAle(stops.inside, stops.sea, t, walkDuration)
        }
    ], () => {
        scrollState.level = seaLevel;
        ale.isBelowSeaLevel = true;
        createBubble()
    })
}

// Sea → land, the dive backwards: Ale walks into the side mouth, rides the camera up and rises out of the
// top mouth.
function surfaceThroughPipe(pipe, stops) {
    const { sinkDepth, sinkDuration, transitDuration, walkDuration } = gameConfig.pipes;
    const topBottom = getPipeTopBottom(pipe);
    startCutscene(-pipe.towardSea, stops.land, [
        settleAle(stops.sea, seaFloorDiv.offsetHeight),
        { duration: walkDuration, frame: (t) => walkAle(stops.sea, stops.inside, t, walkDuration) },
        {
            duration: transitDuration,
            start: () => {
                hideAle();
                ale.isBelowSeaLevel = false;
                stopSeaTimers();
                setShiftUpLayerHorizontalDistance()
            },
            frame: (t) => moveCamera(stops.inside, stops.land, 1, 0, t)
        },
        {
            duration: sinkDuration,
            start: () => {
                ale.isSwimming = false;
                setAleBottom(topBottom - sinkDepth);
                showAle()
            },
            frame: (t) => setAleBottom(topBottom - sinkDepth * (1 - t))
        }
    ], () => {
        scrollState.level = pipe.landLevel
    })
}

// Pans the world and moves the camera between the land (depth 0) and the sea (depth 1).
function moveCamera(fromPosition, toPosition, fromDepth, toDepth, t) {
    const eased = cutsceneEaseInOut(t);
    shiftCamera((fromDepth + (toDepth - fromDepth) * eased) * shiftUpLayerHorizontalDistance);
    panWorld(fromPosition, toPosition, eased)
}

// Standing on a top mouth: the land is never shifted then.
function getPipeTopBottom(pipe) {
    return containerDiv.offsetHeight - pipe.topDiv.offsetTop
}
