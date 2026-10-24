// ═══════════════════════════════════════════════════════════════════════════════
// GAME CONFIG — every tunable number of the game's movement and behaviour.
// Durations/intervals are in ms, distances in px unless noted as a ratio.
// Change values here; the modules only read them. How timings chain: AGENTS.md "Timing map".
// ═══════════════════════════════════════════════════════════════════════════════
function deepFreeze(object) {
    for (const value of Object.values(object)) {
        if (value && typeof value === "object") deepFreeze(value);
    }
    return Object.freeze(object);
}

var gameConfig = deepFreeze({
    preloader: {
        startDelay: 300,
        typeCharInterval: 110,
        afterTypePause: 250,
        pressPlayPause: 500,
        okPause: 300,
        searchingPause: 600,
        foundPause: 400,
        loadingStripesDuration: 700,
        runBlankDuration: 120,
        fileName: "COLACE.ME",
        searchName: "RESUME"
    },

    ale: {
        // Spritesheet: one column per frame, row 0 faces right, row 1 faces left.
        frameWidth: 200,
        frameHeight: 200,
        frames: {
            idle: 0,
            runStart: 1,
            runStop: 2,
            swimStart: 3,
            swimStop: 4,
            swimDown: 5,
            jumpUp: 6,
            jumpDown: 7,
            handsUp: 8
        },
        frameInterval: 200,
        eyesCloseOffsetRight: 82,
        eyesCloseOffsetLeft: 68,
        blinkInterval: 4000,
        blinkDuration: 300,
        groundLevelRatio: 0.2,
        edgeInset: 65,
        jump: { height: 300, upDuration: 300, downDuration: 300 },
        fallDuration: 300,
        swim: { upMsPerPx: 3, downMsPerPx: 6, minDownDistance: 100 },
        happy: { interval: 3000, handsUpDuration: 1000 },
        introDrop: { bottom: "20%", duration: 500 }
    },

    // Layout viewport of touch devices (viewport.js), in CSS px of the layout. minHeight keeps the
    // 548px splash (bottom 20%) and its ribbon inside a landscape phone's screen.
    viewport: { portraitWidth: 600, minWidth: 1000, minHeight: 680 },

    world: {
        riseDuration: 1000,
        aleToRocketDistance: 300,
        endingCloudGap: 400,
        seaShiftRatio: 0.75,
        aleMaxOffsetFromCenter: 332,
        rocketMaxOffsetFromCenter: 170,
        aleEndMarginRight: 20,
        // aboveRocketGap clears the rocket's "BOARD" sign; aboveDepth (viewBox px from the top) is how much of the extrusion stays visible.
        aboutSign: { textLeft: 460, rocketGap: 30, marginLeft: 10, minScale: 0.6, aboveRocketGap: 110, aboveDepth: 300, aboveMarginTop: 40 },
        aleRocketPaddingBottom: 150,
        resizeAfterOrientationDelay: 500
    },

    plants: { stagger: 300, duration: 800 },

    buildings: {
        stagger: 300,
        duration: 1000,
        first: { startLeft: [795, 1100, 1505], targetLeft: [0, 305, 710] },
        second: { startLeft: [795, 1100, 1505], targetLeft: [-12, 305, 550] }
    },

    experience: {
        textDistanceFromFloor: 185,
        dropStartRatio: 0.8,
        dropDuration: 1000,
        piechartFadeDuration: 500,
        piechartTextDuration: 1000,
        piechartTextStagger: 300
    },

    bosses: {
        robot: {
            landingLeft: 420,
            enterDuration: 1000,
            handsCycleInterval: 4000,
            handsFrameInterval: 100,
            piechartOrder: ["code", "graphic", "animation"]
        },
        squid: {
            landingLeft: 430,
            enterDuration: 1000,
            handsCycleInterval: 4000,
            handsFrameInterval: 200,
            handsToggles: 8,
            piechartOrder: ["code", "animation", "graphic"]
        },
        alien: {
            landingLeft: 450,
            enterDuration: 300,
            steerAngleLimit: 15,
            steerAngleStep: 5,
            steerFrameInterval: 100,
            eyesInterval: 700,
            eyesClosedDuration: 230,
            piechartOrder: ["code", "animation", "graphic"]
        }
    },

    seaAnimals: {
        swimInDistance: 900,
        columnSpacing: 150,
        rowSpacing: 100,
        stagger: 100,
        duration: 600,
        blinkInterval: 3000,
        blinkMaxEyes: 5,
        blinkDuration: 300,
        rows: {
            puffer: [5, 5, 3, 3],
            spinefish: [4, 5, 3, 3],
            jelly: [5, 5, 4, 3]
        }
    },

    sea: {
        bubbleInterval: 3000,
        bubbleMsPerPx: 2,
        backObjectsBottomRatio: -0.7
    },

    // Shared by every cutscene (cutscene.js): the glide back onto the stop the scroll overshot.
    cutscene: { settleDuration: 250 },

    // Super Mario pipes between the levels (pipes.js). aleHalfWidth: half of Ale's drawn sprite, so he is
    // hidden just inside a side mouth and clear of it just outside; sinkDepth: how far he sinks to vanish
    // into a top mouth. A warp: settle → sink → transit (camera) → walk out, or the same in reverse.
    pipes: { aleHalfWidth: 60, sinkDepth: 150, sinkDuration: 800, transitDuration: 700, walkDuration: 700 },

    // Super Mario power-up between Bologna and Kyiv (powerup.js): settle → jump → head hits the block (it
    // bumps) → mushroom rises out → it slides off the edge while Ale steps forward under it → it drops onto
    // his head → grow flicker into the shaved Ale. In px: aleJumpReach and aleHeadTop are Ale's head above his
    // feet in the jumpUp and idle frames of ale-slides.png (top rows 22 and 10 of 185); stepDistance is both
    // Ale's step and the mushroom's slide from the block's centre, so it lands right on him.
    powerUp: {
        aleJumpReach: 163,
        aleHeadTop: 175,
        jumpDuration: 200,
        fallDuration: 250,
        bumpHeight: 12,
        riseDuration: 500,
        stepDistance: 60,
        stepDuration: 300,
        dropDuration: 250,
        growDuration: 700,
        growFlickerInterval: 100
    },

    // Original pixel-art star (happy face, Super Mario style): the yellow sprite cycles through a palette of CSS filters.
    stars: {
        interval: 100,
        palette: [
            "none",
            "hue-rotate(-40deg) saturate(1.4)",
            "hue-rotate(70deg) saturate(1.2)",
            "grayscale(1) brightness(1.6)"
        ]
    },

    scrollHint: { interval: 1000, visibleDuration: 500 },

    keyboard: { arrowScrollSpeed: 1 },

    // Swipe momentum (layers.js startFling). Velocities in layout px/ms; flingFriction is the velocity kept
    // per ms (0.998 halves it about every 350 ms, so a glide covers about 500 ms × the release velocity).
    touch: { flingSampleWindow: 100, flingMinVelocity: 0.05, flingMaxVelocity: 8, flingFriction: 0.998, flingMaxFrame: 50 },

    // Rocket portal to the About page: Ale walks into the rocket, the exhaust ignites while it shakes, it lifts off, then the page navigates.
    launch: {
        aleWalkDuration: 500,
        aleClimbDuration: 250,
        ignitionDuration: 500,
        shakeDistance: 3,
        shakeInterval: 60,
        exhaustFlickerInterval: 80,
        liftOffDuration: 800
    },

    // Mario-style sky show at the end of the page (ending.js). Speeds and gravity are in px per frame at
    // frameInterval; sprite sizes are in cells of cellSize px; heights are fractions of the sky, from the top.
    fireworks: {
        frameInterval: 33,
        cellSize: 5,
        volleySizes: [1, 3, 6],
        volleyInterval: 1500,
        volleyStagger: 280,
        showMix: ["burst", "burst", "star", "starBits", "starBits"],
        launchSpread: [0.06, 0.94],
        burstHeight: [0.1, 0.5],
        shellGravity: 0.45,
        shellDrift: 0.4,
        trailLife: 7,
        trailColor: "#fff2b3",
        burstRadius: [3, 6, 9],
        burstFrameHold: 2,
        burstColors: ["#ffffff", "#fff200", "#f7941d", "#ed1c24"],
        burstSparks: 12,
        burstSparkSpeed: [3, 5],
        starRadius: [14, 22],
        starGrowFrames: 12,
        starDotSpacing: 2,
        starBits: 18,
        starBitSpeed: [3, 7],
        starBitPalette: ["#29b6f6", "#ed1c24", "#d9d9e8", "#9b59d0", "#fff200", "#8dc63f"],
        palette: ["#ed1c24", "#f7941d", "#fff200", "#00bff3", "#8dc63f", "#ff9999"],
        particleGravity: 0.08,
        particleDrag: 0.955,
        particleLife: [36, 54],
        flickerFrames: 14,
        sparkleLife: 8,
        cometInterval: [1800, 4000],
        cometSpeed: [8, 12],
        cometHeight: [0.05, 0.3],
        cometTail: 28,
        cometSparkleEvery: 3,
        cometTailPalettes: [["#ffffff", "#fff200", "#f7941d", "#ed1c24"], ["#ffffff", "#ff9999", "#9b59d0", "#29b6f6", "#8dc63f"]]
    }
});
