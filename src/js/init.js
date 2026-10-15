// ─── DOM collection ──────────────────────────────────────────────────────────
function collectElements(selector, targetArray) {
    const elements = document.querySelectorAll(selector);
    for (const el of elements) targetArray.push(el);
}

function storeDivs() {
    for (const species of seaAnimalSpecies) {
        collectElements(`.${species.name}`, species.animals);
        collectElements(`.${species.name}-eyes`, species.eyes);
    }
    collectElements(".elevation", ale.elevations);
    collectElements(".plant", plantArray);
    collectElements(".building", buildingArray);
    collectElements(".building2", building2Array);
    collectElements(".experience-text-container", experienceTextContainerArray);
    collectElements(".chain-block-and-string-container", chainBlockAndStringContainerArray);
    collectElements(".layer-horizontal", layerHorizontalArray);
    collectElements(".layer-vertical", layerVerticalArray);
    collectElements(".algae-a, .algae-b, .title-skills-class", seaFloorFrontObjectArray);
    collectElements(".coral, .coral-big", seaFloorBackObjectArray);
    collectElements(".squid-hand-close", squidHandCloseArray);
    collectElements(".squid-hand-open", squidHandOpenArray);
}

function resetVariables() {
    scrollState.position = 0;
    resetScenes();
}

function resetFunctions() {
    layoutScenes();
    stopFireworks()
}
