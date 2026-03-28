// ─── rAF-based interval (syncs with display refresh, pauses in background) ──
var rafIntervals = {};
var rafIntervalNextId = 0;

function setRafInterval(callback, interval) {
    var id = ++rafIntervalNextId;
    var lastTime = performance.now();
    function loop(now) {
        if (!rafIntervals[id]) return;
        rafIntervals[id] = requestAnimationFrame(loop);
        if (now - lastTime >= interval) {
            lastTime = now;
            callback();
        }
    }
    rafIntervals[id] = requestAnimationFrame(loop);
    return id;
}

function clearRafInterval(id) {
    if (rafIntervals[id]) {
        cancelAnimationFrame(rafIntervals[id]);
        delete rafIntervals[id];
    }
}

// ─── About: plants ───────────────────────────────────────────────────────────
function animatePlants() {
    for (let i = 0; i < plantArray.length; i++) $(plantArray[i]).stop().delay(300 * i).animate({
        top: [plantTargetTopObjectArray[i].offsetTop, "easeOutElastic"]
    }, 800, () => { })
}

function positionPlants() {
    for (let i = 0; i < plantArray.length; i++) plantArray[i].style.top = canAnimatePlantInformation ? "100%" : plantTargetTopObjectArray[i].offsetTop + "px"
}

// ─── About: buildings ────────────────────────────────────────────────────────
function animateElementsLeft(elements, targets) {
    for (let i = 0; i < elements.length; i++) {
        $(elements[i]).stop().delay(300 * i).animate({
            left: [targets[i], "easeOutCubic"]
        }, 1000, () => { });
    }
}

function animateBuildings() {
    animateElementsLeft(buildingArray, buildingTargetLeftArray);
}

function animateBuildings2() {
    animateElementsLeft(building2Array, building2TargetLeftArray);
}

function positionElementsLeft(elements, positions) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.left = positions[i] + "px";
    }
}

function positionBuildings() {
    positionElementsLeft(buildingArray, buildingEarlyPositionArray);
}

function positionBuildings2() {
    positionElementsLeft(building2Array, building2EarlyPositionArray);
}

// ─── Sea animals ─────────────────────────────────────────────────────────────
function positionSeaAnimals(animals, animalsPerRow, colSpacing, rowSpacing) {
    for (let animalIndex = 0, row = 0; row < animalsPerRow.length; row++)
        for (let col = 0; col < animalsPerRow[row]; col++) {
            animals[animalIndex].style.left = seaAnimalSwimDistance + col * colSpacing + "px";
            animals[animalIndex].style.top = row * rowSpacing + "px";
            animalIndex += 1
        }
}

function animateSeaAnimals(animalArray) {
    if (animalArray == fishArray) isFishStillAnimating = true;
    if (animalArray == crabArray) isCrabStillAnimating = true;
    if (animalArray == turtleArray) isTurtleStillAnimating = true;
    for (let i = 0; i < animalArray.length; i++) $(animalArray[i]).stop().delay(100 * i).animate({
        left: [animalArray[i].offsetLeft - seaAnimalSwimDistance, "easeOutCubic"]
    }, 600, () => {
        disableIsSeaAnimalStillAnimating(animalArray)
    })
}

function disableIsSeaAnimalStillAnimating(animalArray) {
    if (animalArray == fishArray) {
        if (fishAnimateNumber >= animalArray.length - 1) { isFishStillAnimating = false; fishAnimateNumber = 0 }
        else fishAnimateNumber += 1
    }
    if (animalArray == crabArray) {
        if (crabAnimateNumber >= animalArray.length - 1) { isCrabStillAnimating = false; crabAnimateNumber = 0 }
        else crabAnimateNumber += 1
    }
    if (animalArray == turtleArray) {
        if (turtleAnimateNumber >= animalArray.length - 1) { isTurtleStillAnimating = false; turtleAnimateNumber = 0 }
        else turtleAnimateNumber += 1
    }
}

// ─── Sea: bubble ─────────────────────────────────────────────────────────────
function createBubble() {
    clearInterval(bubbleTimer);
    bubbleTimer = setInterval(() => { animateBubble() }, 3000)
}

function animateBubble() {
    const topOffset = aleContainerDiv.offsetTop - (sea1Div.offsetTop - shiftUpLayerHorizontalDistance);
    positionBubble(topOffset);
    showBubble();
    $(bubbleDiv).stop().animate({ top: "0px" }, 2 * topOffset, () => { hideBubble() })
}

function hideBubble() {
    $(bubbleDiv).fadeTo(0, 0)
}

function showBubble() {
    $(bubbleDiv).fadeTo(0, 1)
}

function positionBubble(topOffset) {
    bubbleDiv.style.left = pageVerticalPosition + .5 * containerDiv.offsetWidth - sea1Div.offsetLeft + "px";
    bubbleDiv.style.top = topOffset + "px"
}

