// ─── DOM collection ──────────────────────────────────────────────────────────
function collectElements(selector, targetArray) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) targetArray.push(el);
}

function storeDivs() {
    collectElements(".fish", fishArray);
    collectElements(".fish-eyes", fishEyeArray);
    collectElements(".crab", crabArray);
    collectElements(".crab-eyes", crabEyeArray);
    collectElements(".turtle", turtleArray);
    collectElements(".turtle-eyes", turtleEyeArray);
    collectElements(".elevation", elevationArray);
    collectElements(".plant", plantArray);
    collectElements(".building", buildingArray);
    collectElements(".building2", building2Array);
    collectElements(".contact-confirmation-container", contactConfirmationContainerArray);
    collectElements(".experience-text-container", experienceTextContainerArray);
    collectElements(".chain-block-and-string-container", chainBlockAndStringContainerArray);
    collectElements(".layer-horizontal", layerHorizontalArray);
    collectElements(".layer-vertical", layerVerticalArray);
    collectElements(".algae-a, .algae-b, .title-skills-class", seaFloorFrontObjectArray);
    collectElements(".coral, .coral-big", seaFloorBackObjectArray);
    collectElements(".squid-hand-close", squidHandCloseArray);
    collectElements(".squid-hand-open", squidHandOpenArray);
    collectElements(".firework", fireworkArray);
}

// ─── Initialisation & reset ──────────────────────────────────────────────────
function initVariablesAfterShowContainer() {
    fireworkCenterX = .5 * fireworkArray[0].offsetWidth;
    fireworkCenterY = .5 * fireworkArray[0].offsetHeight;
    fireworkOneRadiusDistance = (fireworkCenterY - fireworkDotRadius) / fireworkRowNumber;
    fireworkOneRotationAngle = 2 * Math.PI / fireworkColumnNumber
}

function resetVariables() {
    pageVerticalPosition = 0;
    canAnimatePlantInformation = true;
    canAnimateBuildingInformation = true;
    canAnimateBuilding2Information = true;
    canAnimateRobotInformation = true;
    canAnimateSquidInformation = true;
    canAnimateAlienInformation = true;
    canAnimateLinksContainer = true;
    canDrawManyFireworks = true;
    if (!isFishStillAnimating) canAnimateFishInformation = true;
    if (!isCrabStillAnimating) canAnimateCrabInformation = true;
    if (!isTurtleStillAnimating) canAnimateTurtleInformation = true;
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
