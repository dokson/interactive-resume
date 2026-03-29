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
    for (let i = 0; i < plantArray.length; i++) plantArray[i].style.top = flags.canAnimatePlant ? "100%" : `${plantTargetTopObjectArray[i].offsetTop}px`
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
        elements[i].style.left = `${positions[i]}px`;
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
            animals[animalIndex].style.left = `${seaAnimalSwimDistance + col * colSpacing}px`;
            animals[animalIndex].style.top = `${row * rowSpacing}px`;
            animalIndex += 1
        }
}

function animateSeaAnimals(animalArray) {
    if (animalArray === fishArray) isFishStillAnimating = true;
    if (animalArray === crabArray) isCrabStillAnimating = true;
    if (animalArray === turtleArray) isTurtleStillAnimating = true;
    for (let i = 0; i < animalArray.length; i++) $(animalArray[i]).stop().delay(100 * i).animate({
        left: [animalArray[i].offsetLeft - seaAnimalSwimDistance, "easeOutCubic"]
    }, 600, () => {
        disableIsSeaAnimalStillAnimating(animalArray)
    })
}

function disableIsSeaAnimalStillAnimating(animalArray) {
    if (animalArray === fishArray) {
        if (fishAnimateNumber >= animalArray.length - 1) { isFishStillAnimating = false; fishAnimateNumber = 0 }
        else fishAnimateNumber += 1
    }
    if (animalArray === crabArray) {
        if (crabAnimateNumber >= animalArray.length - 1) { isCrabStillAnimating = false; crabAnimateNumber = 0 }
        else crabAnimateNumber += 1
    }
    if (animalArray === turtleArray) {
        if (turtleAnimateNumber >= animalArray.length - 1) { isTurtleStillAnimating = false; turtleAnimateNumber = 0 }
        else turtleAnimateNumber += 1
    }
}

// ─── Sea: bubble ─────────────────────────────────────────────────────────────
function createBubble() {
    clearInterval(timers.bubble);
    timers.bubble = setInterval(() => { animateBubble() }, 3000)
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
    bubbleDiv.style.left = `${scrollState.position + .5 * containerDiv.offsetWidth - sea1Div.offsetLeft}px`;
    bubbleDiv.style.top = `${topOffset}px`
}

// ─── Sea animals: blink ──────────────────────────────────────────────────────
function blinkSeaAnimals(eyeArray) {
    const selectedEyes = [];
    const blinkCount = Math.ceil(5 * Math.random());
    for (let i = 0; i < blinkCount; i++) {
        const randomIndex = Math.floor(Math.random() * eyeArray.length);
        selectedEyes.push(eyeArray[randomIndex])
    }
    for (const eye of selectedEyes) {
        $(eye).fadeTo(0, 1);
        $(eye).stop().delay(300).animate({ opacity: 0 }, 0, () => { })
    }
}

function makeSeaAnimalsBlinking(eyeArray) {
    clearInterval(timers.blinkSeaAnimals);
    timers.blinkSeaAnimals = setInterval(() => { blinkSeaAnimals(eyeArray) }, 3000)
}

// ─── Sea floor ───────────────────────────────────────────────────────────────
function positionSeaFloorObjectsVertically() {
    for (const obj of seaFloorFrontObjectArray)
        obj.offsetHeight > sea1Div.offsetHeight ? obj.style.bottom = `${-1 * (obj.offsetHeight - sea1Div.offsetHeight)}px` : obj.style.bottom = "0px";
    for (const obj of seaFloorBackObjectArray)
        obj.offsetHeight > sea1Div.offsetHeight ? obj.style.bottom = `${-.7 * containerDiv.offsetHeight - (obj.offsetHeight - sea1Div.offsetHeight)}px` : obj.style.bottom = "-70%"
}

// ─── Experience: containers & text ───────────────────────────────────────────
function positionChainBlockAndStringContainer() {
    for (let i = 0; i < chainBlockAndStringContainerArray.length; i++) {
        if (i === 0) flags.canAnimateBoss = flags.canAnimateRobot;
        if (i === 1) flags.canAnimateBoss = flags.canAnimateSquid;
        if (i === 2) flags.canAnimateBoss = flags.canAnimateAlien;
        chainBlockAndStringContainerArray[i].style.left = `${.5 * experienceTextContainerArray[i].offsetWidth - .5 * chainBlockAndStringContainerArray[i].offsetWidth}px`;
        chainBlockAndStringContainerArray[i].style.bottom = flags.canAnimateBoss ?
            `${.8 * containerDiv.offsetHeight + experienceTextContainerArray[i].offsetHeight}px` :
            `${experienceTextContainerDistanceFromFloor + experienceTextContainerArray[i].offsetHeight}px`
    }
}

