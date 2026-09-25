// ─── EmailJS init (must run before initContactButton) ────────────────────────
emailjs.init("H_cQjD2uFvh4WSAUf");

var SVG_NAMESPACE = "http://www.w3.org/2000/svg";

// ─── Contact & Links ────────────────────────────────────────────────────────
function positionContactContainer() {
    contactContainerDiv.style.top = `${layerVerticalArray[layerVerticalArray.length - 1].offsetTop}px`;
    contactContainerDiv.style.left = `${layerVerticalArray[layerVerticalArray.length - 1].offsetLeft}px`
}

function positionFireworksContainer() {
    fireworksContainerDiv.style.top = `${layerVerticalArray[layerVerticalArray.length - 1].offsetTop}px`;
    fireworksContainerDiv.style.left = `${layerVerticalArray[layerVerticalArray.length - 1].offsetLeft}px`
}

function positionLinksContainer() {
    if (flags.canAnimateLinks) {
        setLinksContainerOpacity(0);
        linksContainerDiv.style.top = gameConfig.links.startTop
    } else {
        linksContainerDiv.style.top = "0px"
    }
}

function animateLinksContainer() {
    if (flags.canAnimateLinks) {
        $(linksContainerDiv).stop().animate({ top: [0, "easeOutCubic"] }, gameConfig.links.duration);
        setLinksContainerOpacity(1);
        flags.canAnimateLinks = false
    }
}

function setLinksContainerOpacity(opacity) {
    const childCount = $(linksContainerDiv).children().length;
    for (let i = 0; i < childCount; i++) {
        $(linksContainerDiv.children[i]).fadeTo(0, opacity)
    }
    const subChildCount = $(linksContainerDiv.children[1]).children().length;
    for (let i = 0; i < subChildCount; i++) {
        $(linksContainerDiv.children[1].children[i]).fadeTo(0, opacity)
    }
}

// ─── Contact confirmation & form ─────────────────────────────────────────────
function positionContactConfirmationContainer() {
    const leftPosition = (scrollState.layersMovement === LayersMovement.walkingToRocket || scrollState.layersMovement === LayersMovement.atRocket) ?
        aleContainerDiv.offsetLeft : ale.maxHorizontalDistance;

    for (let i = 0; i < contactConfirmationContainerArray.length; i++) {
        contactConfirmationContainerArray[i].style.left = `${leftPosition}px`;
        contactConfirmationContainerArray[i].style.top = `${(1 - gameConfig.ale.groundLevelRatio) * containerDiv.offsetHeight - gameConfig.contact.confirmationOffsetTop}px`;
    }
}

function toggleContactConfirmationContainer(isVisible) {
    const opacity = isVisible ? 1 : 0;
    for (let i = 0; i < contactConfirmationContainerArray.length; i++) {
        const containerChildren = contactConfirmationContainerArray[i].children[0].children;
        for (let j = 0; j < containerChildren.length; j++) {
            $(containerChildren[j]).fadeTo(0, opacity);
        }
    }
    flags.contactConfirmationVisible = isVisible;
}

function hideContactConfirmationContainer() {
    if (flags.contactConfirmationVisible) {
        toggleContactConfirmationContainer(false);
    }
}

function showContactConfirmationContainer(index) {
    const containerChildren = contactConfirmationContainerArray[index].children[0].children;
    for (const child of containerChildren) {
        $(child).fadeTo(0, 1);
    }
    flags.contactConfirmationVisible = true;
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
    for (let i = 0; i < fireworkArray.length; i++) {
        const svg = document.createElementNS(SVG_NAMESPACE, "svg");
        svg.setAttribute("version", "1.2");
        svg.setAttribute("baseProfile", "tiny");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        fireworkSvgArray.push(svg)
    }
}

function appendFireworkSvgToContainer() {
    for (let i = 0; i < fireworkArray.length; i++)
        fireworkArray[i].appendChild(fireworkSvgArray[i])
}

function drawManyFireworks() {
    if (flags.canDrawFireworks) {
        clearInterval(timers.drawFirework);
        timers.drawFirework = setInterval(() => { drawFirework() }, gameConfig.fireworks.launchInterval);
        flags.canDrawFireworks = false
    }
}

