// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL STATE — all shared variables used across JS modules
// ═══════════════════════════════════════════════════════════════════════════════

// ─── DOM elements: page structure ───────────────────────────────────────────
var contentDiv = document.getElementById("content");
var pageDiv = document.getElementById("page");
var bannersContainerDiv = document.getElementById("banners-container");
var splashContainerDiv = document.getElementById("splash-container");

// ─── DOM elements: Ale character ────────────────────────────────────────────
var aleContainerDiv = document.getElementById("ale-container");
var aleDiv = document.getElementById("ale");
var aleFramesDiv = document.getElementById("ale-slides");
var aleEyesCloseDiv = document.getElementById("ale-eyes-close");
var rocketDiv = document.getElementById("rocket");
var groundAndGrassContainer1Div = document.getElementById("ground-and-grass-container-1");
var elevation1Div = document.getElementById("elevation-1");
var elevation2Div = document.getElementById("elevation-2");

// ─── DOM elements: layers ───────────────────────────────────────────────────
var layerHorizontalArray = [];
var layerVerticalArray = [];
var layerHorizontalSpeedArray = [];
var layerVerticalSpeedArray = [];

// ─── DOM elements: sea ──────────────────────────────────────────────────────
var sea1Div = document.getElementById("sea-1");
var seaFloorDiv = document.getElementById("sea-floor");
var seaFloorFrontObjectArray = [];
var seaFloorBackObjectArray = [];
var bubbleDiv = document.getElementById("bubble");

// ─── DOM elements: about section (plants & buildings) ───────────────────────
var about1ContainerDiv = document.getElementById("plants-container");
var plantLine1Div = document.getElementById("plant-line-1");
var plantLine2Div = document.getElementById("plant-line-2");
var plantArray = [];
var plantTargetTopObjectArray = [plantLine1Div, plantLine1Div, plantLine2Div, plantLine2Div];

var about2ContainerDiv = document.getElementById("buildings-container");
var buildingTargetLeftArray = [0, 305, 710];
var buildingEarlyPositionArray = [795, 1100, 1505];
var buildingArray = [];

var about3ContainerDiv = document.getElementById("buildings-container-2");
var building2TargetLeftArray = [-12, 305, 550];
var building2EarlyPositionArray = [795, 1100, 1505];
var building2Array = [];

// ─── DOM elements: experience section (bosses & piecharts) ──────────────────
var experience1ContainerDiv = document.getElementById("experience-1-container");
var experience2ContainerDiv = document.getElementById("experience-2-container");
var experience3ContainerDiv = document.getElementById("experience-3-container");
var experienceTextContainerArray = [];
var chainBlockAndStringContainerArray = [];
var experienceTextContainerDistanceFromFloor = 185;

var robotDiv = document.getElementById("robot");
var robotHandLeftDiv = document.getElementById("robot-hand-left");
var robotHandRightDiv = document.getElementById("robot-hand-right");
var robotHandChildrenLength = $(robotHandLeftDiv).children().length;
var changeRobotHandsCounter = 0;

var squidDiv = document.getElementById("squid");
var squidHandCloseArray = [];
var squidHandOpenArray = [];
var openAndCloseSquidHandsCounter = 0;

var alienDiv = document.getElementById("alien");
var alienSteerDiv = document.getElementById("alien-steer");
var alienSteerAngle = 0;
var alienSteerAngleLimit = 15;
var alienSteerAngleIncrement = 5;
var alienSteerPreviousAngle;

function getPiechartElements(prefix) {
    return {
        front: document.getElementById(`piechart-${prefix}-front`),
        graphic1: document.getElementById(`piechart-${prefix}-text-graphic-1`),
        graphic2: document.getElementById(`piechart-${prefix}-text-graphic-2`),
        animation1: document.getElementById(`piechart-${prefix}-text-animation-1`),
        animation2: document.getElementById(`piechart-${prefix}-text-animation-2`),
        code1: document.getElementById(`piechart-${prefix}-text-code-1`),
        code2: document.getElementById(`piechart-${prefix}-text-code-2`)
    };
}

var piechartRobot = getPiechartElements("robot");
var piechartSquid = getPiechartElements("squid");
var piechartAlien = getPiechartElements("alien");

// ─── DOM elements: skills section (sea animals) ─────────────────────────────
var skill1ContainerDiv = document.getElementById("skill-1-container");
var fishArray = [];
var fishEyeArray = [];
var isFishStillAnimating = false;
var fishAnimateNumber = 0;
var numberOfFishInEachRowArray = [5, 5, 3, 3];

var skill2ContainerDiv = document.getElementById("skill-2-container");
var crabArray = [];
var crabEyeArray = [];
var isCrabStillAnimating = false;
var crabAnimateNumber = 0;
var numberOfCrabInEachRowArray = [4, 5, 3, 3];

var skill3ContainerDiv = document.getElementById("skill-3-container");
var turtleArray = [];
var turtleEyeArray = [];
var isTurtleStillAnimating = false;
var turtleAnimateNumber = 0;
var numberOfTurtleInEachRowArray = [5, 5, 4, 3];

// ─── DOM elements: contact / links / fireworks ──────────────────────────────
var contactContainerDiv = document.getElementById("contact-container");
var linksContainerDiv = document.getElementById("links-container");
var scrollOrSwipeTextContainer1Div = document.getElementById("scroll-or-swipe-text-container-1");
var scrollOrSwipeTextContainer2Div = document.getElementById("scroll-or-swipe-text-container-2");
var contactConfirmationContainerArray = [];
var emailAddressDiv = document.getElementById("email-address");
var emailSubjectDiv = document.getElementById("email-subject");
var emailMessageDiv = document.getElementById("email-message");
var stars = document.getElementsByClassName("star");
var alienEyes = document.getElementById("alien-close-eyes");

