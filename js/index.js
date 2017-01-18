const directory = "assets/index/";

$(document).keypress((e) => {
   if (e.which == 13 && $('.modal-open').length) {
       if ($('#tab-1').is(':checked')) {
           checkEmptyLoginInputs($('#emailLogin'), $('#passLogin'));
       } else if ($('#tab-2').is(':checked')) {
           checkEmptyLoginInputs($('#emailSignUp'), $('#passSignUp'));
       } else if ($('#sendNewPass').length) {
           forgotEmailCheck();
       }
   }
});

$('#attractionModal').on('show.bs.modal', function (event) {
    const attractionData = event.relatedTarget.dataset;
    $(this).find('.modal-title').text(attractionData.name);
    $('#attrDescription').text(attractionData.description);
    $('#attrCategory').text(attractionData.category);
    $('#price').data('price', attractionData.price).text(parseFloat(attractionData.price).toFixed(2));
    $('#ticket-counter').text('1');
    $('#attrid').attr('src', attractionData.image);
});

$('body')
    .on('click', 'a.login-link', function () {
    const modalBody = $('#loginBody');
    const loginText = "Log in";
    this.text == loginText ? modalBody.load(directory + "login.html") : modalBody.load(directory + "signup.html");
    })

    .on('click', 'div.box',  function () {
        changeQuantity();
        checkMaintenance($(this));
    })

    .on('click', 'span.change-quant',  changeQuantity)

    .on('click', 'a.forgot-link', function () {
        const modalBody = $('#loginBody');
        const forgotText = "Forgot Password?";
        this.text == forgotText ? modalBody.load(directory + "login_forgot_password.html") : modalBody.load(directory + "login.html");
    })

    .on('click', '#sendNewPass', forgotEmailCheck)

    .on('click', '#logInButton', () => checkEmptyLoginInputs($('#emailLogin'), $('#passLogin')))

    .on('click', '#signUpButton', () => checkEmptyLoginInputs($('#emailSignUp'), $('#passSignUp')))

    .on('keydown', '#emailLogin', emailWarningRemove)
    .on('keydown', '#emailSignUp', emailWarningRemove)
    .on('keydown', '#passSignUp', emailWarningRemove)
    .on('click', 'label', emailWarningRemove)

    .on('click', '.btn-footer-buy', function () {
        (!($('.avatar-img').length)) ? openLoginWindow() : animatePicture($(this));
        const menuSpan = $('.menu-span');
        const oldCartCount = parseInt(menuSpan.text());
        const thisOrderCount = parseInt($('#ticket-counter').text());
        menuSpan.text(oldCartCount + thisOrderCount);
    });

$(function () {
    const access_token = localStorage.getItem('access_token');
    if (access_token) {
        getAccountInfo();
    } else {
        $('#menuPlace').load(directory + "menu_login.html");
    }
    attractionsQuery();
});

function animatePicture(btn) {
    if ($(window).width() >= 992){
        $('#attractionModal').modal('hide');
        const img = $(btn).parent().parent().find('img');
        const avatar = $('.avatar-img');
        const imgClone = img.clone()
            .offset({
                top: img.offset().top,
                left: img.offset().left
            })
            .addClass('image-transition')
            .appendTo($('body'))
            .animate({
                'top': avatar.offset().top + 15,
                'left': avatar.offset().left + 15,
                'width': 75,
                'height': 75
            }, 1000);
        imgClone.animate({
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
    sumPrice.text((ticketCounter * parseFloat(sumPrice.data('price'))).toFixed(2));
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
    const flag = (box.data('maintenance') == 'yes');
    const buyButton = $('.btn-footer-buy');
    $('.maintenance-text').toggleClass('no-display', !flag);
    buyButton.prop('disabled', flag);
}

function checkPasswords(login, pass1, pass2) {
    const inspect = (pass1.val() == pass2.val());
    if (inspect) {
        signUpUser(login, pass1);
    } else {
        $('.log-in-htm').after('<p class="text-warning incorrect-email-text incorrect-pass-confirm">Incorrect password confirmation</p>');
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
            $('.login-form').html('<p class="check-email-text">Message sent!<br>Check your E-Mail.</p>');
        } else {
            $('#forgot-text').after('<p class="text-warning"><br>Incorrect Email address!</p>')
        }
    } else {
        input.attr('placeholder', 'Write your E-Mail!');
    }
}

function loadAttractions(data) {
    data.forEach((attraction, i) => {
        const mntnFlag = (attraction.maintenance) ? 'yes' : 'no';
        const category = (attraction.category) ? attraction.category : 'Not indicated'
        $('#main').append('<div class="col-lg-4 col-md-4 col-sm-4 col-xs-12 no-padding">'
            + '<div class="box" id="attr' + i + '" data-toggle="modal" data-target="#attractionModal" '
            + 'data-name="' + attraction.name + '" data-description="' + attraction.description + '" '
            + 'data-category="' + category + '" data-price="' + attraction.price + '" '
            + 'data-maintenance="' + mntnFlag + '" data-image="' + attraction.image + '">'
            + '<div class="box-icon"></div><div class="box-title">' + attraction.name + '</div></div></div>');
        $('#attr' + i).find('.box-icon').css('background-image', 'url(' + attraction.thumbnail + ')');
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

function openLoginWindow() {
    $('#attractionModal').modal('hide');
    $('#loginBody').load(directory + "login.html");
    $('#openModal').modal('show');
}

function signUpUser(login, pass) {
    $.postJSON(server + "api/accounts", {
        mail: $(login).val(),
        password: md5(pass.val())
    }, (info) => {
        loginUser(login, pass);
    })
        .error(function(e) {
            throwPasswordException(login, pass, e)
        });
}

function throwPasswordException(input, pass, e=0) {
    const errorText = (e) ? (JSON.parse(e.responseText).error_description)
            ? JSON.parse(e.responseText).error_description
            : JSON.parse(e.responseText).desc
            : 'Incorrect Email or empty password!';
    //const errorText = (e) ? (JSON.parse(e.responseText).error_description) : 'Incorrect Email or empty password!';
    $('.log-in-htm').after('<p class="text-warning incorrect-email-text">' + errorText + '</p>');
    input.val('');
    pass.val('');
    $('#confirmPassSignUp').val('');
    input.attr('placeholder', '');
}