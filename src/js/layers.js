// ─── Scroll / swipe control ──────────────────────────────────────────────────
function orientationChangeHandler(event) {
    disableScrollOrSwipe();
    setTimeout(() => {
        $(window).trigger("resize")
    }, 500)
}

function enableScrollOrSwipe() {
    scrollState.canScrollOrSwipe = true
}

function disableScrollOrSwipe() {
    scrollState.canScrollOrSwipe = false
}

// ─── Touch events ────────────────────────────────────────────────────────────
function initTouchEvents() {
    document.addEventListener("touchstart", handleStart, false);
    document.addEventListener("touchmove", handleMove, false);
    document.addEventListener("touchend", handleEnd, false)
}

function handleStart(event) {
    scrollState.touchStartX = event.targetTouches[0].pageX;
    scrollState.positionOnTouch = scrollState.position
}

function handleMove(event) {
    event.preventDefault();
    scrollState.touchCurrentX = event.targetTouches[0].pageX;
    if (scrollState.canScrollOrSwipe) {
        detectPageVerticalPosition();
        runTheseFunctionsAfterScrollOrSwipe()
    }
}

function handleEnd(event) {
    event.preventDefault();
    scrollState.touchEndX = event.changedTouches[0].pageX
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
    deviceName !== "computer" && scrollState.layersMovement === "vertical" && positionHorizontalLayersToHaveSameRightPosition()
}

