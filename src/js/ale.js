// ─── Ale: layer snapping ─────────────────────────────────────────────────────
function shiftAleToGroundLevel() {
    $(aleContainerDiv).stop().animate({
        bottom: containerDiv.offsetHeight - groundAndGrassContainer1Div.offsetTop + "px"
    }, 300, function () { })
}

function shiftAleToSeaFloor() {
    $(aleContainerDiv).stop().animate({
        bottom: seaFloorDiv.offsetHeight + "px"
    }, 300, function () { })
}

function positionLayerHorizontalToTop() {
    if (isAleSwimming) {
        setShiftUpLayerHorizontalDistance();
        for (var e = 0; e < layerHorizontalArray.length; e++) layerHorizontalArray[e].style.top = -shiftUpLayerHorizontalDistance + "px";
        for (e = 0; e < layerVerticalArray.length; e++) layerVerticalArray[e].style.bottom = shiftUpLayerHorizontalDistance + "px"
    }
}

function positionLayerHorizontalToBottom() {
    if (!isAleSwimming) {
        for (var e = 0; e < layerHorizontalArray.length; e++) layerHorizontalArray[e].style.top = "0px";
        for (e = 0; e < layerVerticalArray.length; e++) layerVerticalArray[e].style.bottom = "0px"
    }
}

// ─── Ale: jump & fall ────────────────────────────────────────────────────────
function checkAleJumpFallSwim() {
    if (layersMovement === "horizontal") {
        if (isAleSwimming) {
            if (isAleBelowSeaLevel) aleSwimUp()
        } else {
            for (var e = 0; e < elevationArray.length; e++) {
                aleJumpUp(e);
                aleFall(e)
            }
        }
    }
}

function aleJumpUp(e) {
    if (
        (previousPageVerticalPosition <= elevationArray[e].offsetLeft - aleRightEdge &&
            pageVerticalPosition > elevationArray[e].offsetLeft - aleRightEdge) ||
        (previousPageVerticalPosition >= elevationArray[e].offsetLeft + elevationArray[e].offsetWidth - aleLeftEdge &&
            pageVerticalPosition < elevationArray[e].offsetLeft + elevationArray[e].offsetWidth - aleLeftEdge)
    ) {
        positionAleAtGroundLevel();
        $(aleContainerDiv).stop().animate({
            bottom: [containerDiv.offsetHeight - groundAndGrassContainer1Div.offsetTop + 300, "easeOutCubic"]
        }, 300, function () {
            aleJumpDown(e);
        });
        setAleJumpUpFrame();
    }
}

function aleJumpDown(e) {
    if (pageVerticalPosition > elevationArray[e].offsetLeft - aleRightEdge && pageVerticalPosition < elevationArray[e].offsetLeft + elevationArray[e].offsetWidth - aleLeftEdge) {
        $(aleContainerDiv).stop().animate({
            bottom: [containerDiv.offsetHeight - elevationArray[e].offsetTop, "easeInCubic"]
        }, 300, function () {
            disableIsAleJumpingAndFalling();
            setAleStaticFrame()
        });
        setAleJumpDownAndFallFrame()
    }
}

function aleFall(e) {
    const aleIsLeavingElevation =
        (previousPageVerticalPosition < elevationArray[e].offsetLeft + elevationArray[e].offsetWidth - aleLeftEdge && pageVerticalPosition >= elevationArray[e].offsetLeft + elevationArray[e].offsetWidth - aleLeftEdge) ||
        (previousPageVerticalPosition > elevationArray[e].offsetLeft - aleRightEdge && pageVerticalPosition <= elevationArray[e].offsetLeft - aleRightEdge);
    if (aleIsLeavingElevation) {
        isAleFalling = true;
        setAleJumpDownAndFallFrame();
        $(aleContainerDiv).stop().animate({
            bottom: [containerDiv.offsetHeight - groundAndGrassContainer1Div.offsetTop, "easeInCubic"]
        }, 300, function () {
            disableIsAleJumpingAndFalling();
            setAleStaticFrame()
        })
    }
}

