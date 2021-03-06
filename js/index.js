const directory = "assets/index/";

$(document).keypress((e) => {
    if (e.which == 13 && $('.modal-open').length) {
        if ($('#tab-1').is(':checked')) {
            checkEmptyLoginInputs($('#emailLogin'), $('#passLogin'));
        } else
            if ($('#tab-2').is(':checked')) {
            checkEmptyLoginInputs($('#emailSignUp'), $('#passSignUp'));
        } else
            if ($('#sendNewPass').length) {
            forgotEmailCheck();
        }
    }
});

$('#attractionModal').on('show.bs.modal', function (event) {
    const attractionData = event.relatedTarget.dataset;

    $(this).find('.modal-title').text(attractionData.name);
    $('#attrDescription').text(attractionData.description);
    $('#attrCategory').text(attractionData.category);
    $('#attrCategory').attr('data-content', attractionData.catdescription);
    $('#price').data('price', attractionData.price).text(parseFloat(attractionData.price).toFixed(2));
    $('#ticket-counter').text('1');
    $('.btn-footer-buy').data('id', attractionData.id);

    const img = $('#attrid');
    img.attr('src', attractionData.image);
    $('#imgClone').remove();

    setTimeout(() => {
        const imgClone = img.clone()
            .attr('id', 'imgClone')
            .offset({
                top: img.offset().top,
                left: img.offset().left
            })
            .addClass('image-transition hidden')
            .appendTo($('body'));
    }, 400)
});

$('body')
    .on('click', 'a.login-link', function () {
        const modalBody = $('#loginBody');
        const loginText = "Log in";
        this.text == loginText ? modalBody.load(directory + "login.html") : modalBody.load(directory + "signup.html");
    })

    .on('click', 'div.box', function () {
        changeQuantity();
        checkMaintenance($(this));
    })

    .on('click', 'span.change-quant', changeQuantity)

    .on('click', 'a.forgot-link', function () {
        const modalBody = $('#loginBody');
        const forgotText = "Forgot Password?";
        this.text == forgotText ? modalBody.load(directory + "login_forgot_password.html") : modalBody.load(directory + "login.html");
    })

    .on('click', '#sendNewPass', forgotEmailCheck)

    .on('click', '#logInButton', () => checkEmptyLoginInputs($('#emailLogin'), $('#passLogin')))

    .on('click', '#signUpButton', () => checkEmptyLoginInputs($('#emailSignUp'), $('#passSignUp')))

    .on('keydown', '#emailLogin, #emailSignUp, #passSignUp', emailWarningRemove)
    .on('click', 'label', emailWarningRemove)

    .on('click', '.btn-footer-buy', function () {
        const cnt = parseInt($('#ticket-counter').text(), 10);

        if (!($('.avatar-img').length)) {
            openLoginWindow();
        } else {
            addItemToCart($(this).data('id'), cnt);
            animatePicture($(this));
        }

        const menuSpan = $('.menu-span');
        const oldCartCount = parseInt(menuSpan.text());
        menuSpan.text(oldCartCount + cnt);
    });

$(function () {
    const access_token = localStorage.getItem('access_token');

    if (access_token) {
        getAccountInfo();
    } else {
        $('#menuPlace').load(directory + "menu_login.html");
    }

    if ((document.referrer.includes('localhost') || document.referrer.includes('ticketsale')) && !access_token) {
        $('#loginBody').load(directory + "login.html");
        $('#openModal').modal('show');
        activationMessage('activateid', 'success', 'Email confirmed!');
        activationMessage('wrongactivationlink', 'danger', 'Wrong activation link!');
    }

    attractionsQuery();
});

function activationMessage(url, className, message) {
    const timeout = 800;
    if (document.referrer.includes(url)) {
        setTimeout(() => {
            $('#logInButton').after(
                `<p class="text-center text-${className} font-semi-big" 
                style="margin-top: 60px;">${message}</p>`
            );
            $('.hr').remove();
            $('.foot-lnk').remove();
        }, timeout);
    }
}

function animatePicture(btn) {
    if ($(window).width() >= 992) {
        $('#attractionModal').modal('hide');

        const imgClone = $('#imgClone');
        const avatar = $('.avatar-img');

        imgClone.removeClass('hidden');
        imgClone.animate({
            'top': avatar.offset().top + 15,
            'left': avatar.offset().left + 15,
            'width': 100,
            'height': 100
        }, 1000)
            .animate({
                'width': 0,
                'height': 0
            }, function () {
                $(this).detach();
            });
    } else {
        const btnCopy = $(btn).clone();

        $('.modal-footer')
            .html('<p class="text-center">Item added to your cart!</p>');

        setTimeout(function () {
            $('#attractionModal').modal('hide');

            setTimeout(function () {
                $('.modal-footer').html(btnCopy);
            }, 200);

        }, 1000);
    }
}

function changeQuantity() {
    const quantity = $('#ticket-counter');
    const sumPrice = $('#price');

    let ticketCounter = parseInt(quantity.text(), 10);
    const how = ($(this).data('how')) ? $(this).data('how') : '';

    if (how === 'down') {
        (ticketCounter > 1) ? ticketCounter -= 1 : ticketCounter = 1;
    } else if (how === 'up') {
        ticketCounter += 1;
    } else ticketCounter = 1;
    quantity.text(ticketCounter);
    sumPrice.text( (ticketCounter * parseFloat( sumPrice.data('price') )).toFixed(2) );
}

