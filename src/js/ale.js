// ─── Ale: layer snapping ─────────────────────────────────────────────────────
function setAleFrame(frameIndex) {
    aleFramesDiv.style.left = `${-1 * frameIndex * gameConfig.ale.frameWidth}px`
}

function shiftAleToGroundLevel() {
    $(aleContainerDiv).stop().animate({
        bottom: `${containerDiv.offsetHeight - groundAndGrassContainer1Div.offsetTop}px`
    }, gameConfig.ale.snapDuration)
}

function shiftAleToSeaFloor() {
    $(aleContainerDiv).stop().animate({
        bottom: `${seaFloorDiv.offsetHeight}px`
    }, gameConfig.ale.snapDuration)
}

function positionLayerHorizontalToTop() {
    if (ale.isSwimming) {
        setShiftUpLayerHorizontalDistance();
        for (const layer of layerHorizontalArray) layer.style.top = `${-shiftUpLayerHorizontalDistance}px`;
        for (const layer of layerVerticalArray) layer.style.bottom = `${shiftUpLayerHorizontalDistance}px`
    }
}

function positionLayerHorizontalToBottom() {
    if (!ale.isSwimming) {
        for (const layer of layerHorizontalArray) layer.style.top = "0px";
        for (const layer of layerVerticalArray) layer.style.bottom = "0px"
    }
}

// ─── Ale: jump & fall ────────────────────────────────────────────────────────
function checkAleJumpFallSwim() {
    if (scrollState.layersMovement === LayersMovement.horizontal) {
        if (ale.isSwimming) {
            if (ale.isBelowSeaLevel) aleSwimUp()
        } else {
            for (let i = 0; i < ale.elevations.length; i++) {
                aleJumpUp(i);
                aleFall(i)
            }
        }
    }
}

function aleJumpUp(elevationIndex) {
    if (
        (scrollState.previousPosition <= ale.elevations[elevationIndex].offsetLeft - ale.rightEdge &&
            scrollState.position > ale.elevations[elevationIndex].offsetLeft - ale.rightEdge) ||
        (scrollState.previousPosition >= ale.elevations[elevationIndex].offsetLeft + ale.elevations[elevationIndex].offsetWidth - ale.leftEdge &&
            scrollState.position < ale.elevations[elevationIndex].offsetLeft + ale.elevations[elevationIndex].offsetWidth - ale.leftEdge)
    ) {
        positionAleAtGroundLevel();
        $(aleContainerDiv).stop().animate({
            bottom: [containerDiv.offsetHeight - groundAndGrassContainer1Div.offsetTop + gameConfig.ale.jump.height, "easeOutCubic"]
        }, gameConfig.ale.jump.upDuration, () => {
            aleJumpDown(elevationIndex);
        });
        setAleJumpUpFrame();
    }
}

function aleJumpDown(elevationIndex) {
    if (scrollState.position > ale.elevations[elevationIndex].offsetLeft - ale.rightEdge && scrollState.position < ale.elevations[elevationIndex].offsetLeft + ale.elevations[elevationIndex].offsetWidth - ale.leftEdge) {
        $(aleContainerDiv).stop().animate({
            bottom: [containerDiv.offsetHeight - ale.elevations[elevationIndex].offsetTop, "easeInCubic"]
        }, gameConfig.ale.jump.downDuration, () => {
            disableIsAleJumpingAndFalling();
            setAleStaticFrame()
        });
        setAleJumpDownAndFallFrame()
    }
}

function aleFall(elevationIndex) {
    const aleIsLeavingElevation =
        (scrollState.previousPosition < ale.elevations[elevationIndex].offsetLeft + ale.elevations[elevationIndex].offsetWidth - ale.leftEdge && scrollState.position >= ale.elevations[elevationIndex].offsetLeft + ale.elevations[elevationIndex].offsetWidth - ale.leftEdge) ||
        (scrollState.previousPosition > ale.elevations[elevationIndex].offsetLeft - ale.rightEdge && scrollState.position <= ale.elevations[elevationIndex].offsetLeft - ale.rightEdge);
    if (aleIsLeavingElevation) {
        ale.isFalling = true;
        setAleJumpDownAndFallFrame();
        $(aleContainerDiv).stop().animate({
            bottom: [containerDiv.offsetHeight - groundAndGrassContainer1Div.offsetTop, "easeInCubic"]
        }, gameConfig.ale.fallDuration, () => {
            disableIsAleJumpingAndFalling();
            setAleStaticFrame()
        })
    }
}

