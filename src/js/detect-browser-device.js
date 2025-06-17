// Declare global variables for browser information
var browserName;
var browserVersion;

/**
 * Detects the user's browser name and version.
 * Sets 'browserName' and 'browserVersion' global variables.
 */
function detectBrowser() {
  // Detect Firefox
  if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
    browserName = "firefox";
    var firefoxVersion = new Number(RegExp.$1);
    browserVersion = Math.floor(firefoxVersion);
  }

  // Detect Internet Explorer
  if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) {
    browserName = "internet explorer";
    var ieVersion = new Number(RegExp.$1);
    browserVersion = Math.floor(ieVersion);
  }

  // Detect Opera
  if (/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
    browserName = "opera";
    var operaVersion = new Number(RegExp.$1);
    browserVersion = Math.floor(operaVersion);
  }

  // Detect Chrome (checks for 'chrome' and 'safari' as Chrome user agent often contains both)
  if (navigator.userAgent.toLowerCase().indexOf("chrome") > -1 &&
      navigator.userAgent.toLowerCase().indexOf("safari") > -1) {
    browserName = "chrome";
    browserVersion = ""; // Version detection for Chrome is more complex with regex, so setting to empty string
  }

  // Detect Safari (if 'chrome' is NOT present but 'safari' IS present)
  if (navigator.userAgent.toLowerCase().indexOf("chrome") === -1 &&
      navigator.userAgent.toLowerCase().indexOf("safari") > -1) {
    browserName = "safari";
    browserVersion = ""; // Version detection for Safari is more complex with regex, so setting to empty string
  }
}

// Declare a global variable for device information
var deviceName;

/**
 * Detects the user's device type.
 * Sets the 'deviceName' global variable.
 */
function detectDevice() {
  var userAgent = navigator.userAgent;

  if (userAgent.match(/iPhone/i) || userAgent.match(/iPod/i) || userAgent.match(/iPad/i)) {
    deviceName = "iosdevice";
  } else if (userAgent.match(/Android/i)) {
    deviceName = "android";
  } else if (userAgent.match(/BlackBerry/i)) {
    deviceName = "blackberry";
  } else if (userAgent.match(/IEMobile/i)) {
    deviceName = "iemobile";
  } else if (userAgent.match(/Silk/i)) {
    deviceName = "kindle";
  } else {
    deviceName = "computer";
  }
}

// Execute the detection functions immediately
detectBrowser();
detectDevice();