function drawFirework() {
    if (drawFireworkCounter >= fireworkArray.length) {
        drawFireworkCounter = 0;
        resetFireworkSvg();
    } else {
        clearRafInterval(timers.drawOneLayerFirework);
        timers.drawOneLayerFirework = setRafInterval(() => { drawOneLayerOfFirework() }, gameConfig.fireworks.ringInterval)
    }
}

function drawOneLayerOfFirework() {
    const { rows, columns, dotRadius, color } = gameConfig.fireworks;
    if (fireworkLayerNumber < rows) {
        fireworkLayerNumber += 1;
        for (let i = 0; i < columns; i++) {
            const circle = document.createElementNS(SVG_NAMESPACE, "circle");
            circle.setAttribute("cx", `${fireworkCenterX + Math.cos(i * fireworkOneRotationAngle) * (fireworkLayerNumber * fireworkOneRadiusDistance)}`);
            circle.setAttribute("cy", `${fireworkCenterY + Math.sin(i * fireworkOneRotationAngle) * (fireworkLayerNumber * fireworkOneRadiusDistance)}`);
            circle.setAttribute("r", dotRadius);
            circle.setAttribute("fill", color);
            fireworkSvgArray[drawFireworkCounter].appendChild(circle)
        }
    } else {
        fireworkLayerNumber = 0;
        clearRafInterval(timers.drawOneLayerFirework);
        makeFireworkDisappear(drawFireworkCounter);
        drawFireworkCounter += 1
    }
}

function makeFireworkDisappear(index) {
    $(fireworkArray[index]).fadeTo(gameConfig.fireworks.fadeDuration, 0)
}

function resetFireworkSvg() {
    for (let i = 0; i < fireworkArray.length; i++) {
        $(fireworkSvgArray[i]).empty();
        $(fireworkArray[i]).fadeTo(0, 1)
    }
}

// ─── Email send ───────────────────────────────────────────────────────────────
function initContactButton() {
    if (deviceName === "computer") {
        sendEmailDiv.onclick = () => { sendEmail() }
    } else {
        sendEmailDiv.addEventListener("touchstart", sendEmail, false)
    }
}

function sendEmail() {
    hideContactConfirmationContainer();
    positionContactConfirmationContainer();

    const email = $("#email-address").val(),
        subject = $("#email-subject").val(),
        message = $("#email-message").val();

    const isEmailValid = email.match(/^([a-z0-9._-]+@[a-z0-9._-]+\.[a-z]{2,}$)/i);

    if (isEmailValid) {
        const isSubjectValid = subject.length >= 1;
        const isMessageValid = message.length >= 1;

        if (!isSubjectValid) focusSubject();
        if (!isMessageValid) focusMessage();

        if (isSubjectValid && isMessageValid) {
            const templateParams = {
                "from_email": email,
                "subject": subject,
                "message": message
            };
            setTimeout(() => { showContactConfirmationContainer(2); }, gameConfig.contact.confirmationShowDelay);
            setTimeout(() => { send(templateParams); }, gameConfig.contact.sendDelay);
        } else {
            setTimeout(() => { showContactConfirmationContainer(1); }, gameConfig.contact.confirmationShowDelay);
        }
    } else {
        focusEmail();
        setTimeout(() => { showContactConfirmationContainer(0); }, gameConfig.contact.confirmationShowDelay);
    }
    return false;
}

function send(templateParams) {
    emailjs.send('service_9u4crjr', 'template_hfnne2s', templateParams)
        .then((response) => {
            console.log('Email sent successfully!', response.status, response.text);
            hideContactConfirmationContainer();
            positionContactConfirmationContainer();
            setTimeout(() => { showContactConfirmationContainer(4); }, gameConfig.contact.confirmationShowDelay);
            clearAllInputField();
        })
        .catch((error) => {
            console.error('Email failed to send:', error);
            hideContactConfirmationContainer();
            positionContactConfirmationContainer();
            setTimeout(() => { showContactConfirmationContainer(3); }, gameConfig.contact.confirmationShowDelay);
        });
}

// ─── Contact button init (top-level, runs on script load) ────────────────────
var sendEmailDiv = document.getElementById("send-email");
initContactButton();
