// ─── Scroll / swipe control ──────────────────────────────────────────────────
function orientationChangeHandler(event) {
    disableScrollOrSwipe();
    setTimeout(() => {
        $(window).trigger("resize")
    }, 500)
}

function enableScrollOrSwipe() {
    canScrollOrSwipe = true
}

function disableScrollOrSwipe() {
    canScrollOrSwipe = false
}

// ─── Touch events ────────────────────────────────────────────────────────────
function initTouchEvents() {
    document.addEventListener("touchstart", handleStart, false);
    document.addEventListener("touchmove", handleMove, false);
    document.addEventListener("touchend", handleEnd, false)
}

function handleStart(event) {
    touchStartX = event.targetTouches[0].pageX;
    pageVerticalPositionOnTouch = pageVerticalPosition
}

function handleMove(event) {
    event.preventDefault();
    touchCurrentX = event.targetTouches[0].pageX;
    if (canScrollOrSwipe) {
        detectPageVerticalPosition();
        runTheseFunctionsAfterScrollOrSwipe()
    }
}

function handleEnd(event) {
    event.preventDefault();
    touchEndX = event.changedTouches[0].pageX
}

// ─── Scroll / swipe dispatch ─────────────────────────────────────────────────
function runTheseFunctionsAfterScrollOrSwipe() {
    orientAle();
    checkAleJumpFallSwim();
    moveLayers();
    shiftUpDownHorizontalLayers();
    animateInformationAndEnemiesElements();
    animateAleRunSwim();
    hideScrollOrSwipeTextContainer();
    hideContactConfirmationContainer();
    deviceFunctionScrollSwipe()
}

function deviceFunctionScrollSwipe() {
    deviceName !== "computer" && layersMovement === "vertical" && positionHorizontalLayersToHaveSameRightPosition()
}

// ─── Container & preloader ───────────────────────────────────────────────────
function showContainer() {
    containerDiv.setAttribute("class", "")
}

function shiftUpHorizontalLayersAfterEverythingLoaded() {
    for (let i = 0; i < layerHorizontalArray.length; i++)
        $(layerHorizontalArray[i]).stop().animate({
            top: "0px"
        }, 1000, () => {
            finishShiftUpHorizontalLayersAfterEverythingLoaded()
        })
}

function finishShiftUpHorizontalLayersAfterEverythingLoaded() {
    if (canFinishShiftUpHorizontalLayersAfterEverythingLoaded) {
        isPreloadShiftUpAnimationFinish = !(canFinishShiftUpHorizontalLayersAfterEverythingLoaded = false);
        makePageScrollable();
        shiftDownAleContainer();
        animateScrollOrSwipeTextContainer()
    }
}

function shiftDownAleContainer() {
    setAleJumpDownAndFallFrame();
    $(aleContainerDiv).stop().animate({
        bottom: "20%"
    }, 500, () => {
        setAleStaticFrame();
        enableAnimateAleRunSwim()
    });
}

function makePageScrollable() {
    contentDiv.setAttribute("class", "");
    enableScrollOrSwipe()
}

// ─── Page dimensions ─────────────────────────────────────────────────────────
function setFrontLayerVerticalHeight() {
    layerVerticalArray[layerVerticalArray.length - 1].style.height = 2 * containerDiv.offsetHeight + bannersContainerDiv.offsetHeight + gapBetweenContactCloudAndBannersContainer + "px"
}

function setBannersContainerVerticalPosition() {
    bannersContainerDiv.style.bottom = containerDiv.offsetHeight + "px"
}

function setPageHeight() {
    pageDiv.style.height = layerHorizontalArray[layerHorizontalArray.length - 1].offsetWidth - containerDiv.offsetWidth + layerVerticalArray[layerVerticalArray.length - 1].offsetHeight + distanceBetweenAleAndRocket + "px"
}

function setLayerSpeed() {
    for (; layerHorizontalSpeedArray.length > 0;)
        layerHorizontalSpeedArray.pop();
    for (; layerVerticalSpeedArray.length > 0;)
        layerVerticalSpeedArray.pop();
    for (let i = 0; i < layerHorizontalArray.length; i++) {
        const speed = (layerHorizontalArray[i].offsetWidth - containerDiv.offsetWidth) / (layerHorizontalArray[layerHorizontalArray.length - 1].offsetWidth - containerDiv.offsetWidth);
        layerHorizontalSpeedArray.push(speed)
    }
    for (let i = 0; i < layerVerticalArray.length; i++) {
        const speed = (layerVerticalArray[i].offsetHeight - containerDiv.offsetHeight) / (layerVerticalArray[layerVerticalArray.length - 1].offsetHeight - containerDiv.offsetHeight);
        layerVerticalSpeedArray.push(speed)
    }
}

