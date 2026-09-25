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
    initVariablesAfterShowContainer();
    disableAnimateAleRunSwim();
    resetVariables();
    setPageHeight();
    updateScrollProgress();
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
    updateScrollProgress();
    orientAle();
    setLayerSpeed();
    moveLayers();
    setAleLeftAndRightEdge();
    shiftUpDownHorizontalLayersOnResize();
    triggerEnteredScenes();
    positionSplashContainer();
    positionAleContainerVertically();
    positionLinksContainer();
    resizeScenes();
    hideContactConfirmationContainer();
    positionContactConfirmationContainer();
    positionSeaFloorObjectsVertically();
    enableScrollOrSwipe();
};

$(window).on("orientationchange", orientationChangeHandler);
