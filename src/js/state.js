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
    // Starts with his hair (ale-slides.png); the power-up mushroom shaves him for good (powerup.js)
    isShaved: false,
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
    animatePosition1: undefined
};

// ─── Scroll phases: which layers move for the current scroll position ───────
var LayersMovement = Object.freeze({
    horizontal: "horizontal",
    vertical: "vertical",
    walkingToRocket: "walking-to-rocket",
    atRocket: "at-rocket"
});

// ─── Namespace: scroll / page position ──────────────────────────────────────
var scrollState = {
    position: 0,
    positionOnTouch: 0,
    previousPosition: 0,
    delta: 0,
    layersMovement: undefined,
    // 1 and 3 are on land, 2 is the sea (pipes.js): which side of the pipes Ale is on
    level: 1,
    canScrollOrSwipe: undefined,
    touchStartX: 0,
    touchCurrentX: 0,
    touchSamples: [],
    arrowDirection: 0
};

// ─── Namespace: animation flags ─────────────────────────────────────────────
var flags = {
    preloadShiftUpDone: false,
    canFinishShiftUp: true,
    canAnimatePlant: undefined,
    canAnimateBuilding: undefined,
    canAnimateBuilding2: undefined,
    canHideScrollText: true,
    canAnimateScrollText: true,
    isRocketLaunching: false,
    starPaletteIndex: 0
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
    cutscene: undefined,
    fireworks: undefined,
    launchWalk: undefined,
    fling: undefined
};

// ─── DOM elements: page structure ───────────────────────────────────────────
var contentDiv = document.getElementById("content");
var pageDiv = document.getElementById("page");
var progressTrackDiv = document.getElementById("progress-track");
var progressBarDiv = document.getElementById("progress-bar");
var bannersContainerDiv = document.getElementById("banners-container");
var splashContainerDiv = document.getElementById("splash-container");

// ─── DOM elements: Ale character ────────────────────────────────────────────
var aleContainerDiv = document.getElementById("ale-container");
var aleDiv = document.getElementById("ale");
var aleFramesDiv = document.getElementById("ale-slides");
var aleEyesCloseDiv = document.getElementById("ale-eyes-close");
var rocketDiv = document.getElementById("rocket");
var rocketBackDiv = rocketDiv.querySelector(".rocket-back");
var rocketFrontDiv = rocketDiv.querySelector(".rocket-container");
var rocketExhaustDiv = rocketDiv.querySelector(".rocket-exhaust");
var rocketLaunchAnimations = [];
var groundAndGrassContainer1Div = document.getElementById("ground-and-grass-container-1");

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

// ─── Pipes: Super Mario warps between the levels (pipes.js) ─────────────────
/**
 * @typedef {object} Pipe
 * @property {HTMLElement} topDiv  mouth on top, standing on the land; also an .elevation Ale stands on
 * @property {HTMLElement} mouthDiv  mouth in the sea's wall, facing the water
 * @property {number} landLevel  the land level it joins to the sea
 * @property {1|-1} towardSea  scroll direction from the top mouth to the side one
 */

/** @returns {Pipe} */
function createPipe(name, landLevel, towardSea) {
    return {
        topDiv: document.getElementById(`pipe-${name}-top`),
        mouthDiv: document.getElementById(`pipe-${name}-mouth`),
        landLevel,
        towardSea
    };
}

var divePipe = createPipe("dive", 1, 1);
var climbPipe = createPipe("climb", 3, -1);
var pipes = [divePipe, climbPipe];

// ─── Power-up: the ? block and its mushroom between Bologna and Kyiv (powerup.js) ─
var powerUpBlockDiv = document.getElementById("power-up-block");
var powerUpMushroomDiv = document.getElementById("power-up-mushroom");

// ─── Namespace: cutscene playing now (cutscene.js) ──────────────────────────
// Its steps (start once, then frame(t) with t from 0 to 1) and where it began and ends.
var cutscene = {
    isActive: false,
    steps: [],
    stepIndex: 0,
    startPosition: 0,
    endPosition: 0,
    onEnd: undefined
};

// ─── DOM elements: about section (plants & buildings) ───────────────────────
var about1ContainerDiv = document.getElementById("plants-container");
var plantLine1Div = document.getElementById("plant-line-1");
var plantLine2Div = document.getElementById("plant-line-2");
var plantArray = [];
var plantTargetTopObjectArray = [plantLine1Div, plantLine1Div, plantLine2Div, plantLine2Div];

var about2ContainerDiv = document.getElementById("buildings-container");
var buildingArray = [];

var about3ContainerDiv = document.getElementById("buildings-container-2");
var building2Array = [];

// ─── DOM elements: experience section (bosses & piecharts) ──────────────────
var experience1ContainerDiv = document.getElementById("experience-1-container");
var experience2ContainerDiv = document.getElementById("experience-2-container");
var experience3ContainerDiv = document.getElementById("experience-3-container");
var experienceTextContainerArray = [];
var chainBlockAndStringContainerArray = [];
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
var alienSteerAngleLimit = gameConfig.bosses.alien.steerAngleLimit;
var alienSteerAngleIncrement = gameConfig.bosses.alien.steerAngleStep;
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

/**
 * @typedef {object} Boss
 * @property {"robot"|"squid"|"alien"} name  key into gameConfig.bosses
 * @property {number} index  position in experienceTextContainerArray / chainBlockAndStringContainerArray
 * @property {HTMLElement} div
 * @property {HTMLElement} containerDiv
 * @property {ReturnType<typeof getPiechartElements>} piechart
 * @property {() => void} startIdle  idle loop once the boss has landed
 * @property {boolean|undefined} canAnimate  true until the entry animation has played
 */