// ─── Scroll position & layer movement ────────────────────────────────────────
function detectPageVerticalPosition() {
    previousPageVerticalPosition = pageVerticalPosition;
    if (deviceName === "computer") {
        pageVerticalPosition = window.scrollY
    } else {
        pageVerticalPosition = pageVerticalPositionOnTouch + (touchStartX - touchCurrentX);
        if (pageVerticalPosition < 0) pageVerticalPosition = 0;
        if (pageVerticalPosition > pageDiv.offsetHeight - containerDiv.offsetHeight)
            pageVerticalPosition = pageDiv.offsetHeight - containerDiv.offsetHeight
    }
    deltaPageVerticalPosition = pageVerticalPosition - previousPageVerticalPosition;
    if (pageVerticalPosition <= 0) {
        resetVariables();
        resetFunctions()
    }
}

function moveLayers() {
    setLayersMovement();
    if (layersMovement === "horizontal") {
        for (let i = 0; i < layerHorizontalArray.length; i++) {
            const layerOffset = -1 * layerHorizontalSpeedArray[i] * pageVerticalPosition;
            layerHorizontalArray[i].style.left = layerOffset + "px";
        }
        positionLayerHorizontalToBottom();
        clearHappyAleTimer();
        positionVerticalLayersHorizontally();
    }
    if (layersMovement === "vertical") {
        const lastHorizontalLayer = layerHorizontalArray[layerHorizontalArray.length - 1];
        const horizontalOffset = pageVerticalPosition - (lastHorizontalLayer.offsetWidth - containerDiv.offsetWidth);

        for (let i = 0; i < layerVerticalArray.length; i++) {
            const layerOffset = -1 * layerVerticalSpeedArray[i] * horizontalOffset;
            layerVerticalArray[i].style.bottom = layerOffset + "px";
        }
        positionVerticalLayersAtLeftMost();
        positionHorizontalLayersToHaveSameRightPosition();
        positionHorizontalLayersVertically();
        clearShiftAleFrameTimer();
        clearHappyAleTimer();
    }
    if (layersMovement === "not moving 1") {
        positionLayersWhenNotMoving();
        clearHappyAleTimer();
    }
    if (layersMovement === "not moving 2") {
        positionLayersWhenNotMoving();
        animateLinksContainer();
        happyAle();
        drawManyFireworks();
    }
    positionRocketAndAleContainerHorizontally();
    positionContactContainer();
    positionFireworksContainer();
}

function setLayersMovement() {
    if (pageVerticalPosition * layerHorizontalSpeedArray[layerHorizontalSpeedArray.length - 1] <= layerHorizontalArray[layerHorizontalArray.length - 1].offsetWidth - containerDiv.offsetWidth) {
        layersMovement = "horizontal"
    } else if (pageVerticalPosition >= pageDiv.offsetHeight - containerDiv.offsetHeight - distanceBetweenAleAndRocket && pageVerticalPosition < pageDiv.offsetHeight - containerDiv.offsetHeight) {
        layersMovement = "not moving 1"
    } else if (pageVerticalPosition >= pageDiv.offsetHeight - containerDiv.offsetHeight) {
        layersMovement = "not moving 2"
    } else {
        layersMovement = "vertical"
    }
}

// ─── Layer positioning utilities ─────────────────────────────────────────────
function positionLayersWhenNotMoving() {
    positionVerticalLayersAtLeftMost();
    positionVerticalLayersToHaveSameTopPosition();
    positionHorizontalLayersAtBottomMost();
    positionHorizontalLayersToHaveSameRightPosition();
}

function positionVerticalLayersAtLeftMost() {
    for (let i = 0; i < layerVerticalArray.length; i++)
        layerVerticalArray[i].style.left = "0px"
}

function positionHorizontalLayersToHaveSameRightPosition() {
    for (let i = 0; i < layerHorizontalArray.length; i++)
        layerHorizontalArray[i].style.left = containerDiv.offsetWidth - layerHorizontalArray[i].offsetWidth + "px"
}

function positionHorizontalLayersVertically() {
    for (let i = 0; i < layerHorizontalArray.length; i++)
        layerHorizontalArray[i].style.top = layerVerticalArray[layerVerticalArray.length - 1].offsetTop + layerVerticalArray[layerVerticalArray.length - 1].offsetHeight - containerDiv.offsetHeight + "px"
}

function positionHorizontalLayersAtBottomMost() {
    for (let i = 0; i < layerHorizontalArray.length; i++)
        layerHorizontalArray[i].style.top = layerVerticalArray[layerVerticalArray.length - 1].offsetHeight - containerDiv.offsetHeight + "px"
}

