// ─── Ale: layer snapping ─────────────────────────────────────────────────────
function shiftAleToGroundLevel() {
    $(aleContainerDiv).stop().animate({
        bottom: `${containerDiv.offsetHeight - groundAndGrassContainer1Div.offsetTop}px`
    }, 300, () => { })
}

function shiftAleToSeaFloor() {
    $(aleContainerDiv).stop().animate({
        bottom: `${seaFloorDiv.offsetHeight}px`
    }, 300, () => { })
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
    if (scrollState.layersMovement === "horizontal") {
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
            bottom: [containerDiv.offsetHeight - groundAndGrassContainer1Div.offsetTop + 300, "easeOutCubic"]
        }, 300, () => {
            aleJumpDown(elevationIndex);
        });
        setAleJumpUpFrame();
    }
}

function aleJumpDown(elevationIndex) {
    if (scrollState.position > ale.elevations[elevationIndex].offsetLeft - ale.rightEdge && scrollState.position < ale.elevations[elevationIndex].offsetLeft + ale.elevations[elevationIndex].offsetWidth - ale.leftEdge) {
        $(aleContainerDiv).stop().animate({
            bottom: [containerDiv.offsetHeight - ale.elevations[elevationIndex].offsetTop, "easeInCubic"]
        }, 300, () => {
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
        }, 300, () => {
            disableIsAleJumpingAndFalling();
            setAleStaticFrame()
        })
    }
}

function setAleJumpUpFrame() {
    clearShiftAleFrameTimer();
    ale.isJumping = true;
    aleFramesDiv.style.left = `${-1 * ale.startJumpFrame * ale.oneFrameWidth}px`
}

function setAleJumpDownAndFallFrame() {
    aleFramesDiv.style.left = `${-1 * ale.stopJumpFrame * ale.oneFrameWidth}px`
}

function setAleStaticFrame() {
    aleFramesDiv.style.left = "0px"
}

function disableIsAleJumpingAndFalling() {
    ale.isFalling = ale.isJumping = false
}

// ─── Ale: swim ───────────────────────────────────────────────────────────────
function aleSwimUp() {
    getSwimUpHeight();
    if (ale.swimUpHeight > 0) {
        const targetBottom = `${seaFloorDiv.offsetHeight + ale.swimUpHeight}px`,
            swimUpDuration = 3 * ale.swimUpHeight,
            swimDownDuration = 6 * ale.swimUpHeight;
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
    if (aleContainerDiv.offsetTop + aleContainerDiv.offsetHeight <= containerDiv.offsetHeight - seaFloorDiv.offsetHeight - ale.minSwimDownDistance) {
        aleFramesDiv.style.left = `${-1 * ale.swimDownFrame * ale.oneFrameWidth}px`
    } else {
        setAleStaticFrame()
    }
}

// ─── Ale: run frame animation ─────────────────────────────────────────────────
function animateAleRunSwim() {
    if (ale.canRunSwim && !ale.isJumping && !ale.isFalling && scrollState.layersMovement !== "vertical") {
        disableAnimateAleRunSwim();
        clearInterval(timers.shiftAleFrame);
        timers.shiftAleFrame = setInterval(() => {
            shiftAleFrame()
        }, ale.frameTimeInterval)
    }
}

function shiftAleFrame() {
    if (ale.isFalling) {
        clearShiftAleFrameTimer();
        setAleJumpDownAndFallFrame();
        return;
    }

    if (ale.isSwimming && ale.isBelowSeaLevel) {
        ale.startFrame = ale.startSwimFrame;
        ale.stopFrame = ale.stopSwimFrame;
    } else {
        ale.startFrame = ale.startRunFrame;
        ale.stopFrame = ale.stopRunFrame;
    }

    aleFramesDiv.style.left = `${-1 * ale.oneFrameWidth * (ale.startFrame + ale.frameIndex)}px`;

    if (ale.stopFrame < ale.startFrame + ale.frameIndex + ale.frameDirection) {
        ale.frameDirection *= -1;
    }

    if (ale.startFrame + ale.frameIndex + ale.frameDirection === ale.startFrame) {
        ale.animatePosition1 = scrollState.position;
    }

    if (ale.startFrame + ale.frameIndex + ale.frameDirection < ale.startFrame) {
        if (ale.animatePosition1 === scrollState.position) {
            ale.animatePosition2 = scrollState.position;
            clearShiftAleFrameTimer();
            if (scrollState.layersMovement === "not moving 2") {
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
    }, 4000)
}

function blinkAleEyes() {
    if (scrollState.layersMovement !== "not moving 2") {
        $(aleEyesCloseDiv).fadeTo(0, 1);
        $(aleEyesCloseDiv).stop().delay(300).animate({ opacity: 0 }, 0, () => { })
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
        aleEyesCloseDiv.style.left = "82px"
    }
    if (scrollState.delta < 0) {
        aleFramesDiv.style.top = "-200px";
        aleEyesCloseDiv.style.left = "68px"
    }
}

// ─── Ale: happy state ────────────────────────────────────────────────────────
function happyAle() {
    if (!ale.isHappy) {
        clearInterval(timers.happyAle);
        timers.happyAle = setInterval(() => { aleHandsUp() }, 3000);
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
    aleFramesDiv.style.left = "-1600px";
    setTimeout(() => { setAleStaticFrame() }, 1000)
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
    aleContainerDiv.style.bottom = `${.2 * containerDiv.offsetHeight}px`
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