// ─── Container & preloader ───────────────────────────────────────────────────
function showContainer() {
    containerDiv.className = ""
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
    if (flags.canFinishShiftUp) {
        flags.canFinishShiftUp = false;
        flags.preloadShiftUpDone = true;
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
    contentDiv.className = "";
    enableScrollOrSwipe()
}

// ─── Page dimensions ─────────────────────────────────────────────────────────
function setFrontLayerVerticalHeight() {
    layerVerticalArray[layerVerticalArray.length - 1].style.height = `${2 * containerDiv.offsetHeight + bannersContainerDiv.offsetHeight + gapBetweenContactCloudAndBannersContainer}px`
}

function setBannersContainerVerticalPosition() {
    bannersContainerDiv.style.bottom = `${containerDiv.offsetHeight}px`
}

function setPageHeight() {
    pageDiv.style.height = `${layerHorizontalArray[layerHorizontalArray.length - 1].offsetWidth - containerDiv.offsetWidth + layerVerticalArray[layerVerticalArray.length - 1].offsetHeight + distanceBetweenAleAndRocket}px`
}

function setLayerSpeed() {
    layerHorizontalSpeedArray.length = 0;
    layerVerticalSpeedArray.length = 0;
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
    scrollState.previousPosition = scrollState.position;
    if (deviceName === "computer") {
        scrollState.position = window.scrollY
    } else {
        scrollState.position = scrollState.positionOnTouch + (scrollState.touchStartX - scrollState.touchCurrentX);
        if (scrollState.position < 0) scrollState.position = 0;
        if (scrollState.position > pageDiv.offsetHeight - containerDiv.offsetHeight)
            scrollState.position = pageDiv.offsetHeight - containerDiv.offsetHeight
    }
    scrollState.delta = scrollState.position - scrollState.previousPosition;
    if (scrollState.position <= 0) {
        resetVariables();
        resetFunctions()
    }
}

function moveLayers() {
    setLayersMovement();
    if (scrollState.layersMovement === "horizontal") {
        for (let i = 0; i < layerHorizontalArray.length; i++) {
            const layerOffset = -1 * layerHorizontalSpeedArray[i] * scrollState.position;
            layerHorizontalArray[i].style.left = `${layerOffset}px`;
        }
        positionLayerHorizontalToBottom();
        clearHappyAleTimer();
        positionVerticalLayersHorizontally();
    }
    if (scrollState.layersMovement === "vertical") {
        const lastHorizontalLayer = layerHorizontalArray[layerHorizontalArray.length - 1];
        const horizontalOffset = scrollState.position - (lastHorizontalLayer.offsetWidth - containerDiv.offsetWidth);

        for (let i = 0; i < layerVerticalArray.length; i++) {
            const layerOffset = -1 * layerVerticalSpeedArray[i] * horizontalOffset;
            layerVerticalArray[i].style.bottom = `${layerOffset}px`;
        }
        positionVerticalLayersAtLeftMost();
        positionHorizontalLayersToHaveSameRightPosition();
        positionHorizontalLayersVertically();
        clearShiftAleFrameTimer();
        clearHappyAleTimer();
    }
    if (scrollState.layersMovement === "not moving 1") {
        positionLayersWhenNotMoving();
        clearHappyAleTimer();
    }
    if (scrollState.layersMovement === "not moving 2") {
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
    if (scrollState.position * layerHorizontalSpeedArray[layerHorizontalSpeedArray.length - 1] <= layerHorizontalArray[layerHorizontalArray.length - 1].offsetWidth - containerDiv.offsetWidth) {
        scrollState.layersMovement = "horizontal"
    } else if (scrollState.position >= pageDiv.offsetHeight - containerDiv.offsetHeight - distanceBetweenAleAndRocket && scrollState.position < pageDiv.offsetHeight - containerDiv.offsetHeight) {
        scrollState.layersMovement = "not moving 1"
    } else if (scrollState.position >= pageDiv.offsetHeight - containerDiv.offsetHeight) {
        scrollState.layersMovement = "not moving 2"
    } else {
        scrollState.layersMovement = "vertical"
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
    for (const layer of layerVerticalArray)
        layer.style.left = "0px"
}

function positionHorizontalLayersToHaveSameRightPosition() {
    for (const layer of layerHorizontalArray)
        layer.style.left = `${containerDiv.offsetWidth - layer.offsetWidth}px`
}

function positionHorizontalLayersVertically() {
    const lastVertical = layerVerticalArray[layerVerticalArray.length - 1];
    for (const layer of layerHorizontalArray)
        layer.style.top = `${lastVertical.offsetTop + lastVertical.offsetHeight - containerDiv.offsetHeight}px`
}

function positionHorizontalLayersAtBottomMost() {
    for (const layer of layerHorizontalArray)
        layer.style.top = `${layerVerticalArray[layerVerticalArray.length - 1].offsetHeight - containerDiv.offsetHeight}px`
}

function setAleLeftAndRightEdge() {
    ale.rightEdge = .5 * (containerDiv.offsetWidth + aleDiv.offsetWidth) - 65;
    ale.leftEdge = .5 * (containerDiv.offsetWidth - aleDiv.offsetWidth) + 65
}

function positionVerticalLayersToHaveSameTopPosition() {
    for (const layer of layerVerticalArray)
        layer.style.bottom = `${containerDiv.offsetHeight - layer.offsetHeight}px`
}

function positionVerticalLayersBottomToHorizontalLayersBottom() {
    for (let i = 0; i < layerVerticalArray.length; i++)
        layerVerticalArray[i].style.bottom = `${-1 * layerHorizontalArray[i].offsetTop}px`
}

// ─── Horizontal layer shift ──────────────────────────────────────────────────
function shiftUpDownHorizontalLayers() {
    const aleIsEnteringSea =
        (scrollState.previousPosition < sea1Div.offsetLeft - ale.leftEdge || scrollState.previousPosition > sea1Div.offsetLeft + sea1Div.offsetWidth - ale.rightEdge) &&
        scrollState.position >= sea1Div.offsetLeft - ale.leftEdge &&
        scrollState.position <= sea1Div.offsetLeft + sea1Div.offsetWidth - ale.rightEdge;
    if (aleIsEnteringSea) {
        ale.isSwimming = true;
        shiftUpLayerHorizontal();
        shiftAleToSeaFloor();
        createBubble()
    }

    const aleIsLeavingSea =
        scrollState.previousPosition >= sea1Div.offsetLeft - ale.leftEdge &&
        scrollState.previousPosition <= sea1Div.offsetLeft + sea1Div.offsetWidth - ale.rightEdge &&
        (scrollState.position < sea1Div.offsetLeft - ale.leftEdge || scrollState.position > sea1Div.offsetLeft + sea1Div.offsetWidth - ale.rightEdge);
    if (aleIsLeavingSea) {
        ale.isSwimming = false;
        shiftDownLayerHorizontal();
        shiftAleToGroundLevel();
        clearInterval(timers.bubble);
        clearInterval(timers.blinkSeaAnimals)
    }
}

function shiftUpDownHorizontalLayersOnResize() {
    const aleIsInSea =
        scrollState.position >= sea1Div.offsetLeft - ale.leftEdge &&
        scrollState.position <= sea1Div.offsetLeft + sea1Div.offsetWidth - ale.rightEdge;
    if (aleIsInSea) {
        clearShiftUpDownLayerHorizontalTimer();
        ale.isSwimming = true;
        positionLayerHorizontalToTop();
        positionVerticalLayersBottomToHorizontalLayersBottom();
        createBubble()
    }

    const aleIsOutsideSea =
        scrollState.position < sea1Div.offsetLeft - ale.leftEdge ||
        scrollState.position > sea1Div.offsetLeft + sea1Div.offsetWidth - ale.rightEdge;
    if (aleIsOutsideSea) {
        clearShiftUpDownLayerHorizontalTimer();
        ale.isSwimming = false;
        if (scrollState.layersMovement === "horizontal") {
            positionLayerHorizontalToBottom();
            positionVerticalLayersBottomToHorizontalLayersBottom()
        } else {
            positionHorizontalLayersAtBottomMost();
            positionHorizontalLayersToHaveSameRightPosition()
        }
        clearInterval(timers.bubble);
        clearInterval(timers.blinkSeaAnimals)
    }
}

function setShiftUpLayerHorizontalDistance() {
    shiftUpLayerHorizontalDistance = .75 * containerDiv.offsetHeight
}

function shiftUpLayerHorizontal() {
    setShiftUpLayerHorizontalDistance();
    clearShiftUpDownLayerHorizontalTimer();
    timers.shiftUpLayer = setInterval(() => {
        moveUpLayerHorizontal()
    }, shiftUpDownLayerHorizontalInterval);
    disableIsAleJumpingAndFalling()
}

function moveUpLayerHorizontal() {
    if (scrollState.layersMovement === "horizontal") {
        for (let i = 0; i < layerHorizontalArray.length; i++) {
            let newTop = layerHorizontalArray[i].offsetTop - shiftUpDownLayerHorizontalIncrement;
            if (newTop <= -shiftUpLayerHorizontalDistance) {
                newTop = -shiftUpLayerHorizontalDistance;
                layerHorizontalArray[i].style.top = `${newTop}px`;
                clearInterval(timers.shiftUpLayer)
            } else {
                layerHorizontalArray[i].style.top = `${newTop}px`
            }
            if (aleContainerDiv.offsetTop > sea1Div.offsetTop + layerHorizontalArray[layerHorizontalArray.length - 1].offsetTop)
                ale.isBelowSeaLevel = true
        }
        positionVerticalLayersBottomToHorizontalLayersBottom()
    } else {
        resetLayersWhenNotHorizontal(timers.shiftUpLayer);
    }
}

function shiftDownLayerHorizontal() {
    clearShiftUpDownLayerHorizontalTimer();
    timers.shiftDownLayer = setInterval(() => {
        moveDownLayerHorizontal()
    }, shiftUpDownLayerHorizontalInterval)
}

function moveDownLayerHorizontal() {
    if (scrollState.layersMovement === "horizontal") {
        for (let i = 0; i < layerHorizontalArray.length; i++) {
            let newTop = layerHorizontalArray[i].offsetTop + shiftUpDownLayerHorizontalIncrement;
            if (newTop >= 0) {
                newTop = 0;
                layerHorizontalArray[i].style.top = `${newTop}px`;
                clearInterval(timers.shiftDownLayer)
            } else {
                layerHorizontalArray[i].style.top = `${newTop}px`
            }
            if (aleContainerDiv.offsetTop < sea1Div.offsetTop + layerHorizontalArray[layerHorizontalArray.length - 1].offsetTop)
                ale.isBelowSeaLevel = false
        }
        positionVerticalLayersBottomToHorizontalLayersBottom()
    } else {
        resetLayersWhenNotHorizontal(timers.shiftDownLayer);
    }
}

function resetLayersWhenNotHorizontal(timerToClear) {
    clearInterval(timerToClear);
    positionHorizontalLayersAtBottomMost();
    positionHorizontalLayersToHaveSameRightPosition();
    ale.isBelowSeaLevel = false;
}

function clearShiftUpDownLayerHorizontalTimer() {
    clearInterval(timers.shiftUpLayer);
    clearInterval(timers.shiftDownLayer)
}

// ─── Layer & rocket positioning ──────────────────────────────────────────────
function positionVerticalLayersHorizontally() {
    for (let i = 0; i < layerVerticalArray.length; i++) layerVerticalArray[i].style.left = `${layerHorizontalArray[i].offsetLeft + layerHorizontalArray[i].offsetWidth - containerDiv.offsetWidth}px`
}

function positionRocketAndAleContainerHorizontally() {
    const lastLayerSpeed = layerHorizontalSpeedArray[layerHorizontalSpeedArray.length - 1];
    const lastLayer = layerHorizontalArray[layerHorizontalArray.length - 1];

    const horizontalOffset = scrollState.position * lastLayerSpeed - (lastLayer.offsetWidth - containerDiv.offsetWidth);

    ale.maxHorizontalDistance = (containerDiv.offsetWidth * 0.5) + 332; // max rightward offset for Ale during vertical scroll

    let alePosition = (containerDiv.offsetWidth * 0.5) + horizontalOffset;

    if (ale.maxHorizontalDistance <= alePosition) {
        alePosition = ale.maxHorizontalDistance;
    }

    const rocketMaxPosition = (containerDiv.offsetWidth * 0.5) + 170; // max rightward offset for rocket during vertical scroll
    let rocketPosition = (containerDiv.offsetWidth - rocketDiv.offsetWidth) * 0.5 + horizontalOffset;

    if (rocketMaxPosition <= rocketPosition) {
        rocketPosition = rocketMaxPosition;
    }

    switch (scrollState.layersMovement) {
        case "vertical":
            rocketDiv.style.left = `${rocketPosition}px`;
            aleContainerDiv.style.left = `${alePosition}px`;
            aleContainerDiv.style.padding = "0px 0px 150px 0px";
            break;

        case "not moving 1":
        case "not moving 2":
            const pageOffset = scrollState.position -
                (pageDiv.offsetHeight - containerDiv.offsetHeight - distanceBetweenAleAndRocket);

            aleContainerDiv.style.left = `${alePosition + pageOffset}px`;
            aleContainerDiv.style.padding = "0px 0px 0px 0px";
            rocketDiv.style.left = `${rocketPosition}px`;
            break;

        default:
            const rocketFollowPosition = lastLayer.offsetLeft +
                lastLayer.offsetWidth -
                (containerDiv.offsetWidth + rocketDiv.offsetWidth) * 0.5;

            rocketDiv.style.left = `${rocketFollowPosition}px`;
            aleContainerDiv.style.left = "50%";
            aleContainerDiv.style.padding = "0px 0px 0px 0px";
            break;
    }
}
