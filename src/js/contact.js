// ─── EmailJS init (must run before initContactButton) ────────────────────────
emailjs.init("H_cQjD2uFvh4WSAUf");

// ─── Contact & Links ────────────────────────────────────────────────────────
function positionContactContainer() {
    contactContainerDiv.style.top = layerVerticalArray[layerVerticalArray.length - 1].offsetTop + "px";
    contactContainerDiv.style.left = layerVerticalArray[layerVerticalArray.length - 1].offsetLeft + "px"
}

function positionFireworksContainer() {
    fireworksContainerDiv.style.top = layerVerticalArray[layerVerticalArray.length - 1].offsetTop + "px";
    fireworksContainerDiv.style.left = layerVerticalArray[layerVerticalArray.length - 1].offsetLeft + "px"
}

function positionLinksContainer() {
    if (canAnimateLinksContainer) {
        setLinksContainerOpacity(0);
        linksContainerDiv.style.top = "80%"
    } else {
        linksContainerDiv.style.top = "0px"
    }
}

function animateLinksContainer() {
    if (canAnimateLinksContainer) {
        $(linksContainerDiv).stop().animate({ top: [0, "easeOutCubic"] }, 1000, function () { });
        setLinksContainerOpacity(1);
        canAnimateLinksContainer = false
    }
}

function setLinksContainerOpacity(opacity) {
    if (opacity > 1) { opacity = 1 }
    if (opacity < 0) { opacity = 0 }
    var childCount = $(linksContainerDiv).children().length;
    for (var i = 0; i < childCount; i++) {
        $(linksContainerDiv.children[i]).fadeTo(0, opacity)
    }
    var subChildCount = $(linksContainerDiv.children[1]).children().length;
    for (i = 0; i < subChildCount; i++) {
        $(linksContainerDiv.children[1].children[i]).fadeTo(0, opacity)
    }
}

// ─── Contact confirmation & form ─────────────────────────────────────────────
function positionContactConfirmationContainer() {
    var leftPosition = (layersMovement === "not moving 1" || layersMovement === "not moving 2") ?
        aleContainerDiv.offsetLeft : aleMaxHorizontalDistance;

    for (var i = 0; i < contactConfirmationContainerArray.length; i++) {
        contactConfirmationContainerArray[i].style.left = leftPosition + "px";
        contactConfirmationContainerArray[i].style.top = (.8 * containerDiv.offsetHeight - 370) + "px";
    }
}

function toggleContactConfirmationContainer(isVisible) {
    var opacity = isVisible ? 1 : 0;
    for (var i = 0; i < contactConfirmationContainerArray.length; i++) {
        var containerChildren = contactConfirmationContainerArray[i].children[0].children;
        for (var j = 0; j < containerChildren.length; j++) {
            $(containerChildren[j]).fadeTo(0, opacity);
        }
    }
    isContactConfirmationContainerVisible = isVisible;
}

function hideContactConfirmationContainer() {
    if (isContactConfirmationContainerVisible) {
        toggleContactConfirmationContainer(false);
    }
}

function showContactConfirmationContainer(index) {
    var containerChildren = contactConfirmationContainerArray[index].children[0].children;
    for (var i = 0; i < containerChildren.length; i++) {
        $(containerChildren[i]).fadeTo(0, 1);
    }
    isContactConfirmationContainerVisible = true;
}

function focusEmail() {
    emailAddressDiv.focus()
}

function focusSubject() {
    emailSubjectDiv.focus()
}

function focusMessage() {
    emailMessageDiv.focus()
}

function clearAllInputField() {
    emailAddressDiv.value = "";
    emailSubjectDiv.value = "";
    emailMessageDiv.value = ""
}

// ─── Fireworks ───────────────────────────────────────────────────────────────
function createFireworkSvg() {
    for (var i = 0; i < fireworkArray.length; i++) {
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("version", "1.2");
        svg.setAttribute("baseProfile", "tiny");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        fireworkSvgArray.push(svg)
    }
}

function appendFireworkSvgToContainer() {
    for (var i = 0; i < fireworkArray.length; i++)
        fireworkArray[i].appendChild(fireworkSvgArray[i])
}

