// ─── Preloader / Ale character / Layer engine / Sea ──────────────────────────
var blinkAleEyesTimer;

var contentDiv = document.getElementById("content"),
    pageDiv = document.getElementById("page"),
    bannersContainerDiv = document.getElementById("banners-container"),
    splashContainerDiv = document.getElementById("splash-container"),
    isPreloadShiftUpAnimationFinish = false,
    canFinishShiftUpHorizontalLayersAfterEverythingLoaded = true;

var aleContainerDiv = document.getElementById("ale-container"),
    aleDiv = document.getElementById("ale"),
    aleFramesDiv = document.getElementById("ale-slides"),
    aleEyesCloseDiv = document.getElementById("ale-eyes-close"),
    rocketDiv = document.getElementById("rocket"),
    groundAndGrassContainer1Div = document.getElementById("ground-and-grass-container-1"),
    elevation1Div = document.getElementById("elevation-1"),
    elevation2Div = document.getElementById("elevation-2");

var layerHorizontalArray = [],
    layerVerticalArray = [],
    gapBetweenContactCloudAndBannersContainer = 400,
    layerHorizontalSpeedArray = [],
    layerVerticalSpeedArray = [];

var sea1Div = document.getElementById("sea-1"),
    seaFloorDiv = document.getElementById("sea-floor"),
    seaFloorFrontObjectArray = [],
    seaFloorBackObjectArray = [];

var about1ContainerDiv = document.getElementById("plants-container"),
    plantLine1Div = document.getElementById("plant-line-1"),
    plantLine2Div = document.getElementById("plant-line-2"),
    plantArray = [],
    plantTargetTopObjectArray = [plantLine1Div, plantLine1Div, plantLine2Div, plantLine2Div];

// ─── About: plants & buildings 1 ─────────────────────────────────────────────
var canAnimatePlantInformation;

var about2ContainerDiv = document.getElementById("buildings-container"),
    buildingTargetLeftArray = [0, 305, 710],
    buildingEarlyPositionArray = [795, 1100, 1505],
    buildingArray = [];

// ─── Experience / piecharts / sea animals & skills: fish ─────────────────────
var canAnimateBuildingInformation,
    canAnimateBuilding2Information,
    buildingBlinkTimer,
    building2BlinkTimer;

var animateRobotHandsTimer,
    spinRobotHandsTimer,
    animateSquidHandsTimer,
    moveSquidHandsTimer,
    animateAlienHandsTimer,
    alienSteerPreviousAngle,
    canAnimateBossInformation,
    canAnimateRobotInformation,
    canAnimateSquidInformation,
    canAnimateAlienInformation;

var bubbleTimer,
    shiftUpLayerHorizontalDistance,
    shiftUpLayerHorizontalTimer,
    shiftDownLayerHorizontalTimer,
    blinkSeaAnimalsTimer,
    canAnimateFishInformation;

var experience1ContainerDiv = document.getElementById("experience-1-container"),
    experience2ContainerDiv = document.getElementById("experience-2-container"),
    experience3ContainerDiv = document.getElementById("experience-3-container"),
    experienceTextContainerArray = [],
    chainBlockAndStringContainerArray = [],
    experienceTextContainerDistanceFromFloor = 185;

var robotDiv = document.getElementById("robot"),
    changeRobotHandsCounter = 0,
    robotHandLeftDiv = document.getElementById("robot-hand-left"),
    robotHandRightDiv = document.getElementById("robot-hand-right"),
    robotHandChildrenLength = $(robotHandLeftDiv).children().length;

var squidDiv = document.getElementById("squid"),
    squidHandCloseArray = [],
    squidHandOpenArray = [],
    openAndCloseSquidHandsCounter = 0;

var alienDiv = document.getElementById("alien"),
    alienSteerDiv = document.getElementById("alien-steer"),
    alienSteerAngle = 0,
    alienSteerAngleLimit = 15,
    alienSteerAngleIncrement = 5;

function getPiechartElements(prefix) {
    return {
        front: document.getElementById("piechart-" + prefix + "-front"),
        graphic1: document.getElementById("piechart-" + prefix + "-text-graphic-1"),
        graphic2: document.getElementById("piechart-" + prefix + "-text-graphic-2"),
        animation1: document.getElementById("piechart-" + prefix + "-text-animation-1"),
        animation2: document.getElementById("piechart-" + prefix + "-text-animation-2"),
        code1: document.getElementById("piechart-" + prefix + "-text-code-1"),
        code2: document.getElementById("piechart-" + prefix + "-text-code-2")
    };
}

