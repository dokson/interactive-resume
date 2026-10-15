// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — bootstrap and window event wiring. Loaded last: every module is defined.
// ═══════════════════════════════════════════════════════════════════════════════

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
    finishPreloader().then(shiftUpHorizontalLayersAfterEverythingLoaded);
    showContainer();
    sizeFireworksCanvas();
    disableAnimateAleRunSwim();
    resetVariables();
    setPageHeight();
    updateScrollProgress();
    setLayerSpeed();
    positionVerticalLayersHorizontally();
    positionRocketAndAleContainerHorizontally();
    positionEndingContainer();
    positionFireworksContainer();
    resetFunctions();
    positionSplashContainer();
    setAleLeftAndRightEdge();
    initRocketPortal();
    hideAleEyesClose();
    animateAleEyes();
    animateStars();
    hideStarsInFinalScene();
    animateAlienEyes();
    positionSeaFloorObjectsVertically();
    openSquidHands();
    hideBubble();
    setRobotHandsToDefault();
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
    sizeFireworksCanvas();
    detectPageVerticalPosition();
    updateScrollProgress();
    orientAle();
    setLayerSpeed();
    moveLayers();
    setAleLeftAndRightEdge();
    shiftUpDownHorizontalLayersOnResize();
    triggerEnteredScenes();
    positionSplashContainer();
    positionAleContainerVertically();
    resizeScenes();
    positionSeaFloorObjectsVertically();
    hideStarsInFinalScene();
    enableScrollOrSwipe();
};

document.addEventListener("keydown", handleArrowKeys);
document.addEventListener("keyup", stopArrowScroll);
window.addEventListener("blur", () => {
    scrollState.arrowDirection = 0
});

// Coming back from the About page through the back/forward cache restores the launched rocket: undo it.
window.addEventListener("pageshow", (event) => {
    if (event.persisted && flags.isRocketLaunching) resetRocketLaunch()
});

$(window).on("orientationchange", orientationChangeHandler);