var fireworksContainerDiv = document.getElementById("fireworks-container");
var fireworkArray = [];
var fireworkSvgArray = [];

// ─── Ale: physics & sprite frames ───────────────────────────────────────────
var isAleJumping;
var isAleFalling;
var isAleSwimming = false;
var isAleBelowSeaLevel = false;
var isAleHappy = false;
var swimUpHeight;
var canAnimateAleRunSwim;
var aleStartFrame;
var aleStopFrame;
var aleRightEdge;
var aleLeftEdge;
var aleMaxHorizontalDistance;
var elevationArray = [];
var elevationNumberBelowAle = null;

var aleFrameIndex = 0;
var aleFrameDirection = 1;
var aleStaticFrame = 0;
var aleStartRunFrame = 1;
var aleStopRunFrame = 2;
var aleStartSwimFrame = 3;
var aleStopSwimFrame = 4;
var aleSwimDownFrame = 5;
var aleStartJumpFrame = 6;
var aleStopJumpFrame = 7;
var aleOneFrameWidth = 200;
var shiftAleFrameTimeInterval = 200;
var minimumVerticalDistanceToTriggerAleSwimDownFrame = 100;

// ─── Scroll / page position ─────────────────────────────────────────────────
var pageVerticalPosition = 0;
var pageVerticalPositionOnTouch = 0;
var previousPageVerticalPosition = 0;
var deltaPageVerticalPosition = 0;
var pageVerticalPositionWhenAnimateAle1;
var pageVerticalPositionWhenAnimateAle2;
var layersMovement;
var canScrollOrSwipe;
var touchStartX = 0;
var touchCurrentX = 0;
var touchEndX = 0;
var distanceBetweenAleAndRocket = 300;

// ─── Animation flags ────────────────────────────────────────────────────────
var isPreloadShiftUpAnimationFinish = false;
var canFinishShiftUpHorizontalLayersAfterEverythingLoaded = true;
var canAnimatePlantInformation;
var canAnimateBuildingInformation;
var canAnimateBuilding2Information;
var canAnimateRobotInformation;
var canAnimateSquidInformation;
var canAnimateAlienInformation;
var canAnimateBossInformation;
var canAnimateFishInformation;
var canAnimateCrabInformation;
var canAnimateTurtleInformation;
var canAnimateLinksContainer;
var canHideScrollOrSwipeTextContainer = true;
var canAnimateScrollOrSwipeTextContainer = true;
var isContactConfirmationContainerVisible = true;
var canDrawManyFireworks = true;

// ─── Timer IDs ──────────────────────────────────────────────────────────────
var blinkAleEyesTimer;
var shiftAleFrameTimer;
var happyAleTimer;
var animateRobotHandsTimer;
var spinRobotHandsTimer;
var animateSquidHandsTimer;
var moveSquidHandsTimer;
var animateAlienHandsTimer;
var bubbleTimer;
var blinkSeaAnimalsTimer;
var starsTimer;
var alienEyesTimer;
var scrollOrSwipeTextContainerTimer;
var buildingBlinkTimer;
var building2BlinkTimer;
var shiftUpLayerHorizontalDistance;
var shiftUpLayerHorizontalTimer;
var shiftDownLayerHorizontalTimer;
var drawFireworkTimer;
var drawOneLayerOfFireworkTimer;

// ─── Firework config ────────────────────────────────────────────────────────
var drawFireworkCounter = 0;
var fireworkRowNumber = 8;
var fireworkColumnNumber = 16;
var fireworkLayerNumber = 0;
var fireworkDotRadius = 5;
var fireworkCenterX;
var fireworkCenterY;
var fireworkOneRadiusDistance;
var fireworkOneRotationAngle;

// ─── Constants ──────────────────────────────────────────────────────────────
var gapBetweenContactCloudAndBannersContainer = 400;
var shiftUpDownLayerHorizontalIncrement = 40;
var shiftUpDownLayerHorizontalInterval = 40;
var seaAnimalSwimDistance = 900;

// ─── Section container arrays (built after DOM elements are declared) ───────
var landInformationContainerArray = [about1ContainerDiv, about2ContainerDiv, about3ContainerDiv, experience1ContainerDiv, experience2ContainerDiv, experience3ContainerDiv];
var seaInformationContainerArray = [skill1ContainerDiv, skill2ContainerDiv, skill3ContainerDiv];

// ─── Bootstrap ──────────────────────────────────────────────────────────────
disableIsAleJumpingAndFalling();
disableScrollOrSwipe();

// ─── Event handlers ─────────────────────────────────────────────────────────
$(window).on("beforeunload", () => {
    $(window).scrollTop(0);
});

window.onload = () => {
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
    animateStars();
    animateAlienEyes();
    positionSeaFloorObjectsVertically();
    openSquidHands();
    hideBubble();
    setRobotHandsToDefault();
    createFireworkSvg();
    appendFireworkSvgToContainer();
};

window.onscroll = () => {
    if (canScrollOrSwipe) {
        detectPageVerticalPosition();
        runTheseFunctionsAfterScrollOrSwipe();
    }
};

window.onresize = () => {
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
    positionLinksContainer();
    positionPlants();
    hideContactConfirmationContainer();
    positionContactConfirmationContainer();
    positionExperienceTextContainer();
    positionChainBlockAndStringContainer();
    positionSeaFloorObjectsVertically();
    enableScrollOrSwipe();
};

$(window).on("orientationchange", orientationChangeHandler);
