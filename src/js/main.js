// ─── Scroll / swipe control ──────────────────────────────────────────────────
function orientationChangeHandler(e) {
    disableScrollOrSwipe();
    setTimeout(function () {
        $(window).trigger("resize")
    }, 500)
}

function enableScrollOrSwipe() {
    canScrollOrSwipe = true
}

function disableScrollOrSwipe() {
    canScrollOrSwipe = false
}

// ─── Initialisation & reset ──────────────────────────────────────────────────
function initVariablesAfterShowContainer() {
    fireworkCenterX = .5 * fireworkArray[0].offsetWidth;
    fireworkCenterY = .5 * fireworkArray[0].offsetHeight;
    fireworkOneRadiusDistance = (fireworkCenterY - fireworkDotRadius) / fireworkRowNumber;
    fireworkOneRotationAngle = 2 * Math.PI / fireworkColumnNumber
}

function resetVariables() {
    canAnimateBuildingInformation = canAnimateBuilding2Information = canAnimatePlantInformation = !(pageVerticalPosition = 0);
    if (!isFishStillAnimating) canAnimateFishInformation = true;
    if (!isCrabStillAnimating) canAnimateCrabInformation = true;
    if (!isTurtleStillAnimating) canAnimateTurtleInformation = true;
    canDrawManyFireworks = canAnimateSocialContainer = canAnimateAlienInformation = canAnimateSquidInformation = canAnimateRobotInformation = true
}

function resetFunctions() {
    positionPlants();
    positionBuildings();
    positionBuildings2();
    if (!isFishStillAnimating) positionSeaAnimals(fishArray, numberOfFishInEachRowArray, 150, 100);
    if (!isCrabStillAnimating) positionSeaAnimals(crabArray, numberOfCrabInEachRowArray, 150, 100);
    if (!isTurtleStillAnimating) positionSeaAnimals(turtleArray, numberOfTurtleInEachRowArray, 150, 100);
    positionExperience1Elements();
    positionExperience2Elements();
    positionExperience3Elements();
    positionSocialContainer();
    positionExperienceTextContainer();
    positionChainBlockAndStringContainer();
    resetFireworkSvg()
}

// ─── Touch events ────────────────────────────────────────────────────────────
function initTouchEvents() {
    document.addEventListener("touchstart", handleStart, false);
    document.addEventListener("touchmove", handleMove, false);
    document.addEventListener("touchend", handleEnd, false)
}

function handleStart(e) {
    touchStartX = e.targetTouches[0].pageX;
    pageVerticalPositionOnTouch = pageVerticalPosition
}

function handleMove(e) {
    e.preventDefault();
    touchCurrentX = e.targetTouches[0].pageX;
    if (canScrollOrSwipe) {
        detectPageVerticalPosition();
        runTheseFunctionsAfterScrollOrSwipe()
    }
}

function handleEnd(e) {
    e.preventDefault();
    touchEndX = e.changedTouches[0].pageX
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
    deviceFunctionScrollSwipe();
    printScrollSwipeText()
}

function deviceFunctionScrollSwipe() {
    deviceName !== "computer" && layersMovement === "vertical" && positionHorizontalLayersToHaveSameRightPosition()
}

// ─── Container & preloader ───────────────────────────────────────────────────
function showContainer() {
    containerDiv.setAttribute("class", "")
}

function shiftUpHorizontalLayersAfterEverythingLoaded() {
    for (var e = 0; e < layerHorizontalArray.length; e++)
        $(layerHorizontalArray[e]).stop().animate({
            top: "0px"
        }, 1e3, function () {
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
    }, 500, function () {
        setAleStaticFrame();
        enableAnimateAleRunSwim()
    });
    if (browserName === "internet explorer" && browserVersion <= 8) enableAnimateAleRunSwim()
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
    for (var e = 0; e < layerHorizontalArray.length; e++) {
        var t = (layerHorizontalArray[e].offsetWidth - containerDiv.offsetWidth) / (layerHorizontalArray[layerHorizontalArray.length - 1].offsetWidth - containerDiv.offsetWidth);
        layerHorizontalSpeedArray.push(t)
    }
    for (e = 0; e < layerVerticalArray.length; e++) {
        var i = (layerVerticalArray[e].offsetHeight - containerDiv.offsetHeight) / (layerVerticalArray[layerVerticalArray.length - 1].offsetHeight - containerDiv.offsetHeight);
        layerVerticalSpeedArray.push(i)
    }
}

// ─── Scroll position & layer movement ────────────────────────────────────────
function detectPageVerticalPosition() {
    previousPageVerticalPosition = pageVerticalPosition;
    if (deviceName === "computer") {
        pageVerticalPosition = browserName === "internet explorer" ? document.documentElement.scrollTop : pageYOffset
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
        positionVerticalLayersAtLeftMost();
        positionVerticalLayersToHaveSameTopPosition();
        positionHorizontalLayersAtBottomMost();
        positionHorizontalLayersToHaveSameRightPosition();
        clearHappyAleTimer();
    }
    if (layersMovement === "not moving 2") {
        positionVerticalLayersAtLeftMost();
        positionVerticalLayersToHaveSameTopPosition();
        positionHorizontalLayersAtBottomMost();
        positionHorizontalLayersToHaveSameRightPosition();
        animateSocialContainer();
        happyAle();
        drawManyFireworks();
    }
    positionRocketAndAleContainerHorizontally();
    positionContactContainer();
    positionFireworksContainer();
}

// ─── Layer positioning utilities ─────────────────────────────────────────────
function positionVerticalLayersAtLeftMost() {
    for (var e = 0; e < layerVerticalArray.length; e++)
        layerVerticalArray[e].style.left = "0px"
}

function positionHorizontalLayersToHaveSameRightPosition() {
    for (var e = 0; e < layerHorizontalArray.length; e++)
        layerHorizontalArray[e].style.left = containerDiv.offsetWidth - layerHorizontalArray[e].offsetWidth + "px"
}

