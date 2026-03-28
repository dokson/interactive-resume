// ─── EmailJS init (must run before initContactButton) ────────────────────────
emailjs.init("H_cQjD2uFvh4WSAUf");

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
    if (canAnimateLinksContainer) {
        setLinksContainerOpacity(0);
        linksContainerDiv.style.top = "80%"
    } else {
        linksContainerDiv.style.top = "0px"
    }
}

function animateLinksContainer() {
    if (canAnimateLinksContainer) {
        $(linksContainerDiv).stop().animate({ top: [0, "easeOutCubic"] }, 1000, () => { });
        setLinksContainerOpacity(1);
        canAnimateLinksContainer = false
    }
}

function setLinksContainerOpacity(opacity) {
    if (opacity > 1) { opacity = 1 }
    if (opacity < 0) { opacity = 0 }
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
    const leftPosition = (layersMovement === "not moving 1" || layersMovement === "not moving 2") ?
        aleContainerDiv.offsetLeft : aleMaxHorizontalDistance;

    for (let i = 0; i < contactConfirmationContainerArray.length; i++) {
        contactConfirmationContainerArray[i].style.left = `${leftPosition}px`;
        contactConfirmationContainerArray[i].style.top = `${.8 * containerDiv.offsetHeight - 370}px`;
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
    isContactConfirmationContainerVisible = isVisible;
}

function hideContactConfirmationContainer() {
    if (isContactConfirmationContainerVisible) {
        toggleContactConfirmationContainer(false);
    }
}

function showContactConfirmationContainer(index) {
    const containerChildren = contactConfirmationContainerArray[index].children[0].children;
    for (const child of containerChildren) {
        $(child).fadeTo(0, 1);
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
    for (let i = 0; i < fireworkArray.length; i++) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
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
    if (canDrawManyFireworks) {
        clearInterval(drawFireworkTimer);
        drawFireworkTimer = setInterval(() => { drawFirework() }, 1000);
        canDrawManyFireworks = false
    }
}

function drawFirework() {
    if (drawFireworkCounter >= fireworkArray.length) {
        drawFireworkCounter = 0;
        resetFireworkSvg();
    } else {
        clearRafInterval(drawOneLayerOfFireworkTimer);
        drawOneLayerOfFireworkTimer = setRafInterval(() => { drawOneLayerOfFirework() }, 40)
    }
}

function drawOneLayerOfFirework() {
    if (fireworkLayerNumber < fireworkRowNumber) {
        fireworkLayerNumber += 1;
        for (let i = 0; i < fireworkColumnNumber; i++) {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", `${fireworkCenterX + Math.cos(i * fireworkOneRotationAngle) * (fireworkLayerNumber * fireworkOneRadiusDistance)}`);
            circle.setAttribute("cy", `${fireworkCenterY + Math.sin(i * fireworkOneRotationAngle) * (fireworkLayerNumber * fireworkOneRadiusDistance)}`);
            circle.setAttribute("r", fireworkDotRadius);
            circle.setAttribute("fill", "#ffffff");
            fireworkSvgArray[drawFireworkCounter].appendChild(circle)
        }
    } else {
        fireworkLayerNumber = 0;
        clearRafInterval(drawOneLayerOfFireworkTimer);
        makeFireworkDisappear(drawFireworkCounter);
        drawFireworkCounter += 1
    }
}

function makeFireworkDisappear(index) {
    $(fireworkArray[index]).fadeTo(1000, 0)
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
            setTimeout(() => { showContactConfirmationContainer(2); }, 200);
            setTimeout(() => { send(templateParams); }, 2000);
        } else {
            setTimeout(() => { showContactConfirmationContainer(1); }, 200);
        }
    } else {
        focusEmail();
        setTimeout(() => { showContactConfirmationContainer(0); }, 200);
    }
    return false;
}

function send(templateParams) {
    emailjs.send('service_9u4crjr', 'template_hfnne2s', templateParams)
        .then((response) => {
            console.log('Email sent successfully!', response.status, response.text);
            hideContactConfirmationContainer();
            positionContactConfirmationContainer();
            setTimeout(() => { showContactConfirmationContainer(4); }, 200);
            clearAllInputField();
        })
        .catch((error) => {
            console.log('Email failed to send:', error);
            hideContactConfirmationContainer();
            positionContactConfirmationContainer();
            setTimeout(() => { showContactConfirmationContainer(3); }, 200);
        });
}

// ─── Contact button init (top-level, runs on script load) ────────────────────
var sendEmailDiv = document.getElementById("send-email");
initContactButton();