function setAleLeftAndRightEdge() {
    aleRightEdge = .5 * (containerDiv.offsetWidth + aleDiv.offsetWidth) - 65;
    aleLeftEdge = .5 * (containerDiv.offsetWidth - aleDiv.offsetWidth) + 65
}

function positionVerticalLayersToHaveSameTopPosition() {
    for (let i = 0; i < layerVerticalArray.length; i++)
        layerVerticalArray[i].style.bottom = containerDiv.offsetHeight - layerVerticalArray[i].offsetHeight + "px"
}

function positionVerticalLayersBottomToHorizontalLayersBottom() {
    for (let i = 0; i < layerVerticalArray.length; i++)
        layerVerticalArray[i].style.bottom = -1 * layerHorizontalArray[i].offsetTop + "px"
}

// ─── Horizontal layer shift ──────────────────────────────────────────────────
function shiftUpDownHorizontalLayers() {
    const aleIsEnteringSea =
        (previousPageVerticalPosition < sea1Div.offsetLeft - aleLeftEdge || previousPageVerticalPosition > sea1Div.offsetLeft + sea1Div.offsetWidth - aleRightEdge) &&
        pageVerticalPosition >= sea1Div.offsetLeft - aleLeftEdge &&
        pageVerticalPosition <= sea1Div.offsetLeft + sea1Div.offsetWidth - aleRightEdge;
    if (aleIsEnteringSea) {
        isAleSwimming = true;
        shiftUpLayerHorizontal();
        shiftAleToSeaFloor();
        createBubble()
    }

    const aleIsLeavingSea =
        previousPageVerticalPosition >= sea1Div.offsetLeft - aleLeftEdge &&
        previousPageVerticalPosition <= sea1Div.offsetLeft + sea1Div.offsetWidth - aleRightEdge &&
        (pageVerticalPosition < sea1Div.offsetLeft - aleLeftEdge || pageVerticalPosition > sea1Div.offsetLeft + sea1Div.offsetWidth - aleRightEdge);
    if (aleIsLeavingSea) {
        isAleSwimming = false;
        shiftDownLayerHorizontal();
        shiftAleToGroundLevel();
        clearInterval(bubbleTimer);
        clearInterval(blinkSeaAnimalsTimer)
    }
}

function shiftUpDownHorizontalLayersOnResize() {
    const aleIsInSea =
        pageVerticalPosition >= sea1Div.offsetLeft - aleLeftEdge &&
        pageVerticalPosition <= sea1Div.offsetLeft + sea1Div.offsetWidth - aleRightEdge;
    if (aleIsInSea) {
        clearShiftUpDownLayerHorizontalTimer();
        isAleSwimming = true;
        positionLayerHorizontalToTop();
        positionVerticalLayersBottomToHorizontalLayersBottom();
        createBubble()
    }

    const aleIsOutsideSea =
        pageVerticalPosition < sea1Div.offsetLeft - aleLeftEdge ||
        pageVerticalPosition > sea1Div.offsetLeft + sea1Div.offsetWidth - aleRightEdge;
    if (aleIsOutsideSea) {
        clearShiftUpDownLayerHorizontalTimer();
        isAleSwimming = false;
        if (layersMovement === "horizontal") {
            positionLayerHorizontalToBottom();
            positionVerticalLayersBottomToHorizontalLayersBottom()
        } else {
            positionHorizontalLayersAtBottomMost();
            positionHorizontalLayersToHaveSameRightPosition()
        }
        clearInterval(bubbleTimer);
        clearInterval(blinkSeaAnimalsTimer)
    }
}

function setShiftUpLayerHorizontalDistance() {
    shiftUpLayerHorizontalDistance = .75 * containerDiv.offsetHeight
}

function shiftUpLayerHorizontal() {
    setShiftUpLayerHorizontalDistance();
    clearShiftUpDownLayerHorizontalTimer();
    shiftUpLayerHorizontalTimer = setInterval(() => {
        moveUpLayerHorizontal()
    }, shiftUpDownLayerHorizontalInterval);
    disableIsAleJumpingAndFalling()
}