// Bosses in experience order: index matches experienceTextContainerArray / chainBlockAndStringContainerArray.
/** @returns {Boss} */
function createBoss(name, index, div, containerDiv, piechart, startIdle) {
    return { name, index, div, containerDiv, piechart, startIdle, canAnimate: undefined };
}

var bosses = [
    createBoss("robot", 0, robotDiv, experience1ContainerDiv, piechartRobot, () => animateRobotHands()),
    createBoss("squid", 1, squidDiv, experience2ContainerDiv, piechartSquid, () => animateSquidHands()),
    createBoss("alien", 2, alienDiv, experience3ContainerDiv, piechartAlien, () => animateAlienHand())
];

// ─── DOM elements: skills section (sea animals) ─────────────────────────────
var skill1ContainerDiv = document.getElementById("skill-1-container");
var skill2ContainerDiv = document.getElementById("skill-2-container");
var skill3ContainerDiv = document.getElementById("skill-3-container");

/**
 * @typedef {object} SeaAnimalSpecies
 * @property {"puffer"|"spinefish"|"jelly"} name  CSS class of the animals (eyes use `${name}-eyes`) and key into gameConfig.seaAnimals.rows
 * @property {HTMLElement} containerDiv
 * @property {HTMLElement[]} animals
 * @property {HTMLElement[]} eyes
 * @property {boolean} isAnimating
 * @property {number} arrivedCount
 * @property {boolean|undefined} canAnimate
 */

/** @returns {SeaAnimalSpecies} */
function createSeaAnimalSpecies(name, containerDiv) {
    return { name, containerDiv, animals: [], eyes: [], isAnimating: false, arrivedCount: 0, canAnimate: undefined };
}

var seaAnimalSpecies = [
    createSeaAnimalSpecies("puffer", skill1ContainerDiv),
    createSeaAnimalSpecies("spinefish", skill2ContainerDiv),
    createSeaAnimalSpecies("jelly", skill3ContainerDiv)
];

// ─── DOM elements: ending / fireworks ───────────────────────────────────────
var endingContainerDiv = document.getElementById("ending-container");
var aboutSignTitleSvg = document.getElementById("title-about-me");
var scrollOrSwipeTextContainer1Div = document.getElementById("scroll-or-swipe-text-container-1");
var scrollOrSwipeTextContainer2Div = document.getElementById("scroll-or-swipe-text-container-2");
var stars = document.getElementsByClassName("star");
var alienEyes = document.getElementById("alien-close-eyes");

var fireworksContainerDiv = document.getElementById("fireworks-container");
var fireworksCanvas = document.getElementById("fireworks-canvas");
var fireworksContext = fireworksCanvas.getContext("2d");

// ─── Firework state ────────────────────────────────────────────────────────
var fireworkLaunchQueue = [];
var fireworkShells = [];
var fireworkBursts = [];
var fireworkStars = [];
var fireworkComets = [];
var fireworkParticles = [];
var fireworksFrame = 0;
var fireworksNextVolleyFrame = 0;
var fireworksNextCometFrame = 0;

// ─── Derived layout values ──────────────────────────────────────────────────
var shiftUpLayerHorizontalDistance;

// ─── Scenes ─────────────────────────────────────────────────────────────────
// Every animated section of the world, with its whole lifecycle in one place:
//   world      "land" or "sea" (sea containers are positioned inside #sea-1)
//   container  element whose horizontal span triggers `enter` when the viewport centre crosses into it
//   reset()    restore the "not yet played" state (on load and when scrolling back to the start)
//   layout()   place elements for the current state (after every reset)
//   resize()   optional: re-place elements after a window resize
//   enter()    entry animation / idle loop when the viewport centre enters the container
// To add a scene: add its markup, then one object here.
/**
 * @typedef {object} Scene
 * @property {string} name
 * @property {"land"|"sea"} world
 * @property {HTMLElement} container
 * @property {() => void} reset
 * @property {() => void} layout
 * @property {() => void} [resize]
 * @property {() => void} enter
 */

/** @returns {Scene} */
function createBossScene(boss) {
    return {
        name: boss.name,
        world: "land",
        container: boss.containerDiv,
        reset: () => { boss.canAnimate = true },
        layout: () => { positionBoss(boss); positionBossText(boss); positionBossChain(boss) },
        resize: () => { positionBossText(boss); positionBossChain(boss) },
        enter: () => enterBossSection(boss)
    };
}

/** @returns {Scene} */
function createSeaAnimalScene(species) {
    return {
        name: species.name,
        world: "sea",
        container: species.containerDiv,
        reset: () => { if (!species.isAnimating) species.canAnimate = true },
        layout: () => { if (!species.isAnimating) positionSeaAnimals(species) },
        enter: () => enterSeaAnimalSection(species)
    };
}

/** @type {Scene[]} */
var scenes = [
    {
        name: "plants",
        world: "land",
        container: about1ContainerDiv,
        reset: () => { flags.canAnimatePlant = true },
        layout: () => positionPlants(),
        resize: () => positionPlants(),
        enter: () => enterPlantsSection()
    },
    {
        name: "buildings",
        world: "land",
        container: about2ContainerDiv,
        reset: () => { flags.canAnimateBuilding = true },
        layout: () => positionBuildings(),
        enter: () => enterBuildingsSection()
    },
    {
        name: "buildings-2",
        world: "land",
        container: about3ContainerDiv,
        reset: () => { flags.canAnimateBuilding2 = true },
        layout: () => positionBuildings2(),
        enter: () => enterBuildings2Section()
    },
    ...bosses.map(createBossScene),
    ...seaAnimalSpecies.map(createSeaAnimalScene)
];
