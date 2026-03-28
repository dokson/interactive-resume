// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL STATE — all shared variables used across JS modules
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Namespace: Ale character state ─────────────────────────────────────────
var ale = {
    isJumping: false,
    isFalling: false,
    isSwimming: false,
    isBelowSeaLevel: false,
    isHappy: false,
    swimUpHeight: undefined,
    canRunSwim: undefined,
    startFrame: undefined,
    stopFrame: undefined,
    rightEdge: undefined,
    leftEdge: undefined,
    maxHorizontalDistance: undefined,
    elevations: [],
    elevationBelow: null,
    frameIndex: 0,
    frameDirection: 1,
    staticFrame: 0,
    startRunFrame: 1,
    stopRunFrame: 2,
    startSwimFrame: 3,
    stopSwimFrame: 4,
    swimDownFrame: 5,
    startJumpFrame: 6,
    stopJumpFrame: 7,
    oneFrameWidth: 200,
    frameTimeInterval: 200,
    minSwimDownDistance: 100,
    animatePosition1: undefined,
    animatePosition2: undefined
};

// ─── Namespace: scroll / page position ──────────────────────────────────────
var scrollState = {
    position: 0,
    positionOnTouch: 0,
    previousPosition: 0,
    delta: 0,
    layersMovement: undefined,
    canScrollOrSwipe: undefined,
    touchStartX: 0,
    touchCurrentX: 0,
    touchEndX: 0
};

// ─── Namespace: animation flags ─────────────────────────────────────────────
var flags = {
    preloadShiftUpDone: false,
    canFinishShiftUp: true,
    canAnimatePlant: undefined,
    canAnimateBuilding: undefined,
    canAnimateBuilding2: undefined,
    canAnimateRobot: undefined,
    canAnimateSquid: undefined,
    canAnimateAlien: undefined,
    canAnimateBoss: undefined,
    canAnimateFish: undefined,
    canAnimateCrab: undefined,
    canAnimateTurtle: undefined,
    canAnimateLinks: undefined,
    canHideScrollText: true,
    canAnimateScrollText: true,
    contactConfirmationVisible: true,
    canDrawFireworks: true
};

// ─── Namespace: timer IDs ───────────────────────────────────────────────────
var timers = {
    blinkAleEyes: undefined,
    shiftAleFrame: undefined,
    happyAle: undefined,
    animateRobotHands: undefined,
    spinRobotHands: undefined,
    animateSquidHands: undefined,
    moveSquidHands: undefined,
    animateAlienHands: undefined,
    bubble: undefined,
    blinkSeaAnimals: undefined,
    stars: undefined,
    alienEyes: undefined,
    scrollText: undefined,
    buildingBlink: undefined,
    building2Blink: undefined,
    shiftUpLayer: undefined,
    shiftDownLayer: undefined,
    drawFirework: undefined,
    drawOneLayerFirework: undefined
};

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
var distanceBetweenAleAndRocket = 300;
var gapBetweenContactCloudAndBannersContainer = 400;
var shiftUpDownLayerHorizontalIncrement = 40;
var shiftUpDownLayerHorizontalInterval = 40;
var seaAnimalSwimDistance = 900;
var shiftUpLayerHorizontalDistance;

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
    if (scrollState.canScrollOrSwipe) {
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