function animateChainBlockAndStringContainer(index) {
    $(chainBlockAndStringContainerArray[index]).stop().animate({
        bottom: [experienceTextContainerDistanceFromFloor + experienceTextContainerArray[index].offsetHeight, "easeOutCubic"]
    }, 1000, () => { })
}

function positionExperienceTextContainer() {
    for (let i = 0; i < experienceTextContainerArray.length; i++) {
        if (i === 0) flags.canAnimateBoss = flags.canAnimateRobot;
        if (i === 1) flags.canAnimateBoss = flags.canAnimateSquid;
        if (i === 2) flags.canAnimateBoss = flags.canAnimateAlien;
        experienceTextContainerArray[i].style.bottom = flags.canAnimateBoss ?
            `${.8 * containerDiv.offsetHeight}px` :
            `${experienceTextContainerDistanceFromFloor}px`
    }
}

function animateExperienceTextContainer(index) {
    $(experienceTextContainerArray[index]).stop().animate({
        bottom: [experienceTextContainerDistanceFromFloor, "easeOutCubic"]
    }, 1000, () => { })
}

function hidePiechartElements(frontDiv, textDivs) {
    for (const div of textDivs) {
        $(div).fadeTo(0, 0);
    }
    $(frontDiv).fadeTo(0, 0);
}

function hidePiechartByPrefix(piechart) {
    hidePiechartElements(piechart.front, [
        piechart.graphic1, piechart.graphic2,
        piechart.animation1, piechart.animation2,
        piechart.code1, piechart.code2
    ]);
}

function positionExperience1Elements() {
    robotDiv.style.left = `${experience1ContainerDiv.offsetWidth}px`;
    hidePiechartByPrefix(piechartRobot);
}

function positionExperience2Elements() {
    squidDiv.style.left = `${experience2ContainerDiv.offsetWidth}px`;
    hidePiechartByPrefix(piechartSquid);
}

function positionExperience3Elements() {
    alienDiv.style.left = `${experience3ContainerDiv.offsetWidth}px`;
    hidePiechartByPrefix(piechartAlien);
}