function positionHorizontalLayersVertically() {
    for (var e = 0; e < layerHorizontalArray.length; e++)
        layerHorizontalArray[e].style.top = layerVerticalArray[layerVerticalArray.length - 1].offsetTop + layerVerticalArray[layerVerticalArray.length - 1].offsetHeight - containerDiv.offsetHeight + "px"
}

function positionHorizontalLayersAtBottomMost() {
    for (var e = 0; e < layerHorizontalArray.length; e++)
        layerHorizontalArray[e].style.top = layerVerticalArray[layerVerticalArray.length - 1].offsetHeight - containerDiv.offsetHeight + "px"
}

function setAleLeftAndRightEdge() {
    aleRightEdge = .5 * (containerDiv.offsetWidth + aleDiv.offsetWidth) - 65;
    aleLeftEdge = .5 * (containerDiv.offsetWidth - aleDiv.offsetWidth) + 65
}

function positionVerticalLayersToHaveSameTopPosition() {
    for (var e = 0; e < layerVerticalArray.length; e++)
        layerVerticalArray[e].style.bottom = containerDiv.offsetHeight - layerVerticalArray[e].offsetHeight + "px"
}

function positionVerticalLayersBottomToHorizontalLayersBottom() {
    for (var e = 0; e < layerVerticalArray.length; e++)
        layerVerticalArray[e].style.bottom = -1 * layerHorizontalArray[e].offsetTop + "px"
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
        clearInterval(shiftUpLayerHorizontalTimer);
        clearInterval(shiftDownLayerHorizontalTimer);
        isAleSwimming = true;
        positionLayerHorizontalToTop();
        positionVerticalLayersBottomToHorizontalLayersBottom();
        createBubble()
    }

    const aleIsOutsideSea =
        pageVerticalPosition < sea1Div.offsetLeft - aleLeftEdge ||
        pageVerticalPosition > sea1Div.offsetLeft + sea1Div.offsetWidth - aleRightEdge;
    if (aleIsOutsideSea) {
        clearInterval(shiftUpLayerHorizontalTimer);
        clearInterval(shiftDownLayerHorizontalTimer);
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
    shiftUpLayerHorizontalTimer = setInterval(function () {
        moveUpLayerHorizontal()
    }, shiftUpDownLayerHorizontalInterval);
    disableIsAleJumpingAndFalling()
}

function moveUpLayerHorizontal() {
    if (layersMovement === "horizontal") {
        for (var e = 0; e < layerHorizontalArray.length; e++) {
            var t = layerHorizontalArray[e].offsetTop - shiftUpDownLayerHorizontalIncrement;
            if (t <= -shiftUpLayerHorizontalDistance) {
                t = -shiftUpLayerHorizontalDistance;
                layerHorizontalArray[e].style.top = t + "px";
                clearInterval(shiftUpLayerHorizontalTimer)
            } else {
                layerHorizontalArray[e].style.top = t + "px"
            }
            if (aleContainerDiv.offsetTop > sea1Div.offsetTop + layerHorizontalArray[layerHorizontalArray.length - 1].offsetTop)
                isAleBelowSeaLevel = true
        }
        positionVerticalLayersBottomToHorizontalLayersBottom()
    } else {
        clearInterval(shiftUpLayerHorizontalTimer);
        positionHorizontalLayersAtBottomMost();
        positionHorizontalLayersToHaveSameRightPosition();
        isAleBelowSeaLevel = false
    }
}

function shiftDownLayerHorizontal() {
    clearShiftUpDownLayerHorizontalTimer();
    shiftDownLayerHorizontalTimer = setInterval(function () {
        moveDownLayerHorizontal()
    }, shiftUpDownLayerHorizontalInterval)
}

function moveDownLayerHorizontal() {
    if (layersMovement === "horizontal") {
        for (var e = 0; e < layerHorizontalArray.length; e++) {
            var t = layerHorizontalArray[e].offsetTop + shiftUpDownLayerHorizontalIncrement;
            if (t >= 0) {
                t = 0;
                layerHorizontalArray[e].style.top = t + "px";
                clearInterval(shiftDownLayerHorizontalTimer)
            } else {
                layerHorizontalArray[e].style.top = t + "px"
            }
            if (aleContainerDiv.offsetTop < sea1Div.offsetTop + layerHorizontalArray[layerHorizontalArray.length - 1].offsetTop)
                isAleBelowSeaLevel = false
        }
        positionVerticalLayersBottomToHorizontalLayersBottom()
    } else {
        clearInterval(shiftDownLayerHorizontalTimer);
        positionHorizontalLayersAtBottomMost();
        positionHorizontalLayersToHaveSameRightPosition();
        isAleBelowSeaLevel = false
    }
}

function clearShiftUpDownLayerHorizontalTimer() {
    clearInterval(shiftUpLayerHorizontalTimer);
    clearInterval(shiftDownLayerHorizontalTimer)
}

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
    (previousPageVerticalPosition <= elevationArray[e].offsetLeft - aleRightEdge && pageVerticalPosition > elevationArray[e].offsetLeft - aleRightEdge || previousPageVerticalPosition >= elevationArray[e].offsetLeft + elevationArray[e].offsetWidth - aleLeftEdge && pageVerticalPosition < elevationArray[e].offsetLeft + elevationArray[e].offsetWidth - aleLeftEdge) && (positionAleAtGroundLevel(), $(aleContainerDiv).stop().animate({
        bottom: [containerDiv.offsetHeight - groundAndGrassContainer1Div.offsetTop + 300, "easeOutCubic"]
    }, 300, function () {
        aleJumpDown(e)
    }), setAleJumpUpFrame())
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

// ─── Ale: eyes & blink ───────────────────────────────────────────────────────
function animateAleEyes() {
    clearInterval(blinkAleEyesTimer);
    blinkAleEyesTimer = setInterval(function () {
        blinkAleEyes()
    }, 4e3)
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
    e < swimUpHeight && (swimUpHeight = e)
}

