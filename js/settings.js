function getInfoFromToken() {
    const access_token = localStorage.getItem('access_token');
    const keep_flag = !(localStorage.getItem('keep_flag') === 'false');
    cartQuery(setPageInfo);
}

$(onLoadFunction());

$('#changeButton').on('click', passwordValidation);

$('#inputBirthDate').on('change', function() {
    if ($(this).val() < $(this).attr('min') || $(this).val() > $(this).attr('max')) {
        $('#changeButton').attr('disabled', 'disabled');
        $(this).parent().parent().addClass('has-error');
    } else {
        $('#changeButton').removeAttr('disabled');
        $(this).parent().parent().removeClass('has-error');
    }
});

$('#inputPasswordConfirm').on('keyup', function () {
    const firstField = $('#inputPassword');
    const thisParent = $(this).parent().parent();
    const firstFieldParent = firstField.parent().parent();
    if (!(firstField.val().isEmptyString())) {
        const inspect = ($(this).val() == firstField.val());
        thisParent
            .toggleClass('has-success', inspect)
            .toggleClass('has-error', !inspect);
        firstFieldParent
            .toggleClass('has-success', inspect);
    } else {
        thisParent
            .removeClass('has-success has-error');
        firstFieldParent
            .removeClass('has-success');
    }
});

$('#inputPassword').on('keyup', function () {
    if ($(this).val().isEmptyString()) {
        $('#inputPasswordConfirm').parent().parent().removeClass('has-error');
    }
});

function passwordValidation() {
    const passField = $('#inputPassword');
    const passParent = passField.parent().parent();
    if (!passField.val() || passParent.hasClass('has-success')) {
        sendDataToServer();
    } else {
        passField.val('');
        $('.text-delete').remove();
        $('#changeButton').before('<p class="text-warning text-center text-delete">Invalid password confirmation!</p>');
        $('#inputPasswordConfirm').val('')
            .parent().parent().removeClass('has-error');
    }
}

function sendDataToServer(sendData = setDataToSend()) {
    const access_token = localStorage.getItem('access_token');
    const authorization_string = 'Bearer ' + access_token;
    $.ajax({
        url: server + "api/accounts",
        headers: {
            'Authorization': authorization_string,
            'Content-Type': 'application/json'
        },
        type: 'PUT',
        data: JSON.stringify(sendData),
        dataType: 'json',
        success: function(data) {
            window.location = 'settings.html';
        }
    });
}

function setDataToSend() {
    let sendData = {};
    const passField = $('#inputPassword');
    const passParent = passField.parent().parent();
    if (passParent.hasClass('has-success')) {
        sendData.password = md5(passField.val());
    }
    $('.input-for-load').each((i, item) => {
        const attr = item.id.toLowerCase().substr(5);
        const value = $(item).val();
        if (value) {
            sendData[attr] = value;
        }
    });
    return sendData;
}

function setPageInfo(data) {
    setProfileMenu(data);
    const info = data.account;
    $('.input-for-load').each((i, item) => {
        const attr = item.id.toLowerCase().substr(5);
        if (info[attr]) {
            $(item).val(info[attr]);
        }
    });
    if (info.firstname && info.lastname) {
        $('#profileUserName')
            .removeClass('hidden')
            .text(info.firstname + ' ' + info.lastname);
    }
    if (info.birthdate) {
        $('#profileBirthDate').parent().removeClass('hidden');
        $('#profileBirthDate').text(setRightDateFormat(info.birthdate));
    }
    $('.img-thumbnail').attr('src', info.avatar.substr(1));
}

function setRightDateFormat(date) {
    return date.substr(8) +
            '.' + date.substr(5, 2) +
            '.' + date.substr(0, 4);
}