function moveUpLayerHorizontal() {
    if (layersMovement === "horizontal") {
        for (let i = 0; i < layerHorizontalArray.length; i++) {
            let newTop = layerHorizontalArray[i].offsetTop - shiftUpDownLayerHorizontalIncrement;
            if (newTop <= -shiftUpLayerHorizontalDistance) {
                newTop = -shiftUpLayerHorizontalDistance;
                layerHorizontalArray[i].style.top = newTop + "px";
                clearInterval(shiftUpLayerHorizontalTimer)
            } else {
                layerHorizontalArray[i].style.top = newTop + "px"
            }
            if (aleContainerDiv.offsetTop > sea1Div.offsetTop + layerHorizontalArray[layerHorizontalArray.length - 1].offsetTop)
                isAleBelowSeaLevel = true
        }
        positionVerticalLayersBottomToHorizontalLayersBottom()
    } else {
        resetLayersWhenNotHorizontal(shiftUpLayerHorizontalTimer);
    }
}

function shiftDownLayerHorizontal() {
    clearShiftUpDownLayerHorizontalTimer();
    shiftDownLayerHorizontalTimer = setInterval(() => {
        moveDownLayerHorizontal()
    }, shiftUpDownLayerHorizontalInterval)
}

function moveDownLayerHorizontal() {
    if (layersMovement === "horizontal") {
        for (let i = 0; i < layerHorizontalArray.length; i++) {
            let newTop = layerHorizontalArray[i].offsetTop + shiftUpDownLayerHorizontalIncrement;
            if (newTop >= 0) {
                newTop = 0;
                layerHorizontalArray[i].style.top = newTop + "px";
                clearInterval(shiftDownLayerHorizontalTimer)
            } else {
                layerHorizontalArray[i].style.top = newTop + "px"
            }
            if (aleContainerDiv.offsetTop < sea1Div.offsetTop + layerHorizontalArray[layerHorizontalArray.length - 1].offsetTop)
                isAleBelowSeaLevel = false
        }
        positionVerticalLayersBottomToHorizontalLayersBottom()
    } else {
        resetLayersWhenNotHorizontal(shiftDownLayerHorizontalTimer);
    }
}

function resetLayersWhenNotHorizontal(timerToClear) {
    clearInterval(timerToClear);
    positionHorizontalLayersAtBottomMost();
    positionHorizontalLayersToHaveSameRightPosition();
    isAleBelowSeaLevel = false;
}

function clearShiftUpDownLayerHorizontalTimer() {
    clearInterval(shiftUpLayerHorizontalTimer);
    clearInterval(shiftDownLayerHorizontalTimer)
}

// ─── Layer & rocket positioning ──────────────────────────────────────────────
function positionVerticalLayersHorizontally() {
    for (let i = 0; i < layerVerticalArray.length; i++) layerVerticalArray[i].style.left = layerHorizontalArray[i].offsetLeft + layerHorizontalArray[i].offsetWidth - containerDiv.offsetWidth + "px"
}

function positionRocketAndAleContainerHorizontally() {
    const lastLayerSpeed = layerHorizontalSpeedArray[layerHorizontalSpeedArray.length - 1];
    const lastLayer = layerHorizontalArray[layerHorizontalArray.length - 1];

    const horizontalOffset = pageVerticalPosition * lastLayerSpeed - (lastLayer.offsetWidth - containerDiv.offsetWidth);

    aleMaxHorizontalDistance = (containerDiv.offsetWidth * 0.5) + 332;

    let alePosition = (containerDiv.offsetWidth * 0.5) + horizontalOffset;

    if (aleMaxHorizontalDistance <= alePosition) {
        alePosition = aleMaxHorizontalDistance;
    }

    const rocketMaxPosition = (containerDiv.offsetWidth * 0.5) + 170;
    let rocketPosition = (containerDiv.offsetWidth - rocketDiv.offsetWidth) * 0.5 + horizontalOffset;

    if (rocketMaxPosition <= rocketPosition) {
        rocketPosition = rocketMaxPosition;
    }

    switch (layersMovement) {
        case "vertical":
            rocketDiv.style.left = rocketPosition + "px";
            aleContainerDiv.style.left = alePosition + "px";
            aleContainerDiv.style.padding = "0px 0px 150px 0px";
            break;

        case "not moving 1":
        case "not moving 2":
            const pageOffset = pageVerticalPosition -
                (pageDiv.offsetHeight - containerDiv.offsetHeight - distanceBetweenAleAndRocket);

            aleContainerDiv.style.left = (alePosition + pageOffset) + "px";
            aleContainerDiv.style.padding = "0px 0px 0px 0px";
            rocketDiv.style.left = rocketPosition + "px";
            break;

        default:
            const rocketFollowPosition = lastLayer.offsetLeft +
                lastLayer.offsetWidth -
                (containerDiv.offsetWidth + rocketDiv.offsetWidth) * 0.5;

            rocketDiv.style.left = rocketFollowPosition + "px";
            aleContainerDiv.style.left = "50%";
            aleContainerDiv.style.padding = "0px 0px 0px 0px";
            break;
    }
}
