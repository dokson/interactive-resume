// Get the preloader element
var preloaderDiv = document.getElementById("preloader");

/**
 * Sets the preloader's class to "displaynone" for older Internet Explorer versions (<= 8),
 * otherwise sets it to "transparent".
 *
 * Assumes 'browserName' and 'browserVersion' variables are defined elsewhere
 * and accessible in this scope.
 */
function setPreloaderTransparentOrDisplaynone() {
    if (browserName === "internet explorer" && browserVersion <= 8) {
        preloaderDiv.setAttribute("class", "displaynone");
    } else {
        preloaderDiv.setAttribute("class", "transparent");
    }
}

// Call the function to apply the appropriate preloader style when the script loads
setPreloaderTransparentOrDisplaynone();