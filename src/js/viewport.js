// ═══════════════════════════════════════════════════════════════════════════════
// VIEWPORT — input type and the layout viewport of touch devices. Loaded right after config.js,
// before the game markup, so the first layout already uses the right width.
// ═══════════════════════════════════════════════════════════════════════════════
var deviceName = ("ontouchstart" in window || navigator.maxTouchPoints > 0) ? "touchdevice" : "computer";

var viewportMeta = document.querySelector('meta[name="viewport"]');
var portraitQuery = window.matchMedia("(orientation: portrait)");

// A fixed 1000px layout draws a portrait phone's world at a third of its size and leaves a landscape
// phone too short for its scenes. Portrait gets a narrow layout; landscape widens until the layout is
// tall enough. innerWidth / innerHeight is the visible aspect (screen.* is unreliable this early).
function getLayoutViewportWidth() {
    const { portraitWidth, minWidth, minHeight } = gameConfig.viewport;
    if (portraitQuery.matches) return portraitWidth;
    return Math.max(minWidth, Math.ceil(minHeight * window.innerWidth / window.innerHeight));
}

function setLayoutViewport() {
    viewportMeta.content = `width=${getLayoutViewportWidth()}`;
}

// Only an orientation change re-sizes the layout: the address bar showing or hiding changes
// innerHeight too, and re-sizing on it would make the whole world jump while swiping.
// .touch-layout lets style.css enlarge the smallest labels, which a phone draws at 0.5-0.6×.
if (deviceName !== "computer") {
    document.documentElement.classList.add("touch-layout");
    setLayoutViewport();
    portraitQuery.addEventListener("change", setLayoutViewport);
}
