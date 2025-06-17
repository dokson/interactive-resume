// Get the preloader dots element
var preloaderDotsDiv = document.getElementById("preloader-dots");
var preloaderDiv = document.getElementById("preloader"); // Assuming 'preloaderDiv' also exists

/**
 * Hides the preloader by adding the "displaynone" class.
 */
function hidePreloader() {
    preloaderDiv.setAttribute("class", "displaynone");
}

/**
 * Shows the preloader by removing the class attribute, making it visible.
 */
function showPreloader() {
    preloaderDiv.setAttribute("class", "");
}

/**
 * Stops the preloader dots animation by setting their class to "preloader-dots-static".
 */
function turnOffPreloaderDotsAnimation() {
    preloaderDotsDiv.setAttribute("class", "preloader-dots-static");
}

/**
 * Shifts the preloader up off the screen with an animation and then hides it.
 */
function shiftUpPreloader() {
    turnOffPreloaderDotsAnimation();
    $(preloaderDiv).stop().animate({
        bottom: "100%"
    }, 1000, function () {
        hidePreloader();
    });
}

// Initially show the preloader when the script loads
showPreloader();