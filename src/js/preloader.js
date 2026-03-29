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
    $(preloaderDiv).stop().animate({
        bottom: "100%"
    }, 1000, () => {
        hidePreloader()
    })
}

function turnOffPreloaderDotsAnimation() {
    preloaderDotsDiv.className = "preloader-dots-static"
}

var preloaderDotsDiv = document.getElementById("preloader-dots");
showPreloader();
