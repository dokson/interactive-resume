// ─── EmailJS init (must run before initContactButton) ────────────────────────
emailjs.init("H_cQjD2uFvh4WSAUf");

// ─── Contact & social ────────────────────────────────────────────────────────
function positionContactContainer() {
    contactContainerDiv.style.top = layerVerticalArray[layerVerticalArray.length - 1].offsetTop + "px";
    contactContainerDiv.style.left = layerVerticalArray[layerVerticalArray.length - 1].offsetLeft + "px"
}

function positionFireworksContainer() {
    fireworksContainerDiv.style.top = layerVerticalArray[layerVerticalArray.length - 1].offsetTop + "px";
    fireworksContainerDiv.style.left = layerVerticalArray[layerVerticalArray.length - 1].offsetLeft + "px"
}

function positionSocialContainer() {
    if (canAnimateSocialContainer) {
        setSocialContainerOpacity(0);
        socialContainerDiv.style.top = "80%"
    } else {
        socialContainerDiv.style.top = "0px"
    }
}

function animateSocialContainer() {
    if (canAnimateSocialContainer) {
        $(socialContainerDiv).stop().animate({ top: [0, "easeOutCubic"] }, 1000, function () { });
        setSocialContainerOpacity(1);
        canAnimateSocialContainer = false
    }
}

function setSocialContainerOpacity(e) {
    if (e > 1) { e = 1 }
    if (e < 0) { e = 0 }
    for (var t = $(socialContainerDiv).children().length, i = 0; i < t; i++) {
        $(socialContainerDiv.children[i]).fadeTo(0, e)
    }
    var n = $(socialContainerDiv.children[1]).children().length;
    for (i = 0; i < n; i++) {
        $(socialContainerDiv.children[1].children[i]).fadeTo(0, e)
    }
}

// ─── Contact confirmation & form ─────────────────────────────────────────────
function positionContactConfirmationContainer() {
    for (var e = 0; e < contactConfirmationContainerArray.length; e++) {
        contactConfirmationContainerArray[e].style.left = layersMovement === "not moving 1" || layersMovement === "not moving 2" ? aleContainerDiv.offsetLeft + "px" : aleMaxHorizontalDistance + "px";
        contactConfirmationContainerArray[e].style.top = .8 * containerDiv.offsetHeight - 370 + "px"
    }
}

function hideContactConfirmationContainer() {
    if (isContactConfirmationContainerVisible) {
        for (var e = 0; e < contactConfirmationContainerArray.length; e++)
            for (var t = $(contactConfirmationContainerArray[e]).children().children().length, i = 0; i < t; i++)
                $(contactConfirmationContainerArray[e].children[0].children[i]).fadeTo(0, 0);
        isContactConfirmationContainerVisible = false
    }
}

function showContactConfirmationContainer(e) {
    for (var t = $(contactConfirmationContainerArray[e]).children().children().length, i = 0; i < t; i++)
        $(contactConfirmationContainerArray[e].children[0].children[i]).fadeTo(0, 1);
    isContactConfirmationContainerVisible = true
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
    if (!(browserName === "internet explorer" && browserVersion <= 8))
        for (var e = 0; e < fireworkArray.length; e++) {
            var t = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            t.setAttribute("version", "1.2");
            t.setAttribute("baseProfile", "tiny");
            t.setAttribute("width", "100%");
            t.setAttribute("height", "100%");
            fireworkSvgArray.push(t)
        }
}

function appendFireworkSvgToContainer() {
    if (!(browserName === "internet explorer" && browserVersion <= 8))
        for (var e = 0; e < fireworkArray.length; e++)
            fireworkArray[e].appendChild(fireworkSvgArray[e])
}

function drawManyFireworks() {
    if (!(browserName === "internet explorer" && browserVersion <= 8) && canDrawManyFireworks) {
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
        for (var e = 0; e < fireworkColumnNumber; e++) {
            var t = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            t.setAttribute("cx", String(fireworkCenterX + Math.cos(e * fireworkOneRotationAngle) * (fireworkLayerNumber * fireworkOneRadiusDistance)));
            t.setAttribute("cy", String(fireworkCenterY + Math.sin(e * fireworkOneRotationAngle) * (fireworkLayerNumber * fireworkOneRadiusDistance)));
            t.setAttribute("r", fireworkDotRadius);
            t.setAttribute("fill", "#ffffff");
            fireworkSvgArray[drawFireworkCounter].appendChild(t)
        }
    } else {
        fireworkLayerNumber = 0;
        clearInterval(drawOneLayerOfFireworkTimer);
        makeFireworkDisappear(drawFireworkCounter);
        drawFireworkCounter += 1
    }
}

function makeFireworkDisappear(e) {
    $(fireworkArray[e]).fadeTo(1000, 0)
}

function resetFireworkSvg() {
    for (var e = 0; e < fireworkArray.length; e++) {
        $(fireworkSvgArray[e]).empty();
        $(fireworkArray[e]).fadeTo(0, 1)
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

    if (email.match(/^([a-z0-9._-]+@[a-z0-9._-]+\.[a-z]{2,}$)/i)) {
        var isSubjectValid = false,
            isMessageValid = false;

        if (subject.length < 1) { isSubjectValid = false; focusSubject() }
        if (subject.length >= 1) { isSubjectValid = true }
        if (message.length < 1) { isMessageValid = false; focusMessage() }
        if (message.length >= 1) { isMessageValid = true }

        if (isSubjectValid && isMessageValid) {
            var templateParams = {
                "from_email": email,
                "subject": subject,
                "message": message
            };
            setTimeout("showContactConfirmationContainer(2)", 200);
            setTimeout(function () { send(templateParams) }, 2000)
        } else {
            setTimeout("showContactConfirmationContainer(1)", 200)
        }
    } else {
        focusEmail();
        setTimeout("showContactConfirmationContainer(0)", 200)
    }
    return false;
}

function send(templateParams) {
    emailjs.send('service_9u4crjr', 'template_hfnne2s', templateParams)
        .then(function (response) {
            console.log('Email sent successfully!', response.status, response.text);
            hideContactConfirmationContainer();
            positionContactConfirmationContainer();
            setTimeout("showContactConfirmationContainer(4)", 200);
            clearAllInputField();
        })
        .catch(function (error) {
            console.log('Email failed to send:', error);
            hideContactConfirmationContainer();
            positionContactConfirmationContainer();
            setTimeout("showContactConfirmationContainer(3)", 200);
        });
}

// ─── Contact button init (top-level, runs on script load) ────────────────────
var sendEmailDiv = document.getElementById("send-email");
initContactButton();
