// ─── rAF-based interval (syncs with display refresh, pauses in background) ──
var rafIntervals = {};
var rafIntervalNextId = 0;

function setRafInterval(callback, interval) {
    const id = ++rafIntervalNextId;
    let lastTime = performance.now();
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

// ─── Flash: show an overlay now, hide it after `visibleDuration` ─────────────
// Opacity is set synchronously: a 0 ms jQuery fadeTo only applies on the next fx tick,
// so a following .stop() used to cancel it and most blinks were lost.
function flashElement(element, visibleDuration) {
    $(element).stop(true).css("opacity", 1).delay(visibleDuration).animate({ opacity: 0 }, 0);
}

// ─── Viewport helpers ────────────────────────────────────────────────────────
function viewportCenter(position) {
    return position + .5 * containerDiv.offsetWidth;
}

function isViewportCenterOutside(container) {
    const center = viewportCenter(scrollState.position);
    return center < container.offsetLeft || center > container.offsetLeft + container.offsetWidth;
}

// ─── About: plants ───────────────────────────────────────────────────────────
function animatePlants() {
    const { stagger, duration } = gameConfig.plants;
    for (let i = 0; i < plantArray.length; i++) $(plantArray[i]).stop().delay(stagger * i).animate({
        top: [plantTargetTopObjectArray[i].offsetTop, "easeOutElastic"]
    }, duration)
}

function positionPlants() {
    for (let i = 0; i < plantArray.length; i++) plantArray[i].style.top = flags.canAnimatePlant ? "100%" : `${plantTargetTopObjectArray[i].offsetTop}px`
}

// ─── About: buildings ────────────────────────────────────────────────────────
function animateElementsLeft(elements, targets) {
    const { stagger, duration } = gameConfig.buildings;
    for (let i = 0; i < elements.length; i++) {
        $(elements[i]).stop().delay(stagger * i).animate({
            left: [targets[i], "easeOutCubic"]
        }, duration);
    }
}

function animateBuildings() {
    animateElementsLeft(buildingArray, gameConfig.buildings.first.targetLeft);
}

function animateBuildings2() {
    animateElementsLeft(building2Array, gameConfig.buildings.second.targetLeft);
}

function positionElementsLeft(elements, positions) {
    for (let i = 0; i < elements.length; i++) {
        elements[i].style.left = `${positions[i]}px`;
    }
}

function positionBuildings() {
    positionElementsLeft(buildingArray, gameConfig.buildings.first.startLeft);
}

function positionBuildings2() {
    positionElementsLeft(building2Array, gameConfig.buildings.second.startLeft);
}

// ─── Sea animals ─────────────────────────────────────────────────────────────
function positionSeaAnimals(species) {
    const { swimInDistance, columnSpacing, rowSpacing, rows } = gameConfig.seaAnimals;
    const animalsPerRow = rows[species.name];
    for (let animalIndex = 0, row = 0; row < animalsPerRow.length; row++)
        for (let col = 0; col < animalsPerRow[row]; col++) {
            species.animals[animalIndex].style.left = `${swimInDistance + col * columnSpacing}px`;
            species.animals[animalIndex].style.top = `${row * rowSpacing}px`;
            animalIndex += 1
        }
}

function animateSeaAnimals(species) {
    const { swimInDistance, stagger, duration } = gameConfig.seaAnimals;
    species.isAnimating = true;
    for (let i = 0; i < species.animals.length; i++) $(species.animals[i]).stop().delay(stagger * i).animate({
        left: [species.animals[i].offsetLeft - swimInDistance, "easeOutCubic"]
    }, duration, () => {
        markSeaAnimalArrived(species)
    })
}

function markSeaAnimalArrived(species) {
    if (species.arrivedCount >= species.animals.length - 1) {
        species.isAnimating = false;
        species.arrivedCount = 0
    } else {
        species.arrivedCount += 1
    }
}

// ─── Sea: bubble ─────────────────────────────────────────────────────────────
function createBubble() {
    clearInterval(timers.bubble);
    timers.bubble = setInterval(() => { animateBubble() }, gameConfig.sea.bubbleInterval)
}

function animateBubble() {
    const topOffset = aleContainerDiv.offsetTop - (sea1Div.offsetTop - shiftUpLayerHorizontalDistance);
    positionBubble(topOffset);
    showBubble();
    $(bubbleDiv).stop().animate({ top: "0px" }, gameConfig.sea.bubbleMsPerPx * topOffset, () => { hideBubble() })
}

function hideBubble() {
    $(bubbleDiv).fadeTo(0, 0)
}

function showBubble() {
    $(bubbleDiv).fadeTo(0, 1)
}

function positionBubble(topOffset) {
    bubbleDiv.style.left = `${viewportCenter(scrollState.position) - sea1Div.offsetLeft}px`;
    bubbleDiv.style.top = `${topOffset}px`
}

// ─── Sea animals: blink ──────────────────────────────────────────────────────
function blinkSeaAnimals(eyeArray) {
    const { blinkMaxEyes, blinkDuration } = gameConfig.seaAnimals;
    const selectedEyes = [];
    const blinkCount = Math.ceil(blinkMaxEyes * Math.random());
    for (let i = 0; i < blinkCount; i++) {
        const randomIndex = Math.floor(Math.random() * eyeArray.length);
        selectedEyes.push(eyeArray[randomIndex])
    }
    for (const eye of selectedEyes) {
        flashElement(eye, blinkDuration)
    }
}

function makeSeaAnimalsBlinking(eyeArray) {
    clearInterval(timers.blinkSeaAnimals);
    timers.blinkSeaAnimals = setInterval(() => { blinkSeaAnimals(eyeArray) }, gameConfig.seaAnimals.blinkInterval)
}

// ─── Sea floor ───────────────────────────────────────────────────────────────
function positionSeaFloorObjectsVertically() {
    const backRatio = gameConfig.sea.backObjectsBottomRatio;
    for (const obj of seaFloorFrontObjectArray)
        obj.style.bottom = obj.offsetHeight > sea1Div.offsetHeight ? `${-1 * (obj.offsetHeight - sea1Div.offsetHeight)}px` : "0px";
    for (const obj of seaFloorBackObjectArray)
        obj.style.bottom = obj.offsetHeight > sea1Div.offsetHeight ? `${backRatio * containerDiv.offsetHeight - (obj.offsetHeight - sea1Div.offsetHeight)}px` : `${backRatio * 100}%`
}

// ─── Experience: text containers & chains ────────────────────────────────────
function positionBossChain(boss) {
    const { textDistanceFromFloor, dropStartRatio } = gameConfig.experience;
    const chain = chainBlockAndStringContainerArray[boss.index];
    const text = experienceTextContainerArray[boss.index];
    chain.style.left = `${.5 * text.offsetWidth - .5 * chain.offsetWidth}px`;
    chain.style.bottom = boss.canAnimate ?
        `${dropStartRatio * containerDiv.offsetHeight + text.offsetHeight}px` :
        `${textDistanceFromFloor + text.offsetHeight}px`
}

function animateChainBlockAndStringContainer(index) {
    const { textDistanceFromFloor, dropDuration } = gameConfig.experience;
    $(chainBlockAndStringContainerArray[index]).stop().animate({
        bottom: [textDistanceFromFloor + experienceTextContainerArray[index].offsetHeight, "easeOutCubic"]
    }, dropDuration)
}

function positionBossText(boss) {
    const { textDistanceFromFloor, dropStartRatio } = gameConfig.experience;
    experienceTextContainerArray[boss.index].style.bottom = boss.canAnimate ?
        `${dropStartRatio * containerDiv.offsetHeight}px` :
        `${textDistanceFromFloor}px`
}

function animateExperienceTextContainer(index) {
    const { textDistanceFromFloor, dropDuration } = gameConfig.experience;
    $(experienceTextContainerArray[index]).stop().animate({
        bottom: [textDistanceFromFloor, "easeOutCubic"]
    }, dropDuration)
}

// ─── Experience: bosses ──────────────────────────────────────────────────────
function hidePiechart(piechart) {
    for (const part of ["front", "graphic1", "graphic2", "animation1", "animation2", "code1", "code2"]) {
        $(piechart[part]).fadeTo(0, 0);
    }
}

function positionBoss(boss) {
    boss.div.style.left = `${boss.containerDiv.offsetWidth}px`;
    hidePiechart(boss.piechart);
}

function enterBoss(boss) {
    const bossConfig = gameConfig.bosses[boss.name];
    $(boss.div).stop().animate({
        left: `${bossConfig.landingLeft}px`
    }, bossConfig.enterDuration, () => {
        animatePiechartFront(boss.piechart.front, () => {
            animatePiechartText(boss.piechart, bossConfig.piechartOrder);
        });
        boss.startIdle()
    })
}

// ─── Experience: robot ───────────────────────────────────────────────────────
function animateRobotHands() {
    spinRobotHands();
    clearInterval(timers.animateRobotHands);
    timers.animateRobotHands = setInterval(() => {
        spinRobotHands()
    }, gameConfig.bosses.robot.handsCycleInterval)
}

function spinRobotHands() {
    clearRafInterval(timers.spinRobotHands);
    timers.spinRobotHands = setRafInterval(() => {
        changeRobotHands()
    }, gameConfig.bosses.robot.handsFrameInterval)
}

function changeRobotHands() {
    if (changeRobotHandsCounter >= robotHandChildrenLength) {
        changeRobotHandsCounter = 0;
        clearRafInterval(timers.spinRobotHands);
        setRobotHandsToDefault();
        if (isViewportCenterOutside(experience1ContainerDiv))
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
function animateSquidHands() {
    moveSquidHands();
    clearInterval(timers.animateSquidHands);
    timers.animateSquidHands = setInterval(() => {
        moveSquidHands()
    }, gameConfig.bosses.squid.handsCycleInterval)
}

function moveSquidHands() {
    clearRafInterval(timers.moveSquidHands);
    timers.moveSquidHands = setRafInterval(() => {
        openAndCloseSquidHands()
    }, gameConfig.bosses.squid.handsFrameInterval)
}

function openAndCloseSquidHands() {
    if (openAndCloseSquidHandsCounter >= gameConfig.bosses.squid.handsToggles) {
        openAndCloseSquidHandsCounter = 0;
        clearRafInterval(timers.moveSquidHands);
        openSquidHands();
        if (isViewportCenterOutside(experience2ContainerDiv))
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
    }, gameConfig.bosses.alien.steerFrameInterval)
}

function rotateAlienHands() {
    alienSteerPreviousAngle = alienSteerAngle;
    alienSteerAngle += alienSteerAngleIncrement;
    if (alienSteerPreviousAngle < alienSteerAngle) {
        if (alienSteerAngle > alienSteerAngleLimit) { alienSteerAngleIncrement *= -1; alienSteerAngleLimit *= -1 }
    } else {
        if (alienSteerAngle < alienSteerAngleLimit) { alienSteerAngleIncrement *= -1; alienSteerAngleLimit *= -1 }
    }
    if (alienSteerAngle === 0 && isViewportCenterOutside(experience3ContainerDiv)) {
        clearRafInterval(timers.animateAlienHands);
        alienSteerDiv.style.transform = "rotate(0deg)";
    } else {
        alienSteerDiv.style.transform = `rotate(${alienSteerAngle}deg)`;
    }
}

// ─── Piecharts ───────────────────────────────────────────────────────────────
function animatePiechartFront(frontDiv, callback) {
    $(frontDiv).stop().animate({ opacity: 1 }, gameConfig.experience.piechartFadeDuration, () => {
        callback();
    });
}

function animatePiechartTextPair(div1, div2, delayOffset) {
    const duration = gameConfig.experience.piechartTextDuration;
    $(div1).stop().delay(delayOffset).animate({ opacity: 1 }, duration);
    $(div2).stop().delay(delayOffset).animate({ opacity: 1 }, duration);
}

function animatePiechartText(piechart, order) {
    for (let i = 0; i < order.length; i++) {
        animatePiechartTextPair(piechart[`${order[i]}1`], piechart[`${order[i]}2`], gameConfig.experience.piechartTextStagger * i);
    }
}

// ─── Scene entry handlers (wired in state.js `scenes`) ───────────────────────
function enterPlantsSection() {
    if (flags.canAnimatePlant) {
        animatePlants();
        flags.canAnimatePlant = false;
    }
}

function enterBuildingsSection() {
    if (flags.canAnimateBuilding) {
        animateBuildings();
        flags.canAnimateBuilding = false;
    }
}

function enterBuildings2Section() {
    if (flags.canAnimateBuilding2) {
        animateBuildings2();
        flags.canAnimateBuilding2 = false;
    }
}

function enterBossSection(boss) {
    if (!boss.canAnimate) {
        boss.startIdle();
        return;
    }
    enterBoss(boss);
    animateExperienceTextContainer(boss.index);
    animateChainBlockAndStringContainer(boss.index);
    boss.canAnimate = false;
}

function enterSeaAnimalSection(species) {
    makeSeaAnimalsBlinking(species.eyes);
    if (species.canAnimate) {
        animateSeaAnimals(species);
        species.canAnimate = false;
    }
}

// ─── Scene lifecycle ─────────────────────────────────────────────────────────
function resetScenes() {
    for (const scene of scenes) scene.reset();
}

function layoutScenes() {
    for (const scene of scenes) scene.layout();
}

function resizeScenes() {
    for (const scene of scenes) scene.resize?.();
}

function triggerEnteredScenes() {
    if (scrollState.layersMovement !== LayersMovement.horizontal)
        return;
    const world = ale.isSwimming ? "sea" : "land";
    const offsetLeft = world === "sea" ? sea1Div.offsetLeft : 0;
    const center = viewportCenter(scrollState.position);
    const previousCenter = viewportCenter(scrollState.previousPosition);
    for (const scene of scenes) {
        if (scene.world !== world) continue;
        const left = offsetLeft + scene.container.offsetLeft;
        const right = left + scene.container.offsetWidth;
        const wasOutside = previousCenter < left || previousCenter > right;
        const isInside = center > left && center < right;
        if (wasOutside && isInside) scene.enter();
    }
}

// ─── Stars & alien eyes ──────────────────────────────────────────────────────
function animateStars() {
    clearRafInterval(timers.stars);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    timers.stars = setRafInterval(() => {
        switchStarsColor();
    }, gameConfig.stars.interval);
}

function animateAlienEyes() {
    clearRafInterval(timers.alienEyes);
    timers.alienEyes = setRafInterval(() => {
        switchAlienEyes();
    }, gameConfig.bosses.alien.eyesInterval);
}

function switchStarsColor() {
    const palette = gameConfig.stars.palette;
    flags.starPaletteIndex = (flags.starPaletteIndex + 1) % palette.length;
    for (const star of stars) star.style.filter = palette[flags.starPaletteIndex];
}

function switchAlienEyes() {
    flashElement(alienEyes, gameConfig.bosses.alien.eyesClosedDuration);
}

// ─── Scroll / swipe hint text ────────────────────────────────────────────────
function animateScrollOrSwipeTextContainer() {
    if (flags.canAnimateScrollText) {
        flags.canAnimateScrollText = false;
        clearInterval(timers.scrollText);
        timers.scrollText = setInterval(() => { turnOnAndOffScrollOrSwipeTextContainer() }, gameConfig.scrollHint.interval)
    }
}

function toggleScrollSwipeText(container) {
    flashElement(container, gameConfig.scrollHint.visibleDuration);
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