// ─── Experience: animation dispatch ──────────────────────────────────────────
function animateInformationAndEnemiesElements() {
    if (scrollState.layersMovement !== "horizontal")
        return;

    if (!ale.isSwimming) {
        for (let i = 0; i < landInformationContainerArray.length; i++) {
            const container = landInformationContainerArray[i];
            const containerLeft = container.offsetLeft;
            const containerRight = containerLeft + container.offsetWidth;
            const viewportCenter = scrollState.position + (containerDiv.offsetWidth * 0.5);
            const previousViewportCenter = scrollState.previousPosition + (containerDiv.offsetWidth * 0.5);
            const wasOutsideViewport = (previousViewportCenter < containerLeft || previousViewportCenter > containerRight);
            const isNowInsideViewport = (viewportCenter > containerLeft && viewportCenter < containerRight);

            if (wasOutsideViewport && isNowInsideViewport) {
                if (container === about1ContainerDiv && flags.canAnimatePlant) {
                    animatePlants();
                    flags.canAnimatePlant = false;
                }
                if (container === about2ContainerDiv && flags.canAnimateBuilding) {
                    animateBuildings();
                    flags.canAnimateBuilding = false;
                }
                if (container === about3ContainerDiv && flags.canAnimateBuilding2) {
                    animateBuildings2();
                    flags.canAnimateBuilding2 = false;
                }
                if (container === experience1ContainerDiv) {
                    if (!flags.canAnimateRobot) {
                        animateRobotHands();
                    } else {
                        animateRobot();
                        animateExperienceTextContainer(0);
                        animateChainBlockAndStringContainer(0);
                        flags.canAnimateRobot = false;
                    }
                }
                if (container === experience2ContainerDiv) {
                    if (!flags.canAnimateSquid) {
                        animateSquidHands();
                    } else {
                        animateSquid();
                        animateExperienceTextContainer(1);
                        animateChainBlockAndStringContainer(1);
                        flags.canAnimateSquid = false;
                    }
                }
                if (container === experience3ContainerDiv) {
                    if (!flags.canAnimateAlien) {
                        animateAlienHand();
                    } else {
                        animateAlien();
                        animateExperienceTextContainer(2);
                        animateChainBlockAndStringContainer(2);
                        flags.canAnimateAlien = false;
                    }
                }
            }
        }
    }
    if (ale.isSwimming) {
        for (let i = 0; i < seaInformationContainerArray.length; i++) {
            const container = seaInformationContainerArray[i];
            const containerLeft = sea1Div.offsetLeft + container.offsetLeft;
            const containerRight = containerLeft + container.offsetWidth;
            const viewportCenter = scrollState.position + (containerDiv.offsetWidth * 0.5);
            const previousViewportCenter = scrollState.previousPosition + (containerDiv.offsetWidth * 0.5);
            const wasOutsideViewport = (previousViewportCenter < containerLeft || previousViewportCenter > containerRight);
            const isNowInsideViewport = (viewportCenter > containerLeft && viewportCenter < containerRight);

            if (wasOutsideViewport && isNowInsideViewport) {
                if (container === skill1ContainerDiv) {
                    makeSeaAnimalsBlinking(fishEyeArray);
                    if (flags.canAnimateFish) {
                        animateSeaAnimals(fishArray);
                        flags.canAnimateFish = false;
                    }
                }
                if (container === skill2ContainerDiv) {
                    makeSeaAnimalsBlinking(crabEyeArray);
                    if (flags.canAnimateCrab) {
                        animateSeaAnimals(crabArray);
                        flags.canAnimateCrab = false;
                    }
                }
                if (container === skill3ContainerDiv) {
                    makeSeaAnimalsBlinking(turtleEyeArray);
                    if (flags.canAnimateTurtle) {
                        animateSeaAnimals(turtleArray);
                        flags.canAnimateTurtle = false;
                    }
                }
            }
        }
    }
}

// ─── Experience: robot ───────────────────────────────────────────────────────
function animateRobot() {
    $(robotDiv).stop().animate({
        left: "420px" // sprite landing position inside experience-1 container
    }, 1000, () => {
        animatePiechartAolFront();
        animateRobotHands()
    })
}

function animateRobotHands() {
    spinRobotHands();
    clearInterval(timers.animateRobotHands);
    timers.animateRobotHands = setInterval(() => {
        spinRobotHands()
    }, 4000)
}

function spinRobotHands() {
    clearRafInterval(timers.spinRobotHands);
    timers.spinRobotHands = setRafInterval(() => {
        changeRobotHands()
    }, 100)
}

function changeRobotHands() {
    if (changeRobotHandsCounter >= robotHandChildrenLength) {
        changeRobotHandsCounter = 0;
        clearRafInterval(timers.spinRobotHands);
        setRobotHandsToDefault();
        if (scrollState.position + .5 * containerDiv.offsetWidth < experience1ContainerDiv.offsetLeft ||
            scrollState.position + .5 * containerDiv.offsetWidth > experience1ContainerDiv.offsetLeft + experience1ContainerDiv.offsetWidth)
            clearInterval(timers.animateRobotHands)
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
        left: "430px" // sprite landing position inside experience-2 container
    }, 1000, () => {
        animatePiechartIncognitoFront();
        animateSquidHands()
    })
}

function animateSquidHands() {
    moveSquidHands();
    clearInterval(timers.animateSquidHands);
    timers.animateSquidHands = setInterval(() => {
        moveSquidHands()
    }, 4000)
}

function moveSquidHands() {
    clearRafInterval(timers.moveSquidHands);
    timers.moveSquidHands = setRafInterval(() => {
        openAndCloseSquidHands()
    }, 200)
}

function openAndCloseSquidHands() {
    if (openAndCloseSquidHandsCounter >= 8) {
        openAndCloseSquidHandsCounter = 0;
        clearRafInterval(timers.moveSquidHands);
        openSquidHands();
        if (scrollState.position + .5 * containerDiv.offsetWidth < experience2ContainerDiv.offsetLeft ||
            scrollState.position + .5 * containerDiv.offsetWidth > experience2ContainerDiv.offsetLeft + experience2ContainerDiv.offsetWidth)
            clearInterval(timers.animateSquidHands)
    } else if (openAndCloseSquidHandsCounter % 2 === 0) {
        openSquidHands()
    } else {
        closeSquidHands()
    }
    openAndCloseSquidHandsCounter += 1
}