function drawManyFireworks() {
    if (canDrawManyFireworks) {
        clearInterval(drawFireworkTimer);
        drawFireworkTimer = setInterval(function () { drawFirework() }, 1000);
        canDrawManyFireworks = false
    }
}

function drawFirework() {
    if (drawFireworkCounter >= fireworkArray.length) {
        drawFireworkCounter = 0;
        clearInterval(drawFireworkTimer)
    } else {
        clearInterval(drawOneLayerOfFireworkTimer);
        drawOneLayerOfFireworkTimer = setInterval(function () { drawOneLayerOfFirework() }, 40)
    }
}

function drawOneLayerOfFirework() {
    if (fireworkLayerNumber < fireworkRowNumber) {
        fireworkLayerNumber += 1;
        for (var i = 0; i < fireworkColumnNumber; i++) {
            var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", String(fireworkCenterX + Math.cos(i * fireworkOneRotationAngle) * (fireworkLayerNumber * fireworkOneRadiusDistance)));
            circle.setAttribute("cy", String(fireworkCenterY + Math.sin(i * fireworkOneRotationAngle) * (fireworkLayerNumber * fireworkOneRadiusDistance)));
            circle.setAttribute("r", fireworkDotRadius);
            circle.setAttribute("fill", "#ffffff");
            fireworkSvgArray[drawFireworkCounter].appendChild(circle)
        }
    } else {
        fireworkLayerNumber = 0;
        clearInterval(drawOneLayerOfFireworkTimer);
        makeFireworkDisappear(drawFireworkCounter);
        drawFireworkCounter += 1
    }
}

function makeFireworkDisappear(index) {
    $(fireworkArray[index]).fadeTo(1000, 0)
}

function resetFireworkSvg() {
    for (var i = 0; i < fireworkArray.length; i++) {
        $(fireworkSvgArray[i]).empty();
        $(fireworkArray[i]).fadeTo(0, 1)
    }
}

// ─── Email send ───────────────────────────────────────────────────────────────
function initContactButton() {
    if (deviceName === "computer") {
        sendEmailDiv.onclick = function () { sendEmail() }
    } else {
        sendEmailDiv.addEventListener("touchstart", sendEmail, false)
    }
}

function sendEmail() {
    hideContactConfirmationContainer();
    positionContactConfirmationContainer();

    var email = $("#email-address").val(),
        subject = $("#email-subject").val(),
        message = $("#email-message").val();

    var isEmailValid = email.match(/^([a-z0-9._-]+@[a-z0-9._-]+\.[a-z]{2,}$)/i);

    if (isEmailValid) {
        var isSubjectValid = subject.length >= 1;
        var isMessageValid = message.length >= 1;

        if (!isSubjectValid) focusSubject();
        if (!isMessageValid) focusMessage();

        if (isSubjectValid && isMessageValid) {
            var templateParams = {
                "from_email": email,
                "subject": subject,
                "message": message
            };
            setTimeout(function () { showContactConfirmationContainer(2); }, 200);
            setTimeout(function () { send(templateParams); }, 2000);
        } else {
            setTimeout(function () { showContactConfirmationContainer(1); }, 200);
        }
    } else {
        focusEmail();
        setTimeout(function () { showContactConfirmationContainer(0); }, 200);
    }
    return false;
}

function send(templateParams) {
    emailjs.send('service_9u4crjr', 'template_hfnne2s', templateParams)
        .then(function (response) {
            console.log('Email sent successfully!', response.status, response.text);
            hideContactConfirmationContainer();
            positionContactConfirmationContainer();
            setTimeout(function () { showContactConfirmationContainer(4); }, 200);
            clearAllInputField();
        })
        .catch(function (error) {
            console.log('Email failed to send:', error);
            hideContactConfirmationContainer();
            positionContactConfirmationContainer();
            setTimeout(function () { showContactConfirmationContainer(3); }, 200);
        });
}

// ─── Contact button init (top-level, runs on script load) ────────────────────
var sendEmailDiv = document.getElementById("send-email");
initContactButton();
