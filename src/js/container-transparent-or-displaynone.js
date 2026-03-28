var deviceName = ("ontouchstart" in window || navigator.maxTouchPoints > 0) ? "touchdevice" : "computer";

var containerDiv = document.getElementById("container");
containerDiv.className = "transparent";
