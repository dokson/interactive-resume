// Get the container element
var containerDiv = document.getElementById("container");

/**
 * Sets the container's class to "displaynone" for older Internet Explorer versions (<= 8),
 * otherwise sets it to "transparent".
 *
 * This function relies on the 'browserName' and 'browserVersion' variables
 * being previously defined (e.g., by the detectBrowser() function).
 */
function setContainerTransparentOrDisplaynone() {
  if (browserName === "internet explorer" && browserVersion <= 8) {
    containerDiv.setAttribute("class", "displaynone");
  } else {
    containerDiv.setAttribute("class", "transparent");
  }
}

// Execute the function immediately to apply the appropriate style to the container
setContainerTransparentOrDisplaynone();