// ─── Sea animals: blink ──────────────────────────────────────────────────────
function blinkSeaAnimals(eyeArray) {
    const selectedEyes = [];
    const blinkCount = Math.ceil(5 * Math.random());
    for (let i = 0; i < blinkCount; i++) {
        const randomIndex = Math.floor(Math.random() * eyeArray.length);
        selectedEyes.push(eyeArray[randomIndex])
    }
    for (let i = 0; i < selectedEyes.length; i++) {
        $(selectedEyes[i]).fadeTo(0, 1);
        $(selectedEyes[i]).stop().delay(300).animate({ opacity: 0 }, 0, () => { })
    }
}

function makeSeaAnimalsBlinking(eyeArray) {
    clearInterval(blinkSeaAnimalsTimer);
    blinkSeaAnimalsTimer = setInterval(() => { blinkSeaAnimals(eyeArray) }, 3000)
}

// ─── Sea floor ───────────────────────────────────────────────────────────────
function positionSeaFloorObjectsVertically() {
    for (let i = 0; i < seaFloorFrontObjectArray.length; i++)
        seaFloorFrontObjectArray[i].offsetHeight > sea1Div.offsetHeight ? seaFloorFrontObjectArray[i].style.bottom = -1 * (seaFloorFrontObjectArray[i].offsetHeight - sea1Div.offsetHeight) + "px" : seaFloorFrontObjectArray[i].style.bottom = "0px";
    for (let i = 0; i < seaFloorBackObjectArray.length; i++)
        seaFloorBackObjectArray[i].offsetHeight > sea1Div.offsetHeight ? seaFloorBackObjectArray[i].style.bottom = -.7 * containerDiv.offsetHeight - (seaFloorBackObjectArray[i].offsetHeight - sea1Div.offsetHeight) + "px" : seaFloorBackObjectArray[i].style.bottom = "-70%"
}

// ─── Experience: containers & text ───────────────────────────────────────────
function positionChainBlockAndStringContainer() {
    for (let i = 0; i < chainBlockAndStringContainerArray.length; i++) {
        if (i === 0) canAnimateBossInformation = canAnimateRobotInformation;
        if (i === 1) canAnimateBossInformation = canAnimateSquidInformation;
        if (i === 2) canAnimateBossInformation = canAnimateAlienInformation;
        chainBlockAndStringContainerArray[i].style.left = .5 * experienceTextContainerArray[i].offsetWidth - .5 * chainBlockAndStringContainerArray[i].offsetWidth + "px";
        chainBlockAndStringContainerArray[i].style.bottom = canAnimateBossInformation ?
            .8 * containerDiv.offsetHeight + experienceTextContainerArray[i].offsetHeight + "px" :
            experienceTextContainerDistanceFromFloor + experienceTextContainerArray[i].offsetHeight + "px"
    }
}

function animateChainBlockAndStringContainer(index) {
    $(chainBlockAndStringContainerArray[index]).stop().animate({
        bottom: [experienceTextContainerDistanceFromFloor + experienceTextContainerArray[index].offsetHeight, "easeOutCubic"]
    }, 1000, () => { })
}

function positionExperienceTextContainer() {
    for (let i = 0; i < experienceTextContainerArray.length; i++) {
        if (i === 0) canAnimateBossInformation = canAnimateRobotInformation;
        if (i === 1) canAnimateBossInformation = canAnimateSquidInformation;
        if (i === 2) canAnimateBossInformation = canAnimateAlienInformation;
        experienceTextContainerArray[i].style.bottom = canAnimateBossInformation ?
            .8 * containerDiv.offsetHeight + "px" :
            experienceTextContainerDistanceFromFloor + "px"
    }
}

function animateExperienceTextContainer(index) {
    $(experienceTextContainerArray[index]).stop().animate({
        bottom: [experienceTextContainerDistanceFromFloor, "easeOutCubic"]
    }, 1000, () => { })
}

function hidePiechartElements(frontDiv, textDivs) {
    for (let i = 0; i < textDivs.length; i++) {
        $(textDivs[i]).fadeTo(0, 0);
    }
    $(frontDiv).fadeTo(0, 0);
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
        for (let i = 0; i < landInformationContainerArray.length; i++) {
            const container = landInformationContainerArray[i];
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
        for (let i = 0; i < seaInformationContainerArray.length; i++) {
            const container = seaInformationContainerArray[i];
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
    }, 1000, () => {
        animatePiechartAolFront();
        animateRobotHands()
    })
}

function animateRobotHands() {
    spinRobotHands();
    clearInterval(animateRobotHandsTimer);
    animateRobotHandsTimer = setInterval(() => {
        spinRobotHands()
    }, 4000)
}

function spinRobotHands() {
    clearRafInterval(spinRobotHandsTimer);
    spinRobotHandsTimer = setRafInterval(() => {
        changeRobotHands()
    }, 100)
}

