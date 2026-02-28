function setPreloaderTransparentOrDisplaynone() {
    if (browserName === "internet explorer" && browserVersion <= 8) {
        preloaderDiv.setAttribute("class", "displaynone")
    } else {
        preloaderDiv.setAttribute("class", "transparent")
    }
}
var preloaderDiv = document.getElementById("preloader");
setPreloaderTransparentOrDisplaynone();
