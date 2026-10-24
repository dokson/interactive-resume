// ─── Scroll / swipe control ──────────────────────────────────────────────────
function orientationChangeHandler() {
    disableScrollOrSwipe();
    setTimeout(() => {
        $(window).trigger("resize")
    }, gameConfig.world.resizeAfterOrientationDelay)
}

function enableScrollOrSwipe() {
    scrollState.canScrollOrSwipe = true
}

function disableScrollOrSwipe() {
    scrollState.canScrollOrSwipe = false
}

// All four arrows share one scroll, so left/right walk the world exactly like down/up
const arrowDirections = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

function handleArrowKeys(event) {
    const direction = arrowDirections[event.key];
    if (!direction || !scrollState.canScrollOrSwipe) return;
    event.preventDefault();
    // Key repeats are ignored: a rAF loop scrolls at constant speed while the key is held
    if (event.repeat || scrollState.arrowDirection === direction) return;
    scrollState.arrowDirection = direction;
    let previousTime = performance.now();
    const step = (time) => {
        if (scrollState.arrowDirection !== direction) return;
        window.scrollBy(0, direction * gameConfig.keyboard.arrowScrollSpeed * (time - previousTime));
        previousTime = time;
        requestAnimationFrame(step)
    };
    requestAnimationFrame(step)
}

function stopArrowScroll(event) {
    if (arrowDirections[event.key] === scrollState.arrowDirection) scrollState.arrowDirection = 0
}

// ─── Touch events ────────────────────────────────────────────────────────────
// Not passive: document-level touch listeners default to passive, so preventDefault() was ignored and the
// page scrolled natively under the swipe, toggling the address bar and firing a full relayout each time.
function initTouchEvents() {
    document.addEventListener("touchstart", handleStart);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd, { passive: false })
}

function handleStart(event) {
    stopFling();
    scrollState.touchStartX = event.targetTouches[0].pageX;
    scrollState.positionOnTouch = scrollState.position;
    scrollState.touchSamples = [{ x: scrollState.touchStartX, time: event.timeStamp }]
}

function handleMove(event) {
    event.preventDefault();
    scrollState.touchCurrentX = event.targetTouches[0].pageX;
    scrollState.touchSamples.push({ x: scrollState.touchCurrentX, time: event.timeStamp });
    if (scrollState.canScrollOrSwipe) {
        detectPageVerticalPosition();
        runTheseFunctionsAfterScrollOrSwipe()
    }
}

// Cancelling touchend suppresses the synthetic click, so let taps on links through.
function handleEnd(event) {
    if (!event.target.closest("a")) event.preventDefault();
    startFling(event.timeStamp)
}

// ─── Touch momentum ──────────────────────────────────────────────────────────
// The world follows the finger 1:1, then a quick swipe keeps it gliding and slowing down like a native
// scroll: without it every swipe stopped dead and crossing the world took dozens of them. The glide moves
// the virtual finger, so scenes, Ale and phases update exactly as under a real one.
function startFling(endTime) {
    const { flingSampleWindow, flingMinVelocity, flingMaxVelocity, flingFriction, flingMaxFrame } = gameConfig.touch;
    // Only the last flingSampleWindow ms count: a finger that paused before lifting does not fling.
    const samples = scrollState.touchSamples.filter((sample) => endTime - sample.time <= flingSampleWindow);
    if (samples.length < 2 || !scrollState.canScrollOrSwipe) return;
    const first = samples[0];
    const last = samples[samples.length - 1];
    if (last.time <= first.time) return;
    // The position grows as the finger moves left.
    let velocity = (first.x - last.x) / (last.time - first.time);
    if (Math.abs(velocity) < flingMinVelocity) return;
    velocity = Math.max(-flingMaxVelocity, Math.min(flingMaxVelocity, velocity));
    let previousTime = performance.now();
    const step = (time) => {
        // Capped: after a background tab resumes, one long frame would teleport the world.
        const elapsed = Math.min(time - previousTime, flingMaxFrame);
        previousTime = time;
        scrollState.touchCurrentX -= velocity * elapsed;
        velocity *= flingFriction ** elapsed;
        if (!scrollState.canScrollOrSwipe) return stopFling();
        detectPageVerticalPosition();
        runTheseFunctionsAfterScrollOrSwipe();
        const atEdge = scrollState.position <= 0 || scrollState.position >= pageDiv.offsetHeight - containerDiv.offsetHeight;
        if (atEdge || Math.abs(velocity) < flingMinVelocity) return stopFling();
        timers.fling = requestAnimationFrame(step)
    };
    timers.fling = requestAnimationFrame(step)
}