function changeRobotHands() {
    if (changeRobotHandsCounter >= robotHandChildrenLength) {
        changeRobotHandsCounter = 0;
        clearRafInterval(spinRobotHandsTimer);
        setRobotHandsToDefault();
        if (pageVerticalPosition + .5 * containerDiv.offsetWidth < experience1ContainerDiv.offsetLeft ||
            pageVerticalPosition + .5 * containerDiv.offsetWidth > experience1ContainerDiv.offsetLeft + experience1ContainerDiv.offsetWidth)
            clearInterval(animateRobotHandsTimer)
    } else {
        for (let i = 0; i < robotHandChildrenLength; i++) {
            if (i === changeRobotHandsCounter) setRobotHandsToOpaque(i);
            else setRobotHandsToTransparent(i)
        }
    }
    changeRobotHandsCounter += 1
}

function setRobotHandsToDefault() {
    for (let i = 0; i < robotHandChildrenLength; i++) {
        if (i === 0) setRobotHandsToOpaque(i);
        else setRobotHandsToTransparent(i)
    }
}

function setElementOpacity(element, opacity) {
    if (element) {
        element.style.opacity = opacity;
    }
}

function setRobotHandsToOpaque(index) {
    setElementOpacity(robotHandLeftDiv.children[index], 1);
    setElementOpacity(robotHandRightDiv.children[index], 1);
}

function setRobotHandsToTransparent(index) {
    setElementOpacity(robotHandLeftDiv.children[index], 0);
    setElementOpacity(robotHandRightDiv.children[index], 0);
}

// ─── Experience: squid ───────────────────────────────────────────────────────
function animateSquid() {
    $(squidDiv).stop().animate({
        left: "430px"
    }, 1000, () => {
        animatePiechartIncognitoFront();
        animateSquidHands()
    })
}

function animateSquidHands() {
    moveSquidHands();
    clearInterval(animateSquidHandsTimer);
    animateSquidHandsTimer = setInterval(() => {
        moveSquidHands()
    }, 4000)
}

function moveSquidHands() {
    clearRafInterval(moveSquidHandsTimer);
    moveSquidHandsTimer = setRafInterval(() => {
        openAndCloseSquidHands()
    }, 200)
}

function openAndCloseSquidHands() {
    if (openAndCloseSquidHandsCounter >= 8) {
        openAndCloseSquidHandsCounter = 0;
        clearRafInterval(moveSquidHandsTimer);
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
    for (let i = 0; i < squidHandOpenArray.length; i++) {
        setElementOpacity(squidHandOpenArray[i], 1);
    }
    for (let i = 0; i < squidHandCloseArray.length; i++) {
        setElementOpacity(squidHandCloseArray[i], 0);
    }
}

function closeSquidHands() {
    for (let i = 0; i < squidHandOpenArray.length; i++) {
        setElementOpacity(squidHandOpenArray[i], 0);
    }
    for (let i = 0; i < squidHandCloseArray.length; i++) {
        setElementOpacity(squidHandCloseArray[i], 1);
    }
}

// ─── Experience: alien ───────────────────────────────────────────────────────
function animateAlienHand() {
    clearRafInterval(animateAlienHandsTimer);
    animateAlienHandsTimer = setRafInterval(() => {
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
        clearRafInterval(animateAlienHandsTimer);
        alienSteerDiv.style.transform = "rotate(0deg)";
    } else {
        alienSteerDiv.style.transform = "rotate(" + alienSteerAngle + "deg)";
    }
}

function animateAlien() {
    $(alienDiv).stop().animate({
        left: "450px"
    }, 1000, () => {
        animatePiechartFoxnewsFront();
        animateAlienHand()
    })
}

// ─── Piecharts ───────────────────────────────────────────────────────────────
function animatePiechartFront(frontDiv, callback) {
    $(frontDiv).stop().animate({ opacity: 1 }, 500, () => {
        callback();
    });
}

function animatePiechartAolFront() { animatePiechartFront(piechartRobotFrontDiv, animatePiechartAolText); }
function animatePiechartIncognitoFront() { animatePiechartFront(piechartSquidFrontDiv, animatePiechartIncognitoText); }
function animatePiechartFoxnewsFront() { animatePiechartFront(piechartAlienFrontDiv, animatePiechartFoxnewsText); }

function animatePiechartTextPair(div1, div2, delayOffset) {
    $(div1).stop().delay(delayOffset).animate({ opacity: 1 }, 1000, () => { });
    $(div2).stop().delay(delayOffset).animate({ opacity: 1 }, 1000, () => { });
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
    starsAndAlienTimer = setInterval(() => {
        switchStarsColor();
        switchAlienEyes();
    }, 1000)
}

function switchElementOpacity(element) {
    $(element).fadeTo(0, 0);
    $(element).stop().delay(500).animate({ opacity: 1 }, 0, () => { });
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
        scrollOrSwipeTextContainerTimer = setInterval(() => { turnOnAndOffScrollOrSwipeTextContainer() }, 1000)
    }
}

function toggleScrollSwipeText(container) {
    $(container).fadeTo(0, 1);
    $(container).stop().delay(500).animate({ opacity: 0 }, 0, () => { });
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
