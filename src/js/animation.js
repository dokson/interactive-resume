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
    }, 1000, function () { })
}

function animateBuildings2() {
    for (var e = 0; e < building2Array.length; e++) $(building2Array[e]).stop().delay(300 * e).animate({
        left: [building2TargetLeftArray[e], "easeOutCubic"]
    }, 1000, function () { })
}

function positionBuildings() {
    for (var e = 0; e < buildingArray.length; e++) buildingArray[e].style.left = buildingEarlyPositionArray[e] + "px"
}

function positionBuildings2() {
    for (var e = 0; e < building2Array.length; e++) building2Array[e].style.left = building2EarlyPositionArray[e] + "px"
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
    }, 1000, function () {
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
    $(piechartRobotTextCode1Div).stop().animate({ opacity: 1 }, 1000, function () { });
    $(piechartRobotTextCode2Div).stop().animate({ opacity: 1 }, 1000, function () { })
}

function animatePiechartAolTextGraphic() {
    $(piechartRobotTextGraphic1Div).stop().delay(300).animate({ opacity: 1 }, 1000, function () { });
    $(piechartRobotTextGraphic2Div).stop().delay(300).animate({ opacity: 1 }, 1000, function () { })
}

function animatePiechartAolTextAnimation() {
    $(piechartRobotTextAnimation1Div).stop().delay(600).animate({ opacity: 1 }, 1000, function () { });
    $(piechartRobotTextAnimation2Div).stop().delay(600).animate({ opacity: 1 }, 1000, function () { })
}

function animatePiechartIncognitoText() {
    animatePiechartIncognitoTextCode();
    animatePiechartIncognitoTextAnimation();
    animatePiechartIncognitoTextGraphic()
}

function animatePiechartIncognitoTextCode() {
    $(piechartSquidTextCode1Div).stop().animate({ opacity: 1 }, 1000, function () { });
    $(piechartSquidTextCode2Div).stop().animate({ opacity: 1 }, 1000, function () { })
}

function animatePiechartIncognitoTextAnimation() {
    $(piechartSquidTextAnimation1Div).stop().delay(300).animate({ opacity: 1 }, 1000, function () { });
    $(piechartSquidTextAnimation2Div).stop().delay(300).animate({ opacity: 1 }, 1000, function () { })
}

function animatePiechartIncognitoTextGraphic() {
    $(piechartSquidTextGraphic1Div).stop().delay(600).animate({ opacity: 1 }, 1000, function () { });
    $(piechartSquidTextGraphic2Div).stop().delay(600).animate({ opacity: 1 }, 1000, function () { })
}

function animatePiechartFoxnewsText() {
    animatePiechartFoxnewsTextGraphic();
    animatePiechartFoxnewsTextAnimation();
    animatePiechartFoxnewsTextCode()
}

function animatePiechartFoxnewsTextCode() {
    $(piechartAlienTextCode1Div).stop().animate({ opacity: 1 }, 1000, function () { });
    $(piechartAlienTextCode2Div).stop().animate({ opacity: 1 }, 1000, function () { })
}

function animatePiechartFoxnewsTextAnimation() {
    $(piechartAlienTextAnimation1Div).stop().delay(300).animate({ opacity: 1 }, 1000, function () { });
    $(piechartAlienTextAnimation2Div).stop().delay(300).animate({ opacity: 1 }, 1000, function () { })
}

function animatePiechartFoxnewsTextGraphic() {
    $(piechartAlienTextGraphic1Div).stop().delay(600).animate({ opacity: 1 }, 1000, function () { });
    $(piechartAlienTextGraphic2Div).stop().delay(600).animate({ opacity: 1 }, 1000, function () { })
}

// ─── Stars & alien eyes ──────────────────────────────────────────────────────
function animateStarsAndAlienEyes() {
    clearInterval(starsAndAlienTimer);
    starsAndAlienTimer = setInterval(function () {
        switchStarsColor();
        switchAlienEyes()
    }, 1000)
}

function switchStarsColor() {
    $(stars).fadeTo(0, 0);
    $(stars).stop().delay(500).animate({ opacity: 1 }, 0, function () { })
}

function switchAlienEyes() {
    $(alienEyes).fadeTo(0, 0);
    $(alienEyes).stop().delay(500).animate({ opacity: 1 }, 0, function () { })
}

// ─── Scroll / swipe hint text ────────────────────────────────────────────────
function animateScrollOrSwipeTextContainer() {
    if (canAnimateScrollOrSwipeTextContainer) {
        canAnimateScrollOrSwipeTextContainer = false;
        clearInterval(scrollOrSwipeTextContainerTimer);
        scrollOrSwipeTextContainerTimer = setInterval(function () { turnOnAndOffScrollOrSwipeTextContainer() }, 1000)
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
