var preloaderDiv = document.getElementById("preloader");
var preloaderScreenDiv = document.getElementById("preloader-screen");
var preloaderTypedSpan = document.getElementById("preloader-typed");
var preloaderCursorLine = preloaderTypedSpan.parentElement;
var preloaderSequenceDone = null;
preloaderDiv.className = "transparent";

function hidePreloader() {
    preloaderDiv.className = "displaynone"
}

function showPreloader() {
    preloaderDiv.className = ""
}

function waitPreloader(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function printPreloaderLine(text) {
    const line = document.createElement("p");
    line.textContent = text || " ";
    preloaderScreenDiv.insertBefore(line, preloaderCursorLine);
}

async function typePreloaderCommand(command) {
    for (const character of command) {
        preloaderTypedSpan.textContent += character;
        await waitPreloader(gameConfig.preloader.typeCharInterval);
    }
    await waitPreloader(gameConfig.preloader.afterTypePause);
    printPreloaderLine(command);
    preloaderTypedSpan.textContent = "";
}

async function runPreloaderSequence() {
    const timing = gameConfig.preloader;
    await waitPreloader(timing.startDelay);
    await typePreloaderCommand("LOAD");
    printPreloaderLine("");
    printPreloaderLine("PRESS PLAY ON TAPE");
    await waitPreloader(timing.pressPlayPause);
    printPreloaderLine("OK");
    printPreloaderLine("");
    await waitPreloader(timing.okPause);
    printPreloaderLine(`SEARCHING FOR ${timing.searchName}`);
    await waitPreloader(timing.searchingPause);
    printPreloaderLine(`FOUND ${timing.fileName}`);
    await waitPreloader(timing.foundPause);
    printPreloaderLine("LOADING");
    preloaderDiv.classList.add("c64-loading");
    await waitPreloader(timing.loadingStripesDuration);
}

function waitPreloaderStart() {
    const events = ["click", "keydown", "touchstart"];
    return new Promise((resolve) => {
        const start = () => {
            for (const eventName of events) window.removeEventListener(eventName, start);
            resolve();
        };
        for (const eventName of events) window.addEventListener(eventName, start);
    });
}

async function finishPreloader() {
    await preloaderSequenceDone;
    preloaderDiv.classList.remove("c64-loading");
    printPreloaderLine("READY.");
    const prompt = document.createElement("p");
    prompt.className = "c64-prompt";
    prompt.textContent = deviceName === "computer" ? "CLICK OR PRESS A KEY TO RUN" : "TAP TO RUN";
    preloaderScreenDiv.appendChild(prompt);
    preloaderDiv.classList.add("c64-waiting");
    await waitPreloaderStart();
    preloaderDiv.classList.remove("c64-waiting");
    prompt.remove();
    await typePreloaderCommand("RUN");
    preloaderDiv.classList.add("c64-blank");
    await waitPreloader(gameConfig.preloader.runBlankDuration);
    hidePreloader();
}

showPreloader();
preloaderSequenceDone = runPreloaderSequence();