function stopFling() {
    cancelAnimationFrame(timers.fling);
    timers.fling = undefined
}

// ─── Scroll / swipe dispatch ─────────────────────────────────────────────────
function runTheseFunctionsAfterScrollOrSwipe() {
    orientAle();
    checkAleJumpFallSwim();
    moveLayers();
    shiftUpDownHorizontalLayers();
    triggerEnteredScenes();
    animateAleRunSwim();
    hideScrollOrSwipeTextContainer();
    updateScrollProgress();
    deviceFunctionScrollSwipe()
}

// Composited scaleX rather than an animated width, so tracking the scroll costs no layout.
function updateScrollProgress() {
    const scrollableHeight = pageDiv.offsetHeight - containerDiv.offsetHeight;
    const progress = scrollableHeight > 0 ? Math.min(Math.max(scrollState.position / scrollableHeight, 0), 1) : 0;
    progressBarDiv.style.transform = `scaleX(${progress})`;
    progressTrackDiv.setAttribute("aria-valuenow", Math.round(progress * 100))
}

function deviceFunctionScrollSwipe() {
    deviceName !== "computer" && scrollState.layersMovement === LayersMovement.vertical && positionHorizontalLayersToHaveSameRightPosition()
}

// ─── Container & preloader ───────────────────────────────────────────────────
function showContainer() {
    containerDiv.className = ""
}

function shiftUpHorizontalLayersAfterEverythingLoaded() {
    // Composited rise: transform keeps the intro out of Cumulative Layout Shift.
    for (const layer of layerHorizontalArray) {
        layer.style.transitionDuration = `${gameConfig.world.riseDuration}ms`;
        layer.classList.add("layer-risen")
    }
    setTimeout(finishShiftUpHorizontalLayersAfterEverythingLoaded, gameConfig.world.riseDuration)
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
        bottom: gameConfig.ale.introDrop.bottom
    }, gameConfig.ale.introDrop.duration, () => {
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
    layerVerticalArray[layerVerticalArray.length - 1].style.height = `${2 * containerDiv.offsetHeight + bannersContainerDiv.offsetHeight + gameConfig.world.endingCloudGap}px`
}

function setBannersContainerVerticalPosition() {
    bannersContainerDiv.style.bottom = `${containerDiv.offsetHeight}px`
}

function setPageHeight() {
    pageDiv.style.height = `${layerHorizontalArray[layerHorizontalArray.length - 1].offsetWidth - containerDiv.offsetWidth + layerVerticalArray[layerVerticalArray.length - 1].offsetHeight + gameConfig.world.aleToRocketDistance}px`
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
    const endPosition = pageDiv.offsetHeight - containerDiv.offsetHeight;
    scrollState.previousPosition = scrollState.position;
    if (deviceName === "computer") {
        // Zoom and display scaling make scrollY fractional, so its maximum can fall short of the end:
        // the bottom of the document (within 1px) is the end.
        const root = document.documentElement;
        const isAtDocumentBottom = window.scrollY + root.clientHeight >= root.scrollHeight - 1;
        scrollState.position = isAtDocumentBottom ? endPosition : window.scrollY
    } else {
        scrollState.position = scrollState.positionOnTouch + (scrollState.touchStartX - scrollState.touchCurrentX);
        if (scrollState.position < 0) scrollState.position = 0;
        if (scrollState.position > endPosition) scrollState.position = endPosition
    }
    scrollState.delta = scrollState.position - scrollState.previousPosition;
    if (scrollState.position <= 0) {
        resetVariables();
        resetFunctions()
    }
}