function setAleJumpUpFrame() {
    clearShiftAleFrameTimer();
    ale.isJumping = true;
    setAleFrame(gameConfig.ale.frames.jumpUp)
}

function setAleJumpDownAndFallFrame() {
    setAleFrame(gameConfig.ale.frames.jumpDown)
}

function setAleStaticFrame() {
    setAleFrame(gameConfig.ale.frames.idle)
}

function disableIsAleJumpingAndFalling() {
    ale.isFalling = false;
    ale.isJumping = false
}

// ─── Ale: swim ───────────────────────────────────────────────────────────────
function aleSwimUp() {
    getSwimUpHeight();
    if (ale.swimUpHeight > 0) {
        const targetBottom = `${seaFloorDiv.offsetHeight + ale.swimUpHeight}px`;
        const swimUpDuration = gameConfig.ale.swim.upMsPerPx * ale.swimUpHeight;
        const swimDownDuration = gameConfig.ale.swim.downMsPerPx * ale.swimUpHeight;
        $(aleContainerDiv).stop().animate({
            bottom: targetBottom
        }, swimUpDuration, () => {
            aleSwimDown(swimDownDuration)
        })
    }
}

function aleSwimDown(duration) {
    $(aleContainerDiv).stop().animate({
        bottom: `${seaFloorDiv.offsetHeight}px`
    }, duration, () => {
        setAleStaticFrame()
    });
    if (aleContainerDiv.offsetTop + aleContainerDiv.offsetHeight <= containerDiv.offsetHeight - seaFloorDiv.offsetHeight - gameConfig.ale.swim.minDownDistance) {
        setAleFrame(gameConfig.ale.frames.swimDown)
    } else {
        setAleStaticFrame()
    }
}

// ─── Ale: run frame animation ─────────────────────────────────────────────────
function animateAleRunSwim() {
    if (ale.canRunSwim && !ale.isJumping && !ale.isFalling && scrollState.layersMovement !== LayersMovement.vertical) {
        disableAnimateAleRunSwim();
        clearInterval(timers.shiftAleFrame);
        timers.shiftAleFrame = setInterval(() => {
            shiftAleFrame()
        }, gameConfig.ale.frameInterval)
    }
}

function shiftAleFrame() {
    if (ale.isFalling) {
        clearShiftAleFrameTimer();
        setAleJumpDownAndFallFrame();
        return;
    }

    const frames = gameConfig.ale.frames;
    if (ale.isSwimming && ale.isBelowSeaLevel) {
        ale.startFrame = frames.swimStart;
        ale.stopFrame = frames.swimStop;
    } else {
        ale.startFrame = frames.runStart;
        ale.stopFrame = frames.runStop;
    }

    setAleFrame(ale.startFrame + ale.frameIndex);

    if (ale.stopFrame < ale.startFrame + ale.frameIndex + ale.frameDirection) {
        ale.frameDirection *= -1;
    }

    if (ale.startFrame + ale.frameIndex + ale.frameDirection === ale.startFrame) {
        ale.animatePosition1 = scrollState.position;
    }

    if (ale.startFrame + ale.frameIndex + ale.frameDirection < ale.startFrame) {
        if (ale.animatePosition1 === scrollState.position) {
            clearShiftAleFrameTimer();
            if (scrollState.layersMovement === LayersMovement.atRocket) {
                aleHandsUp();
            }
            return;
        }
        ale.frameDirection *= -1;
    }
    ale.frameIndex += ale.frameDirection;
}