// ─── Layer & rocket positioning ──────────────────────────────────────────────
function positionVerticalLayersHorizontally() {
    for (var e = 0; e < layerVerticalArray.length; e++) layerVerticalArray[e].style.left = layerHorizontalArray[e].offsetLeft + layerHorizontalArray[e].offsetWidth - containerDiv.offsetWidth + "px"
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

// ─── DOM collection ──────────────────────────────────────────────────────────
function storeDivs() {
    for (var e = document.getElementsByTagName("div"), t = 0; t < e.length; t++) {
        var cls = e[t].getAttribute("class");
        if (cls === "fish") fishArray.push(e[t]);
        if (cls === "fish-eyes") fishEyeArray.push(e[t]);
        if (cls === "crab") crabArray.push(e[t]);
        if (cls === "crab-eyes") crabEyeArray.push(e[t]);
        if (cls === "turtle") turtleArray.push(e[t]);
        if (cls === "turtle-eyes") turtleEyeArray.push(e[t]);
        if (cls === "elevation") elevationArray.push(e[t]);
        if (cls === "plant") plantArray.push(e[t]);
        if (cls === "building") buildingArray.push(e[t]);
        if (cls === "building2") building2Array.push(e[t]);
        if (cls === "contact-confirmation-container") contactConfirmationContainerArray.push(e[t]);
        if (cls === "experience-text-container") experienceTextContainerArray.push(e[t]);
        if (cls === "chain-block-and-string-container") chainBlockAndStringContainerArray.push(e[t]);
        if (cls === "layer-horizontal") layerHorizontalArray.push(e[t]);
        if (cls === "layer-vertical") layerVerticalArray.push(e[t]);
        if (cls === "algae-a" || cls === "algae-b" || cls === "title-skills-class") seaFloorFrontObjectArray.push(e[t]);
        if (cls === "coral" || cls === "coral-big") seaFloorBackObjectArray.push(e[t]);
        if (cls === "squid-hand-close") squidHandCloseArray.push(e[t]);
        if (cls === "squid-hand-open") squidHandOpenArray.push(e[t]);
        if (cls === "firework") fireworkArray.push(e[t])
    }
}

// ─── About: plants ───────────────────────────────────────────────────────────
function animatePlants() {
    for (var e = 0; e < plantArray.length; e++) $(plantArray[e]).stop().delay(300 * e).animate({
        top: [plantTargetTopObjectArray[e].offsetTop, "easeOutElastic"]
    }, 800, function () { })
}

function positionPlants() {
    for (var e = 0; e < plantArray.length; e++) plantArray[e].style.top = canAnimatePlantInformation ? "100%" : plantTargetTopObjectArray[e].offsetTop + "px"
}

// ─── About: buildings ────────────────────────────────────────────────────────
function animateBuildings() {
    for (var e = 0; e < buildingArray.length; e++) $(buildingArray[e]).stop().delay(300 * e).animate({
        left: [buildingTargetLeftArray[e], "easeOutCubic"]
    }, 1e3, function () { })
}

function animateBuildings2() {
    for (var e = 0; e < building2Array.length; e++) $(building2Array[e]).stop().delay(300 * e).animate({
        left: [building2TargetLeftArray[e], "easeOutCubic"]
    }, 1e3, function () { })
}

function positionBuildings() {
    for (var e = 0; e < buildingArray.length; e++) buildingArray[e].style.left = buildingEarlyPositionArray[e] + "px"
}

function positionBuildings2() {
    for (var e = 0; e < building2Array.length; e++) building2Array[e].style.left = building2EarlyPositionArray[e] + "px"
}

// ─── Sea animals & Ale run / swim ────────────────────────────────────────────
function positionSeaAnimals(e, t, i, n) {
    for (var a = e, o = t, r = i, l = n, s = 0, c = 0; c < o.length; c++)
        for (var f = 0; f < o[c]; f++) {
            a[s].style.left = seaAnimalSwimDistance + f * r + "px";
            a[s].style.top = c * l + "px";
            s += 1
        }
}

function animateSeaAnimals(e) {
    var t = e;
    if (t == fishArray) isFishStillAnimating = true;
    if (t == crabArray) isCrabStillAnimating = true;
    if (t == turtleArray) isTurtleStillAnimating = true;
    for (var i = 0; i < t.length; i++) $(t[i]).stop().delay(100 * i).animate({
        left: [t[i].offsetLeft - seaAnimalSwimDistance, "easeOutCubic"]
    }, 600, function () {
        disableIsSeaAnimalStillAnimating(t)
    })
}

function disableIsSeaAnimalStillAnimating(e) {
    var t = e;
    if (t == fishArray) {
        if (fishAnimateNumber >= t.length - 1) { isFishStillAnimating = false; fishAnimateNumber = 0 }
        else fishAnimateNumber += 1
    }
    if (t == crabArray) {
        if (crabAnimateNumber >= t.length - 1) { isCrabStillAnimating = false; crabAnimateNumber = 0 }
        else crabAnimateNumber += 1
    }
    if (t == turtleArray) {
        if (turtleAnimateNumber >= t.length - 1) { isTurtleStillAnimating = false; turtleAnimateNumber = 0 }
        else turtleAnimateNumber += 1
    }
}

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
    if (isAleFalling) return clearShiftAleFrameTimer(), void setAleJumpDownAndFallFrame();
    if (isAleSwimming && isAleBelowSeaLevel ? (aleStartFrame = aleStartSwimFrame, aleStopFrame = aleStopSwimFrame) : (aleStartFrame = aleStartRunFrame, aleStopFrame = aleStopRunFrame), aleFramesDiv.style.left = -1 * aleOneFrameWidth * (aleStartFrame + aleFrameIndex) + "px", aleStopFrame < aleStartFrame + aleFrameIndex + aleFrameDirection && (aleFrameDirection *= -1), aleStartFrame + aleFrameIndex + aleFrameDirection == aleStartFrame && (pageVerticalPositionWhenAnimateAle1 = pageVerticalPosition), aleStartFrame + aleFrameIndex + aleFrameDirection < aleStartFrame) {
        if (pageVerticalPositionWhenAnimateAle1 == (pageVerticalPositionWhenAnimateAle2 = pageVerticalPosition)) return clearShiftAleFrameTimer(), void (layersMovement === "not moving 2" && aleHandsUp());
        aleFrameDirection *= -1
    }
    aleFrameIndex += aleFrameDirection
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

// ─── Experience: containers & text ───────────────────────────────────────────
function positionChainBlockAndStringContainer() {
    for (var e = 0; e < chainBlockAndStringContainerArray.length; e++) {
        if (e === 0) canAnimateBossInformation = canAnimateRobotInformation;
        if (e === 1) canAnimateBossInformation = canAnimateSquidInformation;
        if (e === 2) canAnimateBossInformation = canAnimateAlienInformation;
        chainBlockAndStringContainerArray[e].style.left = .5 * experienceTextContainerArray[e].offsetWidth - .5 * chainBlockAndStringContainerArray[e].offsetWidth + "px";
        chainBlockAndStringContainerArray[e].style.bottom = canAnimateBossInformation ?
            .8 * containerDiv.offsetHeight + experienceTextContainerArray[e].offsetHeight + "px" :
            experienceTextContainerDistanceFromFloor + experienceTextContainerArray[e].offsetHeight + "px"
    }
}

function animateChainBlockAndStringContainer(e) {
    $(chainBlockAndStringContainerArray[e]).stop().animate({
        bottom: [experienceTextContainerDistanceFromFloor + experienceTextContainerArray[e].offsetHeight, "easeOutCubic"]
    }, 1e3, function () { })
}

function positionExperienceTextContainer() {
    for (var e = 0; e < experienceTextContainerArray.length; e++) {
        if (e === 0) canAnimateBossInformation = canAnimateRobotInformation;
        if (e === 1) canAnimateBossInformation = canAnimateSquidInformation;
        if (e === 2) canAnimateBossInformation = canAnimateAlienInformation;
        experienceTextContainerArray[e].style.bottom = canAnimateBossInformation ?
            .8 * containerDiv.offsetHeight + "px" :
            experienceTextContainerDistanceFromFloor + "px"
    }
}

function animateExperienceTextContainer(e) {
    $(experienceTextContainerArray[e]).stop().animate({
        bottom: [experienceTextContainerDistanceFromFloor, "easeOutCubic"]
    }, 1e3, function () { })
}

function positionExperience1Elements() {
    robotDiv.style.left = experience1ContainerDiv.offsetWidth + "px";
    $(piechartRobotTextGraphic1Div).fadeTo(0, 0);
    $(piechartRobotTextGraphic2Div).fadeTo(0, 0);
    $(piechartRobotTextAnimation1Div).fadeTo(0, 0);
    $(piechartRobotTextAnimation2Div).fadeTo(0, 0);
    $(piechartRobotTextCode1Div).fadeTo(0, 0);
    $(piechartRobotTextCode2Div).fadeTo(0, 0);
    if (!(browserName === "internet explorer" && browserVersion <= 8)) $(piechartRobotFrontDiv).fadeTo(0, 0)
}

function positionExperience2Elements() {
    squidDiv.style.left = experience2ContainerDiv.offsetWidth + "px";
    $(piechartSquidTextGraphic1Div).fadeTo(0, 0);
    $(piechartSquidTextGraphic2Div).fadeTo(0, 0);
    $(piechartSquidTextAnimation1Div).fadeTo(0, 0);
    $(piechartSquidTextAnimation2Div).fadeTo(0, 0);
    $(piechartSquidTextCode1Div).fadeTo(0, 0);
    $(piechartSquidTextCode2Div).fadeTo(0, 0);
    if (!(browserName === "internet explorer" && browserVersion <= 8)) $(piechartSquidFrontDiv).fadeTo(0, 0)
}

function positionExperience3Elements() {
    alienDiv.style.left = experience3ContainerDiv.offsetWidth + "px";
    $(piechartAlienTextGraphic1Div).fadeTo(0, 0);
    $(piechartAlienTextGraphic2Div).fadeTo(0, 0);
    $(piechartAlienTextAnimation1Div).fadeTo(0, 0);
    $(piechartAlienTextAnimation2Div).fadeTo(0, 0);
    $(piechartAlienTextCode1Div).fadeTo(0, 0);
    $(piechartAlienTextCode2Div).fadeTo(0, 0);
    if (!(browserName === "internet explorer" && browserVersion <= 8)) $(piechartAlienFrontDiv).fadeTo(0, 0)
}

// ─── Experience: animation dispatch ──────────────────────────────────────────
function animateInformationAndEnemiesElements() {
    if (layersMovement !== "horizontal") 
        return;

    if (!isAleSwimming) {
        for (var e = 0; e < landInformationContainerArray.length; e++) {
            const container = landInformationContainerArray[e];
            const containerLeft = container.offsetLeft;
            const containerRight = containerLeft + container.offsetWidth;
            const viewportCenter = pageVerticalPosition + (containerDiv.offsetWidth * 0.5);
            const previousViewportCenter = previousPageVerticalPosition + (containerDiv.offsetWidth * 0.5);
            const wasOutsideViewport = (previousViewportCenter < containerLeft || previousViewportCenter > containerRight);
            const isNowInsideViewport = (viewportCenter > containerLeft &&  viewportCenter < containerRight);
            
            if (wasOutsideViewport && isNowInsideViewport) {
                if (container == about1ContainerDiv && canAnimatePlantInformation) {
                    animatePlants();
                    canAnimatePlantInformation = false;
                }
                if (container == about2ContainerDiv && canAnimateBuildingInformation) {
                    animateBuildings();
                    canAnimateBuildingInformation = false;
                }
                if (container == about3ContainerDiv && canAnimateBuilding2Information) {
                    animateBuildings2();
                    canAnimateBuilding2Information = false;
                }
                if (container == experience1ContainerDiv) {
                    if (!canAnimateRobotInformation) {
                        animateRobotHands();
                    } else {
                        animateRobot();
                        animateExperienceTextContainer(0);
                        animateChainBlockAndStringContainer(0);
                        canAnimateRobotInformation = false;
                    }
                }
                if (container == experience2ContainerDiv) {
                    if (!canAnimateSquidInformation) {
                        animateSquidHands();
                    } else {
                        animateSquid();
                        animateExperienceTextContainer(1);
                        animateChainBlockAndStringContainer(1);
                        canAnimateSquidInformation = false;
                    }
                }
                if (container == experience3ContainerDiv) {
                    if (!canAnimateAlienInformation) {
                        animateAlienHand();
                    } else {
                        animateAlien();
                        animateExperienceTextContainer(2);
                        animateChainBlockAndStringContainer(2);
                        canAnimateAlienInformation = false;
                    }
                }
            }
        }
    }
    if (isAleSwimming) {
        for (e = 0; e < seaInformationContainerArray.length; e++) {
            const container = seaInformationContainerArray[e];
            const containerLeft = sea1Div.offsetLeft + container.offsetLeft;
            const containerRight = containerLeft + container.offsetWidth;
            const viewportCenter = pageVerticalPosition + (containerDiv.offsetWidth * 0.5);
            const previousViewportCenter = previousPageVerticalPosition + (containerDiv.offsetWidth * 0.5);
            const wasOutsideViewport = (previousViewportCenter < containerLeft || previousViewportCenter > containerRight);
            const isNowInsideViewport = (viewportCenter > containerLeft && viewportCenter < containerRight);
            
            if (wasOutsideViewport && isNowInsideViewport) {
                if (container == skill1ContainerDiv) {
                    makeSeaAnimalsBlinking(fishEyeArray);
                    if (canAnimateFishInformation) {
                        animateSeaAnimals(fishArray);
                        canAnimateFishInformation = false;
                    }
                }
                if (container == skill2ContainerDiv) {
                    makeSeaAnimalsBlinking(crabEyeArray);
                    if (canAnimateCrabInformation) {
                        animateSeaAnimals(crabArray);
                        canAnimateCrabInformation = false;
                    }
                }
                if (container == skill3ContainerDiv) {
                    makeSeaAnimalsBlinking(turtleEyeArray);
                    if (canAnimateTurtleInformation) {
                        animateSeaAnimals(turtleArray);
                        canAnimateTurtleInformation = false;
                    }
                }
            }
        }
    }
}

// ─── Experience: robot ───────────────────────────────────────────────────────
function animateRobot() {
    $(robotDiv).stop().animate({
        left: "420px"
    }, 1e3, function () {
        animatePiechartAolFront();
        animateRobotHands()
    })
}

function animateRobotHands() {
    spinRobotHands();
    clearInterval(animateRobotHandsTimer);
    animateRobotHandsTimer = setInterval(function () {
        spinRobotHands()
    }, 4e3)
}

function spinRobotHands() {
    clearInterval(spinRobotHandsTimer);
    spinRobotHandsTimer = setInterval(function () {
        changeRobotHands()
    }, 100)
}

function changeRobotHands() {
    if (changeRobotHandsCounter >= robotHandChildrenLength) {
        changeRobotHandsCounter = 0;
        clearInterval(spinRobotHandsTimer);
        setRobotHandsToDefault();
        if (pageVerticalPosition + .5 * containerDiv.offsetWidth < experience1ContainerDiv.offsetLeft ||
            pageVerticalPosition + .5 * containerDiv.offsetWidth > experience1ContainerDiv.offsetLeft + experience1ContainerDiv.offsetWidth)
            clearInterval(animateRobotHandsTimer)
    } else {
        for (var e = 0; e < robotHandChildrenLength; e++) {
            if (e === changeRobotHandsCounter) setRobotHandsToOpaque(e);
            else setRobotHandsToTransparent(e)
        }
    }
    changeRobotHandsCounter += 1
}

function setRobotHandsToDefault() {
    for (var e = 0; e < robotHandChildrenLength; e++) {
        if (e === 0) setRobotHandsToOpaque(e);
        else setRobotHandsToTransparent(e)
    }
}

function setRobotHandsToOpaque(e) {
    robotHandLeftDiv.children[e].style.opacity = 1;
    robotHandLeftDiv.children[e].style.filter = "alpha(opacity=100)";
    robotHandRightDiv.children[e].style.opacity = 1;
    robotHandRightDiv.children[e].style.filter = "alpha(opacity=100)"
}

function setRobotHandsToTransparent(e) {
    robotHandLeftDiv.children[e].style.opacity = 0;
    robotHandLeftDiv.children[e].style.filter = "alpha(opacity=0)";
    robotHandRightDiv.children[e].style.opacity = 0;
    robotHandRightDiv.children[e].style.filter = "alpha(opacity=0)"
}

// ─── Experience: squid ───────────────────────────────────────────────────────
function animateSquid() {
    $(squidDiv).stop().animate({
        left: "430px"
    }, 1e3, function () {
        animatePiechartIncognitoFront();
        animateSquidHands()
    })
}

function animateSquidHands() {
    moveSquidHands();
    clearInterval(animateSquidHandsTimer);
    animateSquidHandsTimer = setInterval(function () {
        moveSquidHands()
    }, 4e3)
}

function moveSquidHands() {
    clearInterval(moveSquidHandsTimer);
    moveSquidHandsTimer = setInterval(function () {
        openAndCloseSquidHands()
    }, 200)
}

function openAndCloseSquidHands() {
    if (openAndCloseSquidHandsCounter >= 8) {
        openAndCloseSquidHandsCounter = 0;
        clearInterval(moveSquidHandsTimer);
        openSquidHands();
        if (pageVerticalPosition + .5 * containerDiv.offsetWidth < experience2ContainerDiv.offsetLeft ||
            pageVerticalPosition + .5 * containerDiv.offsetWidth > experience2ContainerDiv.offsetLeft + experience2ContainerDiv.offsetWidth)
            clearInterval(animateSquidHandsTimer)
    } else if (openAndCloseSquidHandsCounter % 2 === 0) {
        openSquidHands()
    } else {
        closeSquidHands()
    }
    openAndCloseSquidHandsCounter += 1
}

function openSquidHands() {
    for (var e = 0; e < squidHandOpenArray.length; e++) {
        squidHandOpenArray[e].style.opacity = 1;
        squidHandOpenArray[e].style.filter = "alpha(opacity=100)"
    }
    for (e = 0; e < squidHandCloseArray.length; e++) {
        squidHandCloseArray[e].style.opacity = 0;
        squidHandCloseArray[e].style.filter = "alpha(opacity=0)"
    }
}

function closeSquidHands() {
    for (var e = 0; e < squidHandOpenArray.length; e++) {
        squidHandOpenArray[e].style.opacity = 0;
        squidHandOpenArray[e].style.filter = "alpha(opacity=0)"
    }
    for (e = 0; e < squidHandCloseArray.length; e++) {
        squidHandCloseArray[e].style.opacity = 1;
        squidHandCloseArray[e].style.filter = "alpha(opacity=100)"
    }
}

// ─── Experience: alien ───────────────────────────────────────────────────────
function animateAlienHand() {
    clearInterval(animateAlienHandsTimer);
    animateAlienHandsTimer = setInterval(function () {
        rotateAlienHands()
    }, 100)
}

function rotateAlienHands() {
    alienSteerPreviousAngle = alienSteerAngle;
    alienSteerAngle += alienSteerAngleIncrement;
    if (alienSteerPreviousAngle < alienSteerAngle) {
        if (alienSteerAngle > alienSteerAngleLimit) { alienSteerAngleIncrement *= -1; alienSteerAngleLimit *= -1 }
    } else {
        if (alienSteerAngle < alienSteerAngleLimit) { alienSteerAngleIncrement *= -1; alienSteerAngleLimit *= -1 }
    }
    const isOutsideViewport =
        pageVerticalPosition + .5 * containerDiv.offsetWidth < experience3ContainerDiv.offsetLeft ||
        pageVerticalPosition + .5 * containerDiv.offsetWidth > experience3ContainerDiv.offsetLeft + experience3ContainerDiv.offsetWidth;
    if (alienSteerAngle === 0 && isOutsideViewport) {
        clearInterval(animateAlienHandsTimer);
        alienSteerDiv.style.webkitTransform = "rotate(0deg)";
        alienSteerDiv.style.MozTransform = "rotate(0deg)";
        alienSteerDiv.style.OTransform = "rotate(0deg)";
        alienSteerDiv.style.msTransform = "rotate(0deg)";
        alienSteerDiv.style.transform = "rotate(0deg)"
    } else {
        alienSteerDiv.style.webkitTransform = "rotate(" + alienSteerAngle + "deg)";
        alienSteerDiv.style.MozTransform = "rotate(" + alienSteerAngle + "deg)";
        alienSteerDiv.style.OTransform = "rotate(" + alienSteerAngle + "deg)";
        alienSteerDiv.style.msTransform = "rotate(" + alienSteerAngle + "deg)";
        alienSteerDiv.style.transform = "rotate(" + alienSteerAngle + "deg)"
    }
}

function animateAlien() {
    $(alienDiv).stop().animate({
        left: "450px"
    }, 1e3, function () {
        animatePiechartFoxnewsFront();
        animateAlienHand()
    })
}

// ─── Piecharts ───────────────────────────────────────────────────────────────
function animatePiechartAolFront() {
    browserName === "internet explorer" && browserVersion <= 8 ? animatePiechartAolText() : $(piechartRobotFrontDiv).stop().animate({
        opacity: 1
    }, 500, function () {
        animatePiechartAolText()
    })
}

function animatePiechartIncognitoFront() {
    browserName === "internet explorer" && browserVersion <= 8 ? animatePiechartIncognitoText() : $(piechartSquidFrontDiv).stop().animate({
        opacity: 1
    }, 500, function () {
        animatePiechartIncognitoText()
    })
}

function animatePiechartFoxnewsFront() {
    browserName === "internet explorer" && browserVersion <= 8 ? animatePiechartFoxnewsText() : $(piechartAlienFrontDiv).stop().animate({
        opacity: 1
    }, 500, function () {
        animatePiechartFoxnewsText()
    })
}

function animatePiechartAolText() {
    animatePiechartAolTextCode();
    animatePiechartAolTextGraphic();
    animatePiechartAolTextAnimation()
}

function animatePiechartAolTextCode() {
    $(piechartRobotTextCode1Div).stop().animate({ opacity: 1 }, 1e3, function () { });
    $(piechartRobotTextCode2Div).stop().animate({ opacity: 1 }, 1e3, function () { })
}

function animatePiechartAolTextGraphic() {
    $(piechartRobotTextGraphic1Div).stop().delay(300).animate({ opacity: 1 }, 1e3, function () { });
    $(piechartRobotTextGraphic2Div).stop().delay(300).animate({ opacity: 1 }, 1e3, function () { })
}

function animatePiechartAolTextAnimation() {
    $(piechartRobotTextAnimation1Div).stop().delay(600).animate({ opacity: 1 }, 1e3, function () { });
    $(piechartRobotTextAnimation2Div).stop().delay(600).animate({ opacity: 1 }, 1e3, function () { })
}

function animatePiechartIncognitoText() {
    animatePiechartIncognitoTextCode();
    animatePiechartIncognitoTextAnimation();
    animatePiechartIncognitoTextGraphic()
}

function animatePiechartIncognitoTextCode() {
    $(piechartSquidTextCode1Div).stop().animate({ opacity: 1 }, 1e3, function () { });
    $(piechartSquidTextCode2Div).stop().animate({ opacity: 1 }, 1e3, function () { })
}

function animatePiechartIncognitoTextAnimation() {
    $(piechartSquidTextAnimation1Div).stop().delay(300).animate({ opacity: 1 }, 1e3, function () { });
    $(piechartSquidTextAnimation2Div).stop().delay(300).animate({ opacity: 1 }, 1e3, function () { })
}

function animatePiechartIncognitoTextGraphic() {
    $(piechartSquidTextGraphic1Div).stop().delay(600).animate({ opacity: 1 }, 1e3, function () { });
    $(piechartSquidTextGraphic2Div).stop().delay(600).animate({ opacity: 1 }, 1e3, function () { })
}

function animatePiechartFoxnewsText() {
    animatePiechartFoxnewsTextGraphic();
    animatePiechartFoxnewsTextAnimation();
    animatePiechartFoxnewsTextCode()
}

function animatePiechartFoxnewsTextCode() {
    $(piechartAlienTextCode1Div).stop().animate({ opacity: 1 }, 1e3, function () { });
    $(piechartAlienTextCode2Div).stop().animate({ opacity: 1 }, 1e3, function () { })
}

function animatePiechartFoxnewsTextAnimation() {
    $(piechartAlienTextAnimation1Div).stop().delay(300).animate({ opacity: 1 }, 1e3, function () { });
    $(piechartAlienTextAnimation2Div).stop().delay(300).animate({ opacity: 1 }, 1e3, function () { })
}

function animatePiechartFoxnewsTextGraphic() {
    $(piechartAlienTextGraphic1Div).stop().delay(600).animate({ opacity: 1 }, 1e3, function () { });
    $(piechartAlienTextGraphic2Div).stop().delay(600).animate({ opacity: 1 }, 1e3, function () { })
}

// ─── Sea: bubble ─────────────────────────────────────────────────────────────
function createBubble() {
    clearInterval(bubbleTimer);
    bubbleTimer = setInterval(function () { animateBubble() }, 3e3)
}

function animateBubble() {
    var e = aleContainerDiv.offsetTop - (sea1Div.offsetTop - shiftUpLayerHorizontalDistance);
    positionBubble(e);
    showBubble();
    $(bubbleDiv).stop().animate({ top: "0px" }, 2 * e, function () { hideBubble() })
}

function hideBubble() {
    $(bubbleDiv).fadeTo(0, 0)
}

function showBubble() {
    $(bubbleDiv).fadeTo(0, 1)
}

function positionBubble(e) {
    bubbleDiv.style.left = pageVerticalPosition + .5 * containerDiv.offsetWidth - sea1Div.offsetLeft + "px";
    bubbleDiv.style.top = e + "px"
}

// ─── Sea animals: blink ──────────────────────────────────────────────────────
function blinkSeaAnimals(e) {
    for (var t = e, i = [], n = Math.ceil(5 * Math.random()), a = 0; a < n; a++) {
        var o = Math.floor(Math.random() * e.length);
        i.push(t[o])
    }
    for (a = 0; a < i.length; a++) {
        $(i[a]).fadeTo(0, 1);
        $(i[a]).stop().delay(300).animate({ opacity: 0 }, 0, function () { })
    }
}

function makeSeaAnimalsBlinking(e) {
    clearInterval(blinkSeaAnimalsTimer);
    blinkSeaAnimalsTimer = setInterval(function () { blinkSeaAnimals(e) }, 3e3)
}

// ─── Contact & social ────────────────────────────────────────────────────────
function positionContactContainer() {
    contactContainerDiv.style.top = layerVerticalArray[layerVerticalArray.length - 1].offsetTop + "px";
    contactContainerDiv.style.left = layerVerticalArray[layerVerticalArray.length - 1].offsetLeft + "px"
}

function positionFireworksContainer() {
    fireworksContainerDiv.style.top = layerVerticalArray[layerVerticalArray.length - 1].offsetTop + "px";
    fireworksContainerDiv.style.left = layerVerticalArray[layerVerticalArray.length - 1].offsetLeft + "px"
}

function positionSocialContainer() {
    if (canAnimateSocialContainer) {
        setSocialContainerOpacity(0);
        socialContainerDiv.style.top = "80%"
    } else {
        socialContainerDiv.style.top = "0px"
    }
}

function animateSocialContainer() {
    if (canAnimateSocialContainer) {
        $(socialContainerDiv).stop().animate({ top: [0, "easeOutCubic"] }, 1e3, function () { });
        setSocialContainerOpacity(1);
        canAnimateSocialContainer = false
    }
}

function setSocialContainerOpacity(e) {
    if (e > 1) { e = 1 }
    if (e < 0) { e = 0 }
    for (var t = $(socialContainerDiv).children().length, i = 0; i < t; i++) {
        $(socialContainerDiv.children[i]).fadeTo(0, e)
    }
    var n = $(socialContainerDiv.children[1]).children().length;
    for (i = 0; i < n; i++) {
        $(socialContainerDiv.children[1].children[i]).fadeTo(0, e)
    }
}

// ─── Ale: happy state ────────────────────────────────────────────────────────
function happyAle() {
    if (!isAleHappy) {
        clearInterval(happyAleTimer);
        happyAleTimer = setInterval(function () { aleHandsUp() }, 3e3);
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
    setTimeout(function () { setAleStaticFrame() }, 1e3)
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

// ─── Stars & alien eyes ──────────────────────────────────────────────────────
function animateStarsAndAlienEyes() {
    clearInterval(starsAndAlienTimer);
    starsAndAlienTimer = setInterval(function () {
        switchStarsColor();
        switchAlienEyes()
    }, 1e3)
}

function switchStarsColor() {
    $(stars).fadeTo(0, 0);
    $(stars).stop().delay(500).animate({ opacity: 1 }, 0, function () { })
}

function switchAlienEyes() {
    $(alienEyes).fadeTo(0, 0);
    $(alienEyes).stop().delay(500).animate({ opacity: 1 }, 0, function () { })
}

// ─── Sea floor ───────────────────────────────────────────────────────────────
function positionSeaFloorObjectsVertically() {
    for (var e = 0; e < seaFloorFrontObjectArray.length; e++)
        seaFloorFrontObjectArray[e].offsetHeight > sea1Div.offsetHeight ? seaFloorFrontObjectArray[e].style.bottom = -1 * (seaFloorFrontObjectArray[e].offsetHeight - sea1Div.offsetHeight) + "px" : seaFloorFrontObjectArray[e].style.bottom = "0px";
    for (e = 0; e < seaFloorBackObjectArray.length; e++)
        seaFloorBackObjectArray[e].offsetHeight > sea1Div.offsetHeight ? seaFloorBackObjectArray[e].style.bottom = -.7 * containerDiv.offsetHeight - (seaFloorBackObjectArray[e].offsetHeight - sea1Div.offsetHeight) + "px" : seaFloorBackObjectArray[e].style.bottom = "-70%"
}

// ─── Scroll / swipe hint text ────────────────────────────────────────────────
function animateScrollOrSwipeTextContainer() {
    if (canAnimateScrollOrSwipeTextContainer) {
        canAnimateScrollOrSwipeTextContainer = false;
        clearInterval(scrollOrSwipeTextContainerTimer);
        scrollOrSwipeTextContainerTimer = setInterval(function () { turnOnAndOffScrollOrSwipeTextContainer() }, 1e3)
    }
}

function turnOnAndOffScrollOrSwipeTextContainer() {
    if (deviceName === "computer") {
        $(scrollOrSwipeTextContainer1Div).fadeTo(0, 1);
        $(scrollOrSwipeTextContainer1Div).stop().delay(500).animate({ opacity: 0 }, 0, function () { })
    } else {
        $(scrollOrSwipeTextContainer2Div).fadeTo(0, 1);
        $(scrollOrSwipeTextContainer2Div).stop().delay(500).animate({ opacity: 0 }, 0, function () { })
    }
}

function hideScrollOrSwipeTextContainer() {
    if (canHideScrollOrSwipeTextContainer) {
        clearInterval(scrollOrSwipeTextContainerTimer);
        fadeOutScrollOrSwipeTextContainer();
        canHideScrollOrSwipeTextContainer = false
    }
}

function fadeOutScrollOrSwipeTextContainer() {
    $(scrollOrSwipeTextContainer1Div).fadeTo(0, 0);
    $(scrollOrSwipeTextContainer2Div).fadeTo(0, 0)
}

// ─── Contact confirmation & form ─────────────────────────────────────────────
function positionContactConfirmationContainer() {
    for (var e = 0; e < contactConfirmationContainerArray.length; e++) {
        contactConfirmationContainerArray[e].style.left = layersMovement === "not moving 1" || layersMovement === "not moving 2" ? aleContainerDiv.offsetLeft + "px" : aleMaxHorizontalDistance + "px";
        contactConfirmationContainerArray[e].style.top = .8 * containerDiv.offsetHeight - 370 + "px"
    }
}

function hideContactConfirmationContainer() {
    if (isContactConfirmationContainerVisible) {
        for (var e = 0; e < contactConfirmationContainerArray.length; e++)
            for (var t = $(contactConfirmationContainerArray[e]).children().children().length, i = 0; i < t; i++)
                $(contactConfirmationContainerArray[e].children[0].children[i]).fadeTo(0, 0);
        isContactConfirmationContainerVisible = false
    }
}

function showContactConfirmationContainer(e) {
    for (var t = $(contactConfirmationContainerArray[e]).children().children().length, i = 0; i < t; i++)
        $(contactConfirmationContainerArray[e].children[0].children[i]).fadeTo(0, 1);
    isContactConfirmationContainerVisible = true
}

function focusEmail() {
    emailAddressDiv.focus()
}

function focusSubject() {
    emailSubjectDiv.focus()
}

function focusMessage() {
    emailMessageDiv.focus()
}

function clearAllInputField() {
    emailAddressDiv.value = "";
    emailSubjectDiv.value = "";
    emailMessageDiv.value = ""
}

// ─── Fireworks ───────────────────────────────────────────────────────────────
function createFireworkSvg() {
    if (!(browserName === "internet explorer" && browserVersion <= 8))
        for (var e = 0; e < fireworkArray.length; e++) {
            var t = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            t.setAttribute("version", "1.2");
            t.setAttribute("baseProfile", "tiny");
            t.setAttribute("width", "100%");
            t.setAttribute("height", "100%");
            fireworkSvgArray.push(t)
        }
}

function appendFireworkSvgToContainer() {
    if (!(browserName === "internet explorer" && browserVersion <= 8))
        for (var e = 0; e < fireworkArray.length; e++)
            fireworkArray[e].appendChild(fireworkSvgArray[e])
}

function drawManyFireworks() {
    if (!(browserName === "internet explorer" && browserVersion <= 8) && canDrawManyFireworks) {
        clearInterval(drawFireworkTimer);
        drawFireworkTimer = setInterval(function () { drawFirework() }, 1e3);
        canDrawManyFireworks = false
    }
}

function drawFirework() {
    if (drawFireworkCounter >= fireworkArray.length) {
        drawFireworkCounter = 0;
        clearInterval(drawFireworkTimer)
    } else {
        clearInterval(drawOneLayerOfFireworkTimer);
        drawOneLayerOfFireworkTimer = setInterval(function () { drawOneLayerOfFirework() }, 40)
    }
}

function drawOneLayerOfFirework() {
    if (fireworkLayerNumber < fireworkRowNumber) {
        fireworkLayerNumber += 1;
        for (var e = 0; e < fireworkColumnNumber; e++) {
            var t = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            t.setAttribute("cx", String(fireworkCenterX + Math.cos(e * fireworkOneRotationAngle) * (fireworkLayerNumber * fireworkOneRadiusDistance)));
            t.setAttribute("cy", String(fireworkCenterY + Math.sin(e * fireworkOneRotationAngle) * (fireworkLayerNumber * fireworkOneRadiusDistance)));
            t.setAttribute("r", fireworkDotRadius);
            t.setAttribute("fill", "#ffffff");
            fireworkSvgArray[drawFireworkCounter].appendChild(t)
        }
    } else {
        fireworkLayerNumber = 0;
        clearInterval(drawOneLayerOfFireworkTimer);
        makeFireworkDisappear(drawFireworkCounter);
        drawFireworkCounter += 1
    }
}

function makeFireworkDisappear(e) {
    $(fireworkArray[e]).fadeTo(1e3, 0)
}

function resetFireworkSvg() {
    for (var e = 0; e < fireworkArray.length; e++) {
        $(fireworkSvgArray[e]).empty();
        $(fireworkArray[e]).fadeTo(0, 1)
    }
}

function printResizeText() { }

function printScrollSwipeText() { }
