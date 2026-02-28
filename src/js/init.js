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
