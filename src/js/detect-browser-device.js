function detectBrowser() {
    var match;
    match = /Firefox[\/\s](\d+\.\d+)/.exec(navigator.userAgent);
    if (match) {
        browserName = "firefox";
        browserVersion = Math.floor(Number(match[1]))
    }
    match = /MSIE (\d+\.\d+);/.exec(navigator.userAgent);
    if (match) {
        browserName = "internet explorer";
        browserVersion = Math.floor(Number(match[1]))
    }
    match = /Opera[\/\s](\d+\.\d+)/.exec(navigator.userAgent);
    if (match) {
        browserName = "opera";
        browserVersion = Math.floor(Number(match[1]))
    }
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf("chrome") > -1 && ua.indexOf("safari") !== -1) {
        browserName = "chrome";
        browserVersion = ""
    }
    if (ua.indexOf("chrome") === -1 && ua.indexOf("safari") !== -1) {
        browserName = "safari";
        browserVersion = ""
    }
}

function detectDevice() {
    var ua = navigator.userAgent;
    if (ua.match(/iPhone/i) || ua.match(/iPod/i) || ua.match(/iPad/i)) {
        deviceName = "iosdevice"
    } else if (ua.match(/Android/i)) {
        deviceName = "android"
    } else if (ua.match(/BlackBerry/i)) {
        deviceName = "blackberry"
    } else if (ua.match(/IEMobile/i)) {
        deviceName = "iemobile"
    } else if (ua.match(/Silk/i)) {
        deviceName = "kindle"
    } else {
        deviceName = "computer"
    }
}

var browserName, browserVersion;
detectBrowser();
var deviceName;
detectDevice();
