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
function animateElementsLeft(elements, targets) {
    for (var e = 0; e < elements.length; e++) {
        $(elements[e]).stop().delay(300 * e).animate({
            left: [targets[e], "easeOutCubic"]
        }, 1000, function () { });
    }
}

function animateBuildings() {
    animateElementsLeft(buildingArray, buildingTargetLeftArray);
}

function animateBuildings2() {
    animateElementsLeft(building2Array, building2TargetLeftArray);
}

function positionElementsLeft(elements, positions) {
    for (var e = 0; e < elements.length; e++) {
        elements[e].style.left = positions[e] + "px";
    }
}

function positionBuildings() {
    positionElementsLeft(buildingArray, buildingEarlyPositionArray);
}

function positionBuildings2() {
    positionElementsLeft(building2Array, building2EarlyPositionArray);
}

// ─── Sea animals ─────────────────────────────────────────────────────────────
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

// ─── Sea: bubble ─────────────────────────────────────────────────────────────
function createBubble() {
    clearInterval(bubbleTimer);
    bubbleTimer = setInterval(function () { animateBubble() }, 3000)
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
    blinkSeaAnimalsTimer = setInterval(function () { blinkSeaAnimals(e) }, 3000)
}

// ─── Sea floor ───────────────────────────────────────────────────────────────
function positionSeaFloorObjectsVertically() {
    for (var e = 0; e < seaFloorFrontObjectArray.length; e++)
        seaFloorFrontObjectArray[e].offsetHeight > sea1Div.offsetHeight ? seaFloorFrontObjectArray[e].style.bottom = -1 * (seaFloorFrontObjectArray[e].offsetHeight - sea1Div.offsetHeight) + "px" : seaFloorFrontObjectArray[e].style.bottom = "0px";
    for (e = 0; e < seaFloorBackObjectArray.length; e++)
        seaFloorBackObjectArray[e].offsetHeight > sea1Div.offsetHeight ? seaFloorBackObjectArray[e].style.bottom = -.7 * containerDiv.offsetHeight - (seaFloorBackObjectArray[e].offsetHeight - sea1Div.offsetHeight) + "px" : seaFloorBackObjectArray[e].style.bottom = "-70%"
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
    }, 1000, function () { })
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
    }, 1000, function () { })
}

function hidePiechartElements(frontDiv, textDivs) {
    for (var i = 0; i < textDivs.length; i++) {
        $(textDivs[i]).fadeTo(0, 0);
    }
    if (!(browserName === "internet explorer" && browserVersion <= 8)) {
        $(frontDiv).fadeTo(0, 0);
    }
}

function positionExperience1Elements() {
    robotDiv.style.left = experience1ContainerDiv.offsetWidth + "px";
    hidePiechartElements(piechartRobotFrontDiv, [
        piechartRobotTextGraphic1Div, piechartRobotTextGraphic2Div,
        piechartRobotTextAnimation1Div, piechartRobotTextAnimation2Div,
        piechartRobotTextCode1Div, piechartRobotTextCode2Div
    ]);
}

function positionExperience2Elements() {
    squidDiv.style.left = experience2ContainerDiv.offsetWidth + "px";
    hidePiechartElements(piechartSquidFrontDiv, [
        piechartSquidTextGraphic1Div, piechartSquidTextGraphic2Div,
        piechartSquidTextAnimation1Div, piechartSquidTextAnimation2Div,
        piechartSquidTextCode1Div, piechartSquidTextCode2Div
    ]);
}

function positionExperience3Elements() {
    alienDiv.style.left = experience3ContainerDiv.offsetWidth + "px";
    hidePiechartElements(piechartAlienFrontDiv, [
        piechartAlienTextGraphic1Div, piechartAlienTextGraphic2Div,
        piechartAlienTextAnimation1Div, piechartAlienTextAnimation2Div,
        piechartAlienTextCode1Div, piechartAlienTextCode2Div
    ]);
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
            const isNowInsideViewport = (viewportCenter > containerLeft && viewportCenter < containerRight);

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
    }, 1000, function () {
        animatePiechartAolFront();
        animateRobotHands()
    })
}

function animateRobotHands() {
    spinRobotHands();
    clearInterval(animateRobotHandsTimer);
    animateRobotHandsTimer = setInterval(function () {
        spinRobotHands()
    }, 4000)
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

function setElementOpacity(element, opacity) {
    if (element) {
        element.style.opacity = opacity;
        element.style.filter = "alpha(opacity=" + (opacity * 100) + ")";
    }
}

function setRobotHandsToOpaque(e) {
    setElementOpacity(robotHandLeftDiv.children[e], 1);
    setElementOpacity(robotHandRightDiv.children[e], 1);
}

function setRobotHandsToTransparent(e) {
    setElementOpacity(robotHandLeftDiv.children[e], 0);
    setElementOpacity(robotHandRightDiv.children[e], 0);
}

// ─── Experience: squid ───────────────────────────────────────────────────────
function animateSquid() {
    $(squidDiv).stop().animate({
        left: "430px"
    }, 1000, function () {
        animatePiechartIncognitoFront();
        animateSquidHands()
    })
}

function animateSquidHands() {
    moveSquidHands();
    clearInterval(animateSquidHandsTimer);
    animateSquidHandsTimer = setInterval(function () {
        moveSquidHands()
    }, 4000)
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
        setElementOpacity(squidHandOpenArray[e], 1);
    }
    for (e = 0; e < squidHandCloseArray.length; e++) {
        setElementOpacity(squidHandCloseArray[e], 0);
    }
}

