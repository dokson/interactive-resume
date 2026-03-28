var deviceName = ("ontouchstart" in window || navigator.maxTouchPoints > 0) ? "touchdevice" : "computer";

var containerDiv = document.getElementById("container");
containerDiv.setAttribute("class", "transparent");
