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
    if (isAleSwimming) {
        setShiftUpLayerHorizontalDistance();
        for (const layer of layerHorizontalArray) layer.style.top = `${-shiftUpLayerHorizontalDistance}px`;
        for (const layer of layerVerticalArray) layer.style.bottom = `${shiftUpLayerHorizontalDistance}px`
    }
}

function positionLayerHorizontalToBottom() {
    if (!isAleSwimming) {
        for (const layer of layerHorizontalArray) layer.style.top = "0px";
        for (const layer of layerVerticalArray) layer.style.bottom = "0px"
    }
}

// ─── Ale: jump & fall ────────────────────────────────────────────────────────
function checkAleJumpFallSwim() {
    if (layersMovement === "horizontal") {
        if (isAleSwimming) {
            if (isAleBelowSeaLevel) aleSwimUp()
        } else {
            for (let i = 0; i < elevationArray.length; i++) {
                aleJumpUp(i);
                aleFall(i)
            }
        }
    }
}

function aleJumpUp(elevationIndex) {
    if (
        (previousPageVerticalPosition <= elevationArray[elevationIndex].offsetLeft - aleRightEdge &&
            pageVerticalPosition > elevationArray[elevationIndex].offsetLeft - aleRightEdge) ||
        (previousPageVerticalPosition >= elevationArray[elevationIndex].offsetLeft + elevationArray[elevationIndex].offsetWidth - aleLeftEdge &&
            pageVerticalPosition < elevationArray[elevationIndex].offsetLeft + elevationArray[elevationIndex].offsetWidth - aleLeftEdge)
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
    if (pageVerticalPosition > elevationArray[elevationIndex].offsetLeft - aleRightEdge && pageVerticalPosition < elevationArray[elevationIndex].offsetLeft + elevationArray[elevationIndex].offsetWidth - aleLeftEdge) {
        $(aleContainerDiv).stop().animate({
            bottom: [containerDiv.offsetHeight - elevationArray[elevationIndex].offsetTop, "easeInCubic"]
        }, 300, () => {
            disableIsAleJumpingAndFalling();
            setAleStaticFrame()
        });
        setAleJumpDownAndFallFrame()
    }
}

function aleFall(elevationIndex) {
    const aleIsLeavingElevation =
        (previousPageVerticalPosition < elevationArray[elevationIndex].offsetLeft + elevationArray[elevationIndex].offsetWidth - aleLeftEdge && pageVerticalPosition >= elevationArray[elevationIndex].offsetLeft + elevationArray[elevationIndex].offsetWidth - aleLeftEdge) ||
        (previousPageVerticalPosition > elevationArray[elevationIndex].offsetLeft - aleRightEdge && pageVerticalPosition <= elevationArray[elevationIndex].offsetLeft - aleRightEdge);
    if (aleIsLeavingElevation) {
        isAleFalling = true;
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
    isAleJumping = true;
    aleFramesDiv.style.left = `${-1 * aleStartJumpFrame * aleOneFrameWidth}px`
}

function setAleJumpDownAndFallFrame() {
    aleFramesDiv.style.left = `${-1 * aleStopJumpFrame * aleOneFrameWidth}px`
}

function setAleStaticFrame() {
    aleFramesDiv.style.left = "0px"
}

function disableIsAleJumpingAndFalling() {
    isAleFalling = isAleJumping = false
}

// ─── Ale: swim ───────────────────────────────────────────────────────────────
function aleSwimUp() {
    getSwimUpHeight();
    if (swimUpHeight > 0) {
        const targetBottom = `${seaFloorDiv.offsetHeight + swimUpHeight}px`,
            swimUpDuration = 3 * swimUpHeight,
            swimDownDuration = 6 * swimUpHeight;
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
    if (aleContainerDiv.offsetTop + aleContainerDiv.offsetHeight <= containerDiv.offsetHeight - seaFloorDiv.offsetHeight - minimumVerticalDistanceToTriggerAleSwimDownFrame) {
        aleFramesDiv.style.left = `${-1 * aleSwimDownFrame * aleOneFrameWidth}px`
    } else {
        setAleStaticFrame()
    }
}

// ─── Ale: run frame animation ─────────────────────────────────────────────────
function animateAleRunSwim() {
    if (canAnimateAleRunSwim && !isAleJumping && !isAleFalling && layersMovement !== "vertical") {
        disableAnimateAleRunSwim();
        clearInterval(shiftAleFrameTimer);
        shiftAleFrameTimer = setInterval(() => {
            shiftAleFrame()
        }, shiftAleFrameTimeInterval)
    }
}

function shiftAleFrame() {
    if (isAleFalling) {
        clearShiftAleFrameTimer();
        setAleJumpDownAndFallFrame();
        return;
    }

    if (isAleSwimming && isAleBelowSeaLevel) {
        aleStartFrame = aleStartSwimFrame;
        aleStopFrame = aleStopSwimFrame;
    } else {
        aleStartFrame = aleStartRunFrame;
        aleStopFrame = aleStopRunFrame;
    }

    aleFramesDiv.style.left = `${-1 * aleOneFrameWidth * (aleStartFrame + aleFrameIndex)}px`;

    if (aleStopFrame < aleStartFrame + aleFrameIndex + aleFrameDirection) {
        aleFrameDirection *= -1;
    }

    if (aleStartFrame + aleFrameIndex + aleFrameDirection === aleStartFrame) {
        pageVerticalPositionWhenAnimateAle1 = pageVerticalPosition;
    }

    if (aleStartFrame + aleFrameIndex + aleFrameDirection < aleStartFrame) {
        if (pageVerticalPositionWhenAnimateAle1 === pageVerticalPosition) {
            pageVerticalPositionWhenAnimateAle2 = pageVerticalPosition;
            clearShiftAleFrameTimer();
            if (layersMovement === "not moving 2") {
                aleHandsUp();
            }
            return;
        }
        aleFrameDirection *= -1;
    }
    aleFrameIndex += aleFrameDirection;
}

function clearShiftAleFrameTimer() {
    clearInterval(shiftAleFrameTimer);
    if (!isAleSwimming || (isAleSwimming && aleContainerDiv.offsetTop + aleContainerDiv.offsetHeight >= containerDiv.offsetHeight - seaFloorDiv.offsetHeight))
        setAleStaticFrame();
    aleFrameIndex = 0;
    aleFrameDirection = 1;
    enableAnimateAleRunSwim()
}

function enableAnimateAleRunSwim() {
    canAnimateAleRunSwim = true
}

function disableAnimateAleRunSwim() {
    canAnimateAleRunSwim = false
}

// ─── Ale: eyes & blink ───────────────────────────────────────────────────────
function animateAleEyes() {
    clearInterval(blinkAleEyesTimer);
    blinkAleEyesTimer = setInterval(() => {
        blinkAleEyes()
    }, 4000)
}

function blinkAleEyes() {
    if (layersMovement !== "not moving 2") {
        $(aleEyesCloseDiv).fadeTo(0, 1);
        $(aleEyesCloseDiv).stop().delay(300).animate({ opacity: 0 }, 0, () => { })
    }
}

function hideAleEyesClose() {
    $(aleEyesCloseDiv).fadeTo(0, 0)
}

function getSwimUpHeight() {
    swimUpHeight = Math.abs(deltaPageVerticalPosition);
    const maxSwimHeight = sea1Div.offsetHeight - aleDiv.offsetHeight;
    if (maxSwimHeight < swimUpHeight) {
        swimUpHeight = maxSwimHeight;
    }
}

// ─── Ale: orientation ─────────────────────────────────────────────────────────
function orientAle() {
    if (deltaPageVerticalPosition > 0) {
        aleFramesDiv.style.top = "0px";
        aleEyesCloseDiv.style.left = "82px"
    }
    if (deltaPageVerticalPosition < 0) {
        aleFramesDiv.style.top = "-200px";
        aleEyesCloseDiv.style.left = "68px"
    }
}

// ─── Ale: happy state ────────────────────────────────────────────────────────
function happyAle() {
    if (!isAleHappy) {
        clearInterval(happyAleTimer);
        happyAleTimer = setInterval(() => { aleHandsUp() }, 3000);
        isAleHappy = true
    }
}

function clearHappyAleTimer() {
    if (isAleHappy) {
        clearInterval(happyAleTimer);
        isAleHappy = false
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
    if (isPreloadShiftUpAnimationFinish) {
        $(aleContainerDiv).stop(true, false);
        setAleStaticFrame();
        if (isAleSwimming) {
            positionAleAtSeaFloorLevel()
        } else {
            checkElevationNumberBelowAle();
            if (elevationNumberBelowAle != null) {
                aleContainerDiv.style.bottom = `${containerDiv.offsetHeight - elevationArray[elevationNumberBelowAle].offsetTop}px`
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
    for (let i = 0; i < elevationArray.length; i++) {
        if (pageVerticalPosition < elevationArray[i].offsetLeft + elevationArray[i].offsetWidth - aleLeftEdge && pageVerticalPosition > elevationArray[i].offsetLeft - aleRightEdge) {
            elevationNumberBelowAle = i;
            break
        }
        elevationNumberBelowAle = null
    }
}
