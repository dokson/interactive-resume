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
        snapDuration: 300,
        swim: { upMsPerPx: 3, downMsPerPx: 6, minDownDistance: 100 },
        happy: { interval: 3000, handsUpDuration: 1000 },
        introDrop: { bottom: "20%", duration: 500 }
    },

    world: {
        riseDuration: 1000,
        aleToRocketDistance: 300,
        contactCloudGap: 400,
        seaShiftRatio: 0.75,
        seaShiftStep: 40,
        seaShiftInterval: 40,
        aleMaxOffsetFromCenter: 332,
        rocketMaxOffsetFromCenter: 170,
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
            fish: [5, 5, 3, 3],
            crab: [4, 5, 3, 3],
            turtle: [5, 5, 4, 3]
        }
    },

    sea: {
        bubbleInterval: 3000,
        bubbleMsPerPx: 2,
        backObjectsBottomRatio: -0.7
    },

    // Super Mario Bros. Super Star: the yellow sprite cycles through a palette of CSS filters.
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

    links: { duration: 1000, startTop: "80%" },

    contact: { confirmationOffsetTop: 370, confirmationShowDelay: 200, sendDelay: 2000 },

    fireworks: {
        rows: 8,
        columns: 16,
        dotRadius: 5,
        color: "#ffffff",
        launchInterval: 1000,
        ringInterval: 40,
        fadeDuration: 1000
    }
});