function openSquidHands() {
    for (const hand of squidHandOpenArray) setElementOpacity(hand, 1);
    for (const hand of squidHandCloseArray) setElementOpacity(hand, 0);
}

function closeSquidHands() {
    for (const hand of squidHandOpenArray) setElementOpacity(hand, 0);
    for (const hand of squidHandCloseArray) setElementOpacity(hand, 1);
}

// ─── Experience: alien ───────────────────────────────────────────────────────
function animateAlienHand() {
    clearRafInterval(timers.animateAlienHands);
    timers.animateAlienHands = setRafInterval(() => {
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
        scrollState.position + .5 * containerDiv.offsetWidth < experience3ContainerDiv.offsetLeft ||
        scrollState.position + .5 * containerDiv.offsetWidth > experience3ContainerDiv.offsetLeft + experience3ContainerDiv.offsetWidth;
    if (alienSteerAngle === 0 && isOutsideViewport) {
        clearRafInterval(timers.animateAlienHands);
        alienSteerDiv.style.transform = "rotate(0deg)";
    } else {
        alienSteerDiv.style.transform = `rotate(${alienSteerAngle}deg)`;
    }
}

function animateAlien() {
    $(alienDiv).stop().animate({
        left: "450px" // sprite landing position inside experience-3 container
    }, 300, () => {
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

function animatePiechartTextPair(div1, div2, delayOffset) {
    $(div1).stop().delay(delayOffset).animate({ opacity: 1 }, 1000, () => { });
    $(div2).stop().delay(delayOffset).animate({ opacity: 1 }, 1000, () => { });
}

function animatePiechartText(piechart, order) {
    for (let i = 0; i < order.length; i++) {
        animatePiechartTextPair(piechart[order[i] + "1"], piechart[order[i] + "2"], 300 * i);
    }
}

function animatePiechartAolFront() {
    animatePiechartFront(piechartRobot.front, () => {
        animatePiechartText(piechartRobot, ["code", "graphic", "animation"]);
    });
}

function animatePiechartIncognitoFront() {
    animatePiechartFront(piechartSquid.front, () => {
        animatePiechartText(piechartSquid, ["code", "animation", "graphic"]);
    });
}

function animatePiechartFoxnewsFront() {
    animatePiechartFront(piechartAlien.front, () => {
        animatePiechartText(piechartAlien, ["code", "animation", "graphic"]);
    });
}

// ─── Stars & alien eyes ──────────────────────────────────────────────────────
function animateStars() {
    clearRafInterval(timers.stars);
    timers.stars = setRafInterval(() => {
        switchStarsColor();
    }, 400);
}

function animateAlienEyes() {
    clearRafInterval(timers.alienEyes);
    timers.alienEyes = setRafInterval(() => {
        switchAlienEyes();
    }, 700);
}

var starsVisible = true;
function switchStarsColor() {
    starsVisible = !starsVisible;
    $(stars).fadeTo(0, starsVisible ? 1 : 0);
}

function switchAlienEyes() {
    $(alienEyes).fadeTo(0, 1);
    $(alienEyes).stop().delay(230).animate({ opacity: 0 }, 0, () => { });
}

// ─── Scroll / swipe hint text ────────────────────────────────────────────────
function animateScrollOrSwipeTextContainer() {
    if (flags.canAnimateScrollText) {
        flags.canAnimateScrollText = false;
        clearInterval(timers.scrollText);
        timers.scrollText = setInterval(() => { turnOnAndOffScrollOrSwipeTextContainer() }, 1000)
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
    if (flags.canHideScrollText) {
        clearInterval(timers.scrollText);
        fadeOutScrollOrSwipeTextContainer();
        flags.canHideScrollText = false
    }
}

function fadeOutScrollOrSwipeTextContainer() {
    $(scrollOrSwipeTextContainer1Div).fadeTo(0, 0);
    $(scrollOrSwipeTextContainer2Div).fadeTo(0, 0)
}