function checkEmptyLoginInputs(input, pass) {
    if (!input.val().isEmptyString()) {

        if (input.val().isTrueEmail() && !(pass.val().isEmptyString())) {

            if (pass.attr('id') == 'passSignUp') {
                checkPasswords(input, pass, $('#confirmPassSignUp'))
            } else {
                loginUser(input, pass);
            }

        } else {
            throwPasswordException(input, pass);
        }

    } else {
        input.attr('placeholder', 'Write your E-Mail!');
        emailWarningRemove();
    }
}

function checkMaintenance(box) {
    const mtnText = box.data('maintenance');
    const flag = (mtnText == 'no');
    const buyButton = $('.btn-footer-buy');

    $('.maintenance-text').toggleClass('no-display', flag)
        .text('')
        .append(mtnText);

    buyButton.prop('disabled', !flag);
}

function checkPasswords(login, pass1, pass2) {
    const validCheck = (pass1.val() == pass2.val());
    const lengthCheck = (pass1.val().length > 5 && pass1.val().length < 21);

    if (validCheck) {

        if (lengthCheck) {
            signUpUser(login, pass1);
        } else {
            setPasswordException('Password length: 6-20 symbols');
            pass1.val('');
            pass2.val('');
        }

    } else {
        setPasswordException('Incorrect password confirmation');
        pass1.val('');
        pass2.val('');
    }
}

function emailWarningRemove() {
    $('.incorrect-email-text').remove();
}

function forgotEmailCheck() {
    const input = $('#emailForgot');

    if (!input.val().isEmptyString()) {

        if (input.val().isTrueEmail()) {
            newPasswordQuery(input.val());
        } else {
            throwWrongEmailException('Incorrect Email address!');
        }

    } else {
        input.attr('placeholder', 'Write your E-Mail!');
    }
}

function loadAttractions(data) {
    data.forEach((attraction, i) => {
        let mtnText = 'no';
        let mtnClass = '';
        if (attraction.maintenance) {
            mtnText = 'Attraction is currently on maintenance';
            mtnClass = ' on-maintenance';

            if (attraction.maintenance.enddate) {
                const enddate = attraction.maintenance.enddate;
                mtnText += (' till ' + enddate);
            }

            if (attraction.maintenance.reason) {
                const reason = attraction.maintenance.reason;
                mtnText += (', reason: ' + reason);
            }
        }

        const category = (attraction.category) ? attraction.category.name : 'Not indicated';
        let desc = category;

        if (attraction.category) {
            desc = 'Age: ' + attraction.category.minAge + '+, height: ' + attraction.category.minHeight + '+ cm';
        }

        $('#main').append(
            `<div class="col-lg-4 col-md-4 col-sm-4 col-xs-12 no-padding">
                <div class="box${mtnClass}" id="attr${i}" data-toggle="modal" data-target="#attractionModal"
                    data-name="${attraction.name}" data-description="${attraction.description}"
                    data-category="${category}" data-catdescription="${desc}" 
                    data-price="${attraction.price}" data-id="${attraction.id}" 
                    data-maintenance="${mtnText}" data-image="${attraction.image.substr(1)}">
                    <div class="box-icon"></div>
                    <div class="box-title">${attraction.name}</div>
                </div>
            </div>`
        );

        $('#attr' + i).find('.box-icon')
            .css('background-image', 'url(' + attraction.thumbnail.substr(1) + ')');
    });
}

function loginUser(input, pass) {
    $.post(server + "oauth/token", {
        client_id: 'web',
        client_secret: 'ticketsale',
        grant_type: 'password',
        username: $(input).val(),
        password: md5($(pass).val())
    }, setAccessToken)
        .error((e) => {
            console.log(e);

            if (e.status == 400) {
                throwPasswordException(input, pass, e);
            }

        });
}

function newPasswordQuery(email) {
    const mailString = '?mail=' + email;

    $.ajax({
        url: server + "api/accounts/newpass" + mailString,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: {},
        type: 'GET',
        success: function (json) {
            console.log('woohoo', json);
            $('.login-form').html('<p class="check-email-text">Message sent!<br>Check your E-Mail.</p>');
        },
        error: (e) => {
            throwWrongEmailException(e.responseText['error_description']);
        }
    });
}

function openLoginWindow() {
    $('#attractionModal').modal('hide');
    $('#loginBody').load(directory + "login.html");
    $('#openModal').modal('show');
}

function setPasswordException(exceptionText) {
    $('.log-in-htm').after(
        `<p class="text-warning incorrect-email-text incorrect-pass-confirm">${exceptionText}</p>`
    );
}

function signUpSuccessMessage() {
    $('#loginBody').html(
        `<a href="#" class="close-new" data-dismiss="modal" aria-label="Close"><span>&times;</span></a>
        <p class="sign-up-success-text text-center">Confirmation message sent!<br>Check your E-Mail.</p>`
    );
}

function signUpUser(login, pass) {
    $.postJSON(server + "api/accounts", {
        mail: $(login).val(),
        password: md5(pass.val())
    }, (info) => {
        signUpSuccessMessage();
    })
        .error(function (e) {
            throwPasswordException(login, pass, e);
            console.log(e);
        });
}

function throwPasswordException(input, pass, e = 0) {
    const errorText = (e) ? (JSON.parse(e.responseText).error_description) : 'Incorrect Email or empty password!';

    $('.log-in-htm').after(
        `<p class="text-warning incorrect-email-text">${errorText}</p>`
    );

    pass.val('');
    $('#confirmPassSignUp').val('');
    input.val('')
        .attr('placeholder', '');
}

function throwWrongEmailException(message = 'Error!') {
    $('#emailForgot').find('text-warning').remove();
    $('#forgot-text').after(`<p class="text-warning"><br>${message}</p>`)
}