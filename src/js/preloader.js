var preloaderDiv = document.getElementById("preloader");
preloaderDiv.className = "transparent";

function hidePreloader() {
    preloaderDiv.className = "displaynone"
}

function showPreloader() {
    preloaderDiv.className = ""
}

function shiftUpPreloader() {
    turnOffPreloaderDotsAnimation();
    // Composited slide-up: transform never touches layout, so the reveal costs no CLS.
    preloaderDiv.classList.add("preloader-shifted-up");
    setTimeout(hidePreloader, 1000)
}

function turnOffPreloaderDotsAnimation() {
    preloaderDotsDiv.className = "preloader-dots-static"
}

var preloaderDotsDiv = document.getElementById("preloader-dots");
showPreloader();