function closeSquidHands() {
    for (var e = 0; e < squidHandOpenArray.length; e++) {
        setElementOpacity(squidHandOpenArray[e], 0);
    }
    for (e = 0; e < squidHandCloseArray.length; e++) {
        setElementOpacity(squidHandCloseArray[e], 1);
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
    }, 1000, function () {
        animatePiechartFoxnewsFront();
        animateAlienHand()
    })
}

// ─── Piecharts ───────────────────────────────────────────────────────────────
function animatePiechartFront(frontDiv, callback) {
    if (browserName === "internet explorer" && browserVersion <= 8) {
        callback();
    } else {
        $(frontDiv).stop().animate({ opacity: 1 }, 500, function () {
            callback();
        });
    }
}

function animatePiechartAolFront() { animatePiechartFront(piechartRobotFrontDiv, animatePiechartAolText); }
function animatePiechartIncognitoFront() { animatePiechartFront(piechartSquidFrontDiv, animatePiechartIncognitoText); }
function animatePiechartFoxnewsFront() { animatePiechartFront(piechartAlienFrontDiv, animatePiechartFoxnewsText); }

function animatePiechartTextPair(div1, div2, delayOffset) {
    $(div1).stop().delay(delayOffset).animate({ opacity: 1 }, 1000, function () { });
    $(div2).stop().delay(delayOffset).animate({ opacity: 1 }, 1000, function () { });
}

function animatePiechartAolText() {
    animatePiechartTextPair(piechartRobotTextCode1Div, piechartRobotTextCode2Div, 0);
    animatePiechartTextPair(piechartRobotTextGraphic1Div, piechartRobotTextGraphic2Div, 300);
    animatePiechartTextPair(piechartRobotTextAnimation1Div, piechartRobotTextAnimation2Div, 600);
}

function animatePiechartIncognitoText() {
    animatePiechartTextPair(piechartSquidTextCode1Div, piechartSquidTextCode2Div, 0);
    animatePiechartTextPair(piechartSquidTextAnimation1Div, piechartSquidTextAnimation2Div, 300);
    animatePiechartTextPair(piechartSquidTextGraphic1Div, piechartSquidTextGraphic2Div, 600);
}

function animatePiechartFoxnewsText() {
    animatePiechartTextPair(piechartAlienTextCode1Div, piechartAlienTextCode2Div, 0);
    animatePiechartTextPair(piechartAlienTextAnimation1Div, piechartAlienTextAnimation2Div, 300);
    animatePiechartTextPair(piechartAlienTextGraphic1Div, piechartAlienTextGraphic2Div, 600);
}

// ─── Stars & alien eyes ──────────────────────────────────────────────────────
function animateStarsAndAlienEyes() {
    clearInterval(starsAndAlienTimer);
    starsAndAlienTimer = setInterval(function () {
        switchStarsColor();
        switchAlienEyes();
    }, 1000)
}

function switchElementOpacity(element) {
    $(element).fadeTo(0, 0);
    $(element).stop().delay(500).animate({ opacity: 1 }, 0, function () { });
}

function switchStarsColor() {
    switchElementOpacity(stars);
}

function switchAlienEyes() {
    switchElementOpacity(alienEyes);
}

// ─── Scroll / swipe hint text ────────────────────────────────────────────────
function animateScrollOrSwipeTextContainer() {
    if (canAnimateScrollOrSwipeTextContainer) {
        canAnimateScrollOrSwipeTextContainer = false;
        clearInterval(scrollOrSwipeTextContainerTimer);
        scrollOrSwipeTextContainerTimer = setInterval(function () { turnOnAndOffScrollOrSwipeTextContainer() }, 1000)
    }
}

function toggleScrollSwipeText(container) {
    $(container).fadeTo(0, 1);
    $(container).stop().delay(500).animate({ opacity: 0 }, 0, function () { });
}

function turnOnAndOffScrollOrSwipeTextContainer() {
    if (deviceName === "computer") {
        toggleScrollSwipeText(scrollOrSwipeTextContainer1Div);
    } else {
        toggleScrollSwipeText(scrollOrSwipeTextContainer2Div);
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