function clearShiftAleFrameTimer() {
    clearInterval(timers.shiftAleFrame);
    if (!ale.isSwimming || (ale.isSwimming && aleContainerDiv.offsetTop + aleContainerDiv.offsetHeight >= containerDiv.offsetHeight - seaFloorDiv.offsetHeight))
        setAleStaticFrame();
    ale.frameIndex = 0;
    ale.frameDirection = 1;
    enableAnimateAleRunSwim()
}

function enableAnimateAleRunSwim() {
    ale.canRunSwim = true
}

function disableAnimateAleRunSwim() {
    ale.canRunSwim = false
}

// ─── Ale: eyes & blink ───────────────────────────────────────────────────────
function animateAleEyes() {
    clearRafInterval(timers.blinkAleEyes);
    timers.blinkAleEyes = setRafInterval(() => {
        blinkAleEyes()
    }, gameConfig.ale.blinkInterval)
}

function blinkAleEyes() {
    if (scrollState.layersMovement !== LayersMovement.atRocket) {
        flashElement(aleEyesCloseDiv, gameConfig.ale.blinkDuration)
    }
}

function hideAleEyesClose() {
    $(aleEyesCloseDiv).fadeTo(0, 0)
}

function getSwimUpHeight() {
    ale.swimUpHeight = Math.abs(scrollState.delta);
    const maxSwimHeight = sea1Div.offsetHeight - aleDiv.offsetHeight;
    if (maxSwimHeight < ale.swimUpHeight) {
        ale.swimUpHeight = maxSwimHeight;
    }
}

// ─── Ale: orientation ─────────────────────────────────────────────────────────
function orientAle() {
    if (scrollState.delta > 0) {
        aleFramesDiv.style.top = "0px";
        aleEyesCloseDiv.style.left = `${gameConfig.ale.eyesCloseOffsetRight}px`
    }
    if (scrollState.delta < 0) {
        aleFramesDiv.style.top = `${-gameConfig.ale.frameHeight}px`;
        aleEyesCloseDiv.style.left = `${gameConfig.ale.eyesCloseOffsetLeft}px`
    }
}

// ─── Ale: happy state ────────────────────────────────────────────────────────
function happyAle() {
    if (!ale.isHappy) {
        clearInterval(timers.happyAle);
        timers.happyAle = setInterval(() => { aleHandsUp() }, gameConfig.ale.happy.interval);
        ale.isHappy = true
    }
}

function clearHappyAleTimer() {
    if (ale.isHappy) {
        clearInterval(timers.happyAle);
        ale.isHappy = false
    }
}

function aleHandsUp() {
    setAleFrame(gameConfig.ale.frames.handsUp);
    setTimeout(() => { setAleStaticFrame() }, gameConfig.ale.happy.handsUpDuration)
}

// ─── Ale: vertical positioning ───────────────────────────────────────────────
function positionSplashContainer() {
    splashContainerDiv.style.left = `${.5 * (containerDiv.offsetWidth - splashContainerDiv.offsetWidth)}px`
}

function positionAleContainerVertically() {
    if (flags.preloadShiftUpDone) {
        $(aleContainerDiv).stop(true, false);
        setAleStaticFrame();
        if (ale.isSwimming) {
            positionAleAtSeaFloorLevel()
        } else {
            checkElevationNumberBelowAle();
            if (ale.elevationBelow != null) {
                aleContainerDiv.style.bottom = `${containerDiv.offsetHeight - ale.elevations[ale.elevationBelow].offsetTop}px`
            } else {
                positionAleAtGroundLevel()
            }
        }
    }
}

function positionAleAtGroundLevel() {
    aleContainerDiv.style.bottom = `${gameConfig.ale.groundLevelRatio * containerDiv.offsetHeight}px`
}

function positionAleAtSeaFloorLevel() {
    aleContainerDiv.style.bottom = `${seaFloorDiv.offsetHeight}px`
}

function checkElevationNumberBelowAle() {
    for (let i = 0; i < ale.elevations.length; i++) {
        if (scrollState.position < ale.elevations[i].offsetLeft + ale.elevations[i].offsetWidth - ale.leftEdge && scrollState.position > ale.elevations[i].offsetLeft - ale.rightEdge) {
            ale.elevationBelow = i;
            break
        }
        ale.elevationBelow = null
    }
}