function setAleJumpUpFrame() {
    clearShiftAleFrameTimer();
    isAleJumping = true;
    aleFramesDiv.style.left = -1 * aleStartJumpFrame * aleOneFrameWidth + "px"
}

function setAleJumpDownAndFallFrame() {
    aleFramesDiv.style.left = -1 * aleStopJumpFrame * aleOneFrameWidth + "px"
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
        var e = seaFloorDiv.offsetHeight + swimUpHeight + "px",
            t = 3 * swimUpHeight,
            i = 6 * swimUpHeight;
        $(aleContainerDiv).stop().animate({
            bottom: e
        }, t, function () {
            aleSwimDown(i)
        })
    }
}

function aleSwimDown(e) {
    $(aleContainerDiv).stop().animate({
        bottom: seaFloorDiv.offsetHeight + "px"
    }, e, function () {
        setAleStaticFrame()
    });
    if (aleContainerDiv.offsetTop + aleContainerDiv.offsetHeight <= containerDiv.offsetHeight - seaFloorDiv.offsetHeight - minimumVerticalDistanceToTriggerAleSwimDownFrame) {
        aleFramesDiv.style.left = -1 * aleSwimDownFrame * aleOneFrameWidth + "px"
    } else {
        setAleStaticFrame()
    }
}

// ─── Ale: run frame animation ─────────────────────────────────────────────────
function animateAleRunSwim() {
    if (canAnimateAleRunSwim && !isAleJumping && !isAleFalling && layersMovement !== "vertical") {
        disableAnimateAleRunSwim();
        clearInterval(shiftAleFrameTimer);
        shiftAleFrameTimer = setInterval(function () {
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

    aleFramesDiv.style.left = -1 * aleOneFrameWidth * (aleStartFrame + aleFrameIndex) + "px";

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
    blinkAleEyesTimer = setInterval(function () {
        blinkAleEyes()
    }, 4000)
}

function blinkAleEyes() {
    if (layersMovement !== "not moving 2") {
        $(aleEyesCloseDiv).fadeTo(0, 1);
        $(aleEyesCloseDiv).stop().delay(300).animate({ opacity: 0 }, 0, function () { })
    }
}

function hideAleEyesClose() {
    $(aleEyesCloseDiv).fadeTo(0, 0)
}

function getSwimUpHeight() {
    swimUpHeight = Math.abs(deltaPageVerticalPosition);
    var e = sea1Div.offsetHeight - aleDiv.offsetHeight;
    if (e < swimUpHeight) {
        swimUpHeight = e;
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
        happyAleTimer = setInterval(function () { aleHandsUp() }, 3000);
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
    setTimeout(function () { setAleStaticFrame() }, 1000)
}

// ─── Ale: vertical positioning ───────────────────────────────────────────────
function positionSplashContainer() {
    splashContainerDiv.style.left = .5 * (containerDiv.offsetWidth - splashContainerDiv.offsetWidth) + "px"
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
                aleContainerDiv.style.bottom = containerDiv.offsetHeight - elevationArray[elevationNumberBelowAle].offsetTop + "px"
            } else {
                positionAleAtGroundLevel()
            }
        }
    }
}

function positionAleAtGroundLevel() {
    aleContainerDiv.style.bottom = .2 * containerDiv.offsetHeight + "px"
}

function positionAleAtSeaFloorLevel() {
    aleContainerDiv.style.bottom = seaFloorDiv.offsetHeight + "px"
}

function checkElevationNumberBelowAle() {
    for (var e = 0; e < elevationArray.length; e++) {
        if (pageVerticalPosition < elevationArray[e].offsetLeft + elevationArray[e].offsetWidth - aleLeftEdge && pageVerticalPosition > elevationArray[e].offsetLeft - aleRightEdge) {
            elevationNumberBelowAle = e;
            break
        }
        elevationNumberBelowAle = null
    }
}