var piechartRobot = getPiechartElements("robot"),
    piechartRobotFrontDiv = piechartRobot.front,
    piechartRobotTextGraphic1Div = piechartRobot.graphic1,
    piechartRobotTextGraphic2Div = piechartRobot.graphic2,
    piechartRobotTextAnimation1Div = piechartRobot.animation1,
    piechartRobotTextAnimation2Div = piechartRobot.animation2,
    piechartRobotTextCode1Div = piechartRobot.code1,
    piechartRobotTextCode2Div = piechartRobot.code2;

var piechartSquid = getPiechartElements("squid"),
    piechartSquidFrontDiv = piechartSquid.front,
    piechartSquidTextGraphic1Div = piechartSquid.graphic1,
    piechartSquidTextGraphic2Div = piechartSquid.graphic2,
    piechartSquidTextAnimation1Div = piechartSquid.animation1,
    piechartSquidTextAnimation2Div = piechartSquid.animation2,
    piechartSquidTextCode1Div = piechartSquid.code1,
    piechartSquidTextCode2Div = piechartSquid.code2;

var piechartAlien = getPiechartElements("alien"),
    piechartAlienFrontDiv = piechartAlien.front,
    piechartAlienTextGraphic1Div = piechartAlien.graphic1,
    piechartAlienTextGraphic2Div = piechartAlien.graphic2,
    piechartAlienTextAnimation1Div = piechartAlien.animation1,
    piechartAlienTextAnimation2Div = piechartAlien.animation2,
    piechartAlienTextCode1Div = piechartAlien.code1,
    piechartAlienTextCode2Div = piechartAlien.code2;

var bubbleDiv = document.getElementById("bubble"),
    shiftUpDownLayerHorizontalIncrement = 40,
    shiftUpDownLayerHorizontalInterval = 40,
    seaAnimalSwimDistance = 900;

var skill1ContainerDiv = document.getElementById("skill-1-container"),
    fishArray = [],
    fishEyeArray = [],
    isFishStillAnimating = false,
    fishAnimateNumber = 0,
    numberOfFishInEachRowArray = [5, 5, 3, 3];

// ─── Skills: crabs ───────────────────────────────────────────────────────────
var canAnimateCrabInformation,
    skill2ContainerDiv = document.getElementById("skill-2-container"),
    crabArray = [],
    crabEyeArray = [],
    isCrabStillAnimating = false,
    crabAnimateNumber = 0,
    numberOfCrabInEachRowArray = [4, 5, 3, 3];

// ─── Skills: turtles ─────────────────────────────────────────────────────────
var canAnimateTurtleInformation,
    skill3ContainerDiv = document.getElementById("skill-3-container"),
    turtleArray = [],
    turtleEyeArray = [],
    isTurtleStillAnimating = false,
    turtleAnimateNumber = 0,
    numberOfTurtleInEachRowArray = [5, 5, 4, 3];

// ─── Ale physics & sprite frames / buildings 2 ───────────────────────────────
var isAleJumping,
    isAleFalling,
    swimUpHeight,
    layersMovement,
    aleRightEdge,
    aleLeftEdge,
    aleMaxHorizontalDistance,
    canAnimateAleRunSwim,
    aleStartFrame,
    aleStopFrame,
    shiftAleFrameTimer,
    pageVerticalPositionWhenAnimateAle1,
    pageVerticalPositionWhenAnimateAle2,
    canAnimateSocialContainer,
    happyAleTimer,
    starsAndAlienTimer,
    scrollOrSwipeTextContainerTimer,
    drawFireworkTimer,
    fireworkCenterX,
    fireworkCenterY,
    fireworkOneRadiusDistance,
    fireworkOneRotationAngle,
    drawOneLayerOfFireworkTimer;

var pageVerticalPosition = 0,
    pageVerticalPositionOnTouch = 0,
    previousPageVerticalPosition = 0,
    deltaPageVerticalPosition = 0,
    isAleSwimming = false,
    isAleBelowSeaLevel = false,
    elevationArray = [],
    elevationNumberBelowAle = null,
    distanceBetweenAleAndRocket = 300;

var aleFrameIndex = 0,
    aleFrameDirection = 1,
    aleStaticFrame = 0,
    aleStartRunFrame = 1,
    aleStopRunFrame = 2,
    aleStartSwimFrame = 3,
    aleStopSwimFrame = 4,
    aleSwimDownFrame = 5,
    aleStartJumpFrame = 6,
    aleStopJumpFrame = 7,
    aleOneFrameWidth = 200,
    shiftAleFrameTimeInterval = 200,
    minimumVerticalDistanceToTriggerAleSwimDownFrame = 100;

