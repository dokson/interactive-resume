function setContainerTransparentOrDisplaynone() {
    if (browserName === "internet explorer" && browserVersion <= 8) {
        containerDiv.setAttribute("class", "displaynone")
    } else {
        containerDiv.setAttribute("class", "transparent")
    }
}
var containerDiv = document.getElementById("container");
setContainerTransparentOrDisplaynone();
