emailjs.init("H_cQjD2uFvh4WSAUf");

function initContactButton() {
    "computer" == deviceName ? 
        sendEmailDiv.onclick = function () { sendEmail() } : 
        sendEmailDiv.addEventListener("touchstart", sendEmail, !1);
}

function sendEmail() {
    hideContactConfirmationContainer();
    positionContactConfirmationContainer();
    
    var a, b, 
        c = $("#email-address").val(), 
        d = $("#email-subject").val(), 
        e = $("#email-message").val();
    
    if (c.match(/^([a-z0-9._-]+@[a-z0-9._-]+\.[a-z]{2,}$)/i)) {
        if (e.length < 1 && (b = !1, focusMessage()), 
            e.length >= 1 && (b = !0), 
            d.length < 1 && (a = !1, focusSubject()), 
            d.length >= 1 && (a = !0), 
            1 == a && 1 == b) {
            
            var f = {
                "from_email": c,
                "subject": d,
                "message": e
            };
            
            setTimeout("showContactConfirmationContainer(2)", 200);
            setTimeout(function () { send(f) }, 2e3);
        } else {
            setTimeout("showContactConfirmationContainer(1)", 200);
        }
    } else {
        focusEmail();
        setTimeout("showContactConfirmationContainer(0)", 200);
    }
    return !1;
}

function send(templateParams) {
    emailjs.send('service_9u4crjr', 'template_hfnne2s', templateParams)
        .then(function(response) {
            console.log('Email sent successfully!', response.status, response.text);
            hideContactConfirmationContainer();
            positionContactConfirmationContainer();
            setTimeout("showContactConfirmationContainer(4)", 200);
            clearAllInputField();
        })
        .catch(function(error) {
            console.log('Email failed to send:', error);
            hideContactConfirmationContainer();
            positionContactConfirmationContainer();
            setTimeout("showContactConfirmationContainer(3)", 200);
        });
}

var sendEmailDiv = document.getElementById("send-email");
initContactButton();