var about3ContainerDiv = document.getElementById("buildings-container-2"),
    building2TargetLeftArray = [-12, 305, 550],
    building2EarlyPositionArray = [795, 1100, 1505],
    building2Array = [];

// ─── Contact / social / fireworks ────────────────────────────────────────────
var contactContainerDiv = document.getElementById("contact-container"),
    socialContainerDiv = document.getElementById("social-container"),
    isAleHappy = false,
    scrollOrSwipeTextContainer1Div = document.getElementById("scroll-or-swipe-text-container-1"),
    scrollOrSwipeTextContainer2Div = document.getElementById("scroll-or-swipe-text-container-2"),
    canHideScrollOrSwipeTextContainer = true,
    canAnimateScrollOrSwipeTextContainer = true,
    contactConfirmationContainerArray = [],
    emailAddressDiv = document.getElementById("email-address"),
    emailSubjectDiv = document.getElementById("email-subject"),
    emailMessageDiv = document.getElementById("email-message"),
    isContactConfirmationContainerVisible = true,
    stars = document.getElementsByClassName("star"),
    alienEyes = document.getElementById("alien-close-eyes"),
    touchStartX = 0,
    touchCurrentX = 0,
    touchEndX = 0;

var fireworksContainerDiv = document.getElementById("fireworks-container"),
    fireworkArray = [],
    fireworkSvgArray = [],
    drawFireworkCounter = 0,
    fireworkRowNumber = 8,
    fireworkColumnNumber = 16,
    fireworkLayerNumber = 0,
    fireworkDotRadius = 5,
    canDrawManyFireworks = true;

// ─── Bootstrap & section dispatch ────────────────────────────────────────────
disableIsAleJumpingAndFalling();

var landInformationContainerArray = [about1ContainerDiv, about2ContainerDiv, about3ContainerDiv, experience1ContainerDiv, experience2ContainerDiv, experience3ContainerDiv];

var canScrollOrSwipe;
var seaInformationContainerArray = [skill1ContainerDiv, skill2ContainerDiv, skill3ContainerDiv];

disableScrollOrSwipe();

// ─── Event handlers ──────────────────────────────────────────────────────────
$(window).on("beforeunload", function () {
    $(window).scrollTop(0);
});

window.onload = function () {
    if (deviceName !== "computer") initTouchEvents();
    storeDivs();
    setFrontLayerVerticalHeight();
    setBannersContainerVerticalPosition();
    shiftUpPreloader();
    showContainer();
    initVariablesAfterShowContainer();
    shiftUpHorizontalLayersAfterEverythingLoaded();
    disableAnimateAleRunSwim();
    resetVariables();
    setPageHeight();
    setLayerSpeed();
    positionVerticalLayersHorizontally();
    positionRocketAndAleContainerHorizontally();
    positionContactContainer();
    positionFireworksContainer();
    resetFunctions();
    positionSplashContainer();
    setAleLeftAndRightEdge();
    positionContactConfirmationContainer();
    hideContactConfirmationContainer();
    hideAleEyesClose();
    animateAleEyes();
    animateStarsAndAlienEyes();
    positionSeaFloorObjectsVertically();
    openSquidHands();
    hideBubble();
    setRobotHandsToDefault();
    createFireworkSvg();
    appendFireworkSvgToContainer();
};

window.onscroll = function () {
    if (canScrollOrSwipe) {
        detectPageVerticalPosition();
        runTheseFunctionsAfterScrollOrSwipe();
    }
};

window.onresize = function () {
    setFrontLayerVerticalHeight();
    setBannersContainerVerticalPosition();
    setPageHeight();
    detectPageVerticalPosition();
    orientAle();
    setLayerSpeed();
    moveLayers();
    setAleLeftAndRightEdge();
    shiftUpDownHorizontalLayersOnResize();
    animateInformationAndEnemiesElements();
    positionSplashContainer();
    positionAleContainerVertically();
    positionSocialContainer();
    positionPlants();
    hideContactConfirmationContainer();
    positionContactConfirmationContainer();
    positionExperienceTextContainer();
    positionChainBlockAndStringContainer();
    positionSeaFloorObjectsVertically();
    enableScrollOrSwipe();
};

$(window).on("orientationchange", orientationChangeHandler);
