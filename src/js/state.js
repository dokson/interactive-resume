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
    plantTargetTopObjectArray = [];
plantTargetTopObjectArray.push(plantLine1Div, plantLine1Div, plantLine2Div, plantLine2Div);

// ─── About: plants & buildings 1 ─────────────────────────────────────────────
var canAnimatePlantInformation;

var about2ContainerDiv = document.getElementById("buildings-container"),
    buildingTargetLeft1 = 0,
    buildingTargetLeft2 = 305,
    buildingTargetLeft3 = 710,
    buildingEarlyPosition1 = 795,
    buildingEarlyPosition2 = 1100,
    buildingEarlyPosition3 = 1505,
    buildingArray = [],
    buildingTargetLeftArray = [],
    buildingEarlyPositionArray = [];
buildingTargetLeftArray.push(buildingTargetLeft1, buildingTargetLeft2, buildingTargetLeft3);
buildingEarlyPositionArray.push(buildingEarlyPosition1, buildingEarlyPosition2, buildingEarlyPosition3);

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

var piechartRobotFrontDiv = document.getElementById("piechart-robot-front"),
    piechartRobotTextGraphic1Div = document.getElementById("piechart-robot-text-graphic-1"),
    piechartRobotTextGraphic2Div = document.getElementById("piechart-robot-text-graphic-2"),
    piechartRobotTextAnimation1Div = document.getElementById("piechart-robot-text-animation-1"),
    piechartRobotTextAnimation2Div = document.getElementById("piechart-robot-text-animation-2"),
    piechartRobotTextCode1Div = document.getElementById("piechart-robot-text-code-1"),
    piechartRobotTextCode2Div = document.getElementById("piechart-robot-text-code-2");

var piechartSquidFrontDiv = document.getElementById("piechart-squid-front"),
    piechartSquidTextGraphic1Div = document.getElementById("piechart-squid-text-graphic-1"),
    piechartSquidTextGraphic2Div = document.getElementById("piechart-squid-text-graphic-2"),
    piechartSquidTextAnimation1Div = document.getElementById("piechart-squid-text-animation-1"),
    piechartSquidTextAnimation2Div = document.getElementById("piechart-squid-text-animation-2"),
    piechartSquidTextCode1Div = document.getElementById("piechart-squid-text-code-1"),
    piechartSquidTextCode2Div = document.getElementById("piechart-squid-text-code-2");

var piechartAlienFrontDiv = document.getElementById("piechart-alien-front"),
    piechartAlienTextGraphic1Div = document.getElementById("piechart-alien-text-graphic-1"),
    piechartAlienTextGraphic2Div = document.getElementById("piechart-alien-text-graphic-2"),
    piechartAlienTextAnimation1Div = document.getElementById("piechart-alien-text-animation-1"),
    piechartAlienTextAnimation2Div = document.getElementById("piechart-alien-text-animation-2"),
    piechartAlienTextCode1Div = document.getElementById("piechart-alien-text-code-1"),
    piechartAlienTextCode2Div = document.getElementById("piechart-alien-text-code-2");

var bubbleDiv = document.getElementById("bubble"),
    shiftUpDownLayerHorizontalIncrement = 40,
    shiftUpDownLayerHorizontalInterval = 40,
    seaAnimalSwimDistance = 900;

var skill1ContainerDiv = document.getElementById("skill-1-container"),
    fishArray = [],
    fishEyeArray = [],
    isFishStillAnimating = false,
    fishAnimateNumber = 0,
    numberOfFishInEachRowArray = [];
numberOfFishInEachRowArray.push(5, 5, 3, 3);

// ─── Skills: crabs ───────────────────────────────────────────────────────────
var canAnimateCrabInformation,
    skill2ContainerDiv = document.getElementById("skill-2-container"),
    crabArray = [],
    crabEyeArray = [],
    isCrabStillAnimating = false,
    crabAnimateNumber = 0,
    numberOfCrabInEachRowArray = [];
numberOfCrabInEachRowArray.push(4, 5, 3, 3);

// ─── Skills: turtles ─────────────────────────────────────────────────────────
var canAnimateTurtleInformation,
    skill3ContainerDiv = document.getElementById("skill-3-container"),
    turtleArray = [],
    turtleEyeArray = [],
    isTurtleStillAnimating = false,
    turtleAnimateNumber = 0,
    numberOfTurtleInEachRowArray = [];
numberOfTurtleInEachRowArray.push(5, 5, 4, 3);

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
    building2TargetLeft1 = -12,
    building2TargetLeft2 = 305,
    building2TargetLeft3 = 550,
    building2EarlyPosition1 = 795,
    building2EarlyPosition2 = 1100,
    building2EarlyPosition3 = 1505,
    building2Array = [],
    building2TargetLeftArray = [],
    building2EarlyPositionArray = [];
building2EarlyPositionArray.push(building2EarlyPosition1, building2EarlyPosition2, building2EarlyPosition3);
building2TargetLeftArray.push(building2TargetLeft1, building2TargetLeft2, building2TargetLeft3);

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

var landInformationContainerArray = [];
landInformationContainerArray.push(about1ContainerDiv, about2ContainerDiv, about3ContainerDiv, experience1ContainerDiv, experience2ContainerDiv, experience3ContainerDiv);

var canScrollOrSwipe;
var seaInformationContainerArray = [];
seaInformationContainerArray.push(skill1ContainerDiv, skill2ContainerDiv, skill3ContainerDiv);

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
    printResizeText();
};

$(window).on("orientationchange", orientationChangeHandler);