function moveLayers() {
    setLayersMovement();
    if (scrollState.layersMovement === LayersMovement.horizontal) {
        for (let i = 0; i < layerHorizontalArray.length; i++) {
            const layerOffset = -1 * layerHorizontalSpeedArray[i] * scrollState.position;
            layerHorizontalArray[i].style.left = `${layerOffset}px`;
        }
        positionLayerHorizontalToBottom();
        clearHappyAleTimer();
        positionVerticalLayersHorizontally();
    }
    if (scrollState.layersMovement === LayersMovement.vertical) {
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
    if (scrollState.layersMovement === LayersMovement.walkingToRocket) {
        positionLayersWhenNotMoving();
        clearHappyAleTimer();
    }
    if (scrollState.layersMovement === LayersMovement.atRocket) {
        positionLayersWhenNotMoving();
        happyAle();
        startFireworks();
    }
    positionRocketAndAleContainerHorizontally();
    setRocketBoardable(scrollState.layersMovement === LayersMovement.atRocket);
    positionEndingContainer();
    positionFireworksContainer();
}

function setLayersMovement() {
    if (scrollState.position * layerHorizontalSpeedArray[layerHorizontalSpeedArray.length - 1] <= layerHorizontalArray[layerHorizontalArray.length - 1].offsetWidth - containerDiv.offsetWidth) {
        scrollState.layersMovement = LayersMovement.horizontal
    } else if (scrollState.position >= pageDiv.offsetHeight - containerDiv.offsetHeight - gameConfig.world.aleToRocketDistance && scrollState.position < pageDiv.offsetHeight - containerDiv.offsetHeight) {
        scrollState.layersMovement = LayersMovement.walkingToRocket
    } else if (scrollState.position >= pageDiv.offsetHeight - containerDiv.offsetHeight) {
        scrollState.layersMovement = LayersMovement.atRocket
    } else {
        scrollState.layersMovement = LayersMovement.vertical
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
    ale.rightEdge = .5 * (containerDiv.offsetWidth + aleDiv.offsetWidth) - gameConfig.ale.edgeInset;
    ale.leftEdge = .5 * (containerDiv.offsetWidth - aleDiv.offsetWidth) + gameConfig.ale.edgeInset
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
        if (scrollState.layersMovement === LayersMovement.horizontal) {
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
    shiftUpLayerHorizontalDistance = gameConfig.world.seaShiftRatio * containerDiv.offsetHeight
}

function shiftUpLayerHorizontal() {
    setShiftUpLayerHorizontalDistance();
    clearShiftUpDownLayerHorizontalTimer();
    timers.shiftUpLayer = setInterval(() => {
        moveUpLayerHorizontal()
    }, gameConfig.world.seaShiftInterval);
    disableIsAleJumpingAndFalling()
}

function moveUpLayerHorizontal() {
    if (scrollState.layersMovement === LayersMovement.horizontal) {
        for (let i = 0; i < layerHorizontalArray.length; i++) {
            let newTop = layerHorizontalArray[i].offsetTop - gameConfig.world.seaShiftStep;
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
    }, gameConfig.world.seaShiftInterval)
}

function moveDownLayerHorizontal() {
    if (scrollState.layersMovement === LayersMovement.horizontal) {
        for (let i = 0; i < layerHorizontalArray.length; i++) {
            let newTop = layerHorizontalArray[i].offsetTop + gameConfig.world.seaShiftStep;
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

    const { aleMaxOffsetFromCenter, rocketMaxOffsetFromCenter, aleToRocketDistance, aleEndMarginRight } = gameConfig.world;
    const horizontalOffset = scrollState.position * lastLayerSpeed - (lastLayer.offsetWidth - containerDiv.offsetWidth);
    const center = containerDiv.offsetWidth * 0.5;
    // On narrow windows Ale's final spot (aleToRocketDistance right of his max) would pass the right
    // edge: shift his and the rocket's resting spots left together so the ending keeps its layout.
    const endOverflow = Math.max(0, center + aleMaxOffsetFromCenter + aleToRocketDistance + aleDiv.offsetWidth * 0.5 + aleEndMarginRight - containerDiv.offsetWidth);

    ale.maxHorizontalDistance = center + aleMaxOffsetFromCenter - endOverflow;

    let alePosition = center + horizontalOffset;

    if (ale.maxHorizontalDistance <= alePosition) {
        alePosition = ale.maxHorizontalDistance;
    }

    const rocketMaxPosition = center + rocketMaxOffsetFromCenter - endOverflow;
    let rocketPosition = (containerDiv.offsetWidth - rocketDiv.offsetWidth) * 0.5 + horizontalOffset;

    if (rocketMaxPosition <= rocketPosition) {
        rocketPosition = rocketMaxPosition;
    }

    positionAboutSign(rocketMaxPosition);

    switch (scrollState.layersMovement) {
        case LayersMovement.vertical:
            rocketDiv.style.left = `${rocketPosition}px`;
            aleContainerDiv.style.left = `${alePosition}px`;
            aleContainerDiv.style.padding = `0px 0px ${gameConfig.world.aleRocketPaddingBottom}px 0px`;
            break;

        case LayersMovement.walkingToRocket:
        case LayersMovement.atRocket:
            const pageOffset = scrollState.position -
                (pageDiv.offsetHeight - containerDiv.offsetHeight - gameConfig.world.aleToRocketDistance);

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

// The "ABOUT ME" title keeps clear of the rocket's resting spot: it slides left as far as the window edge
// allows, then shrinks (composited transform around its first letter where the extrusion meets the clouds).
// Too narrow even at minScale but tall enough (portrait phones): it floats above the rocket instead,
// centred, with its extrusion fading out where the clouds would have hidden it. Windows short on both
// counts keep the minScale sign beside the rocket.
function positionAboutSign(rocketLeft) {
    const { textLeft, rocketGap, marginLeft, minScale, aboveRocketGap, aboveDepth, aboveMarginTop } = gameConfig.world.aboutSign;
    const titleStyle = getComputedStyle(aboutSignTitleSvg);
    const titleLeft = containerDiv.offsetWidth * 0.5 + parseFloat(titleStyle.marginLeft) + textLeft;
    const titleWidth = aboutSignTitleSvg.width.baseVal.value - textLeft;
    const cloudLine = aboutSignTitleSvg.parentElement.offsetHeight - parseFloat(titleStyle.top);
    const overlap = Math.max(0, titleLeft + titleWidth + rocketGap - rocketLeft);
    const shift = Math.min(overlap, Math.max(0, titleLeft - marginLeft));
    const besideScale = Math.min(1, (titleWidth - overlap + shift) / titleWidth);
    // Container y of the clouds' line (#about-sign rests on it), then the room above the rocket's sign.
    const cloudY = containerDiv.offsetHeight - parseFloat(getComputedStyle(aboutSignTitleSvg.parentElement).bottom);
    const roomBottom = cloudY - rocketDiv.offsetHeight - aboveRocketGap;
    const aboveScale = Math.min(1, (containerDiv.offsetWidth - 2 * marginLeft) / titleWidth, (roomBottom - aboveMarginTop) / aboveDepth);

    aboutSignTitleSvg.style.transformOrigin = `${textLeft}px ${cloudLine}px`;
    if (besideScale >= minScale || aboveScale < minScale) {
        aboutSignTitleSvg.style.transform = overlap > 0 ? `translateX(${-shift}px) scale(${Math.max(minScale, besideScale)})` : "";
        aboutSignTitleSvg.style.maskImage = "";
        return;
    }
    const left = 0.5 * (containerDiv.offsetWidth - titleWidth * aboveScale);
    // Scaling around the cloud line pulls the faded depth (svg y = aboveDepth) towards it: lift so it ends at roomBottom.
    const lift = cloudY - roomBottom - (cloudLine - aboveDepth) * aboveScale;
    aboutSignTitleSvg.style.transform = `translate(${left - titleLeft}px, ${-lift}px) scale(${aboveScale})`;
    aboutSignTitleSvg.style.maskImage = `linear-gradient(#000 ${0.5 * aboveDepth}px, transparent ${aboveDepth}px)`;
}
