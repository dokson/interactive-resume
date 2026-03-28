// ─── DOM collection ──────────────────────────────────────────────────────────
function storeDivs() {
    var allDivs = document.getElementsByTagName("div");
    for (var i = 0; i < allDivs.length; i++) {
        var cls = allDivs[i].getAttribute("class");
        if (cls === "fish") fishArray.push(allDivs[i]);
        if (cls === "fish-eyes") fishEyeArray.push(allDivs[i]);
        if (cls === "crab") crabArray.push(allDivs[i]);
        if (cls === "crab-eyes") crabEyeArray.push(allDivs[i]);
        if (cls === "turtle") turtleArray.push(allDivs[i]);
        if (cls === "turtle-eyes") turtleEyeArray.push(allDivs[i]);
        if (cls === "elevation") elevationArray.push(allDivs[i]);
        if (cls === "plant") plantArray.push(allDivs[i]);
        if (cls === "building") buildingArray.push(allDivs[i]);
        if (cls === "building2") building2Array.push(allDivs[i]);
        if (cls === "contact-confirmation-container") contactConfirmationContainerArray.push(allDivs[i]);
        if (cls === "experience-text-container") experienceTextContainerArray.push(allDivs[i]);
        if (cls === "chain-block-and-string-container") chainBlockAndStringContainerArray.push(allDivs[i]);
        if (cls === "layer-horizontal") layerHorizontalArray.push(allDivs[i]);
        if (cls === "layer-vertical") layerVerticalArray.push(allDivs[i]);
        if (cls === "algae-a" || cls === "algae-b" || cls === "title-skills-class") seaFloorFrontObjectArray.push(allDivs[i]);
        if (cls === "coral" || cls === "coral-big") seaFloorBackObjectArray.push(allDivs[i]);
        if (cls === "squid-hand-close") squidHandCloseArray.push(allDivs[i]);
        if (cls === "squid-hand-open") squidHandOpenArray.push(allDivs[i]);
        if (cls === "firework") fireworkArray.push(allDivs[i])
    }
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
    canDrawManyFireworks = canAnimateLinksContainer = canAnimateAlienInformation = canAnimateSquidInformation = canAnimateRobotInformation = true
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
    positionLinksContainer();
    positionExperienceTextContainer();
    positionChainBlockAndStringContainer();
    resetFireworkSvg()
}
