function onLoadFunction() {
    if (access_token) {
        $.get(server + "api/accounts", {
            access_token: access_token
        }, (info) => {
            setProfileMenu(info);
            $('.input-for-load').each((i, item) => {
                const attr = item.id.toLowerCase().substr(5);
                if (info[attr]) {
                    $(item).val(info[attr]);
                }
            });
            if (info.firstname && info.lastname) {
                $('#profileUserName').text(info.firstname + ' ' + info.lastname);
            }
            if (info.birthdate) {
                $('#profileBirthDate').text(setRightDateFormat(info.birthdate));
            }
            $('.img-thumbnail').attr('src', info.avatar);
            $('#profileBirthDate').after('<p id="id-id">' + info.id + '</p>');
        });
    } else {
        window.location = 'index.html';
    }
}

$(onLoadFunction());

$('#changeButton').on('click', function () {
    const passField = $('#inputPassword');
    const passParent = passField.parent().parent();
    if (!passField.val() || passParent.hasClass('has-success')) {
        let sendData = {
        };
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
        sendData.id = $('#id-id').text();
        const str = 'Bearer ' + access_token;
        $.ajax({
            url: server + "api/accounts",
            headers: {
                'Authorization': str,
                'Content-Type': 'application/json'
            },
            type: 'PUT',
            data: JSON.stringify(sendData),
            dataType: 'json',
            success: function(data) {
                console.log('cool!');
            }
        });
        console.log(sendData);
    } else {
        passField.val('');
        $('.text-delete').remove();
        $(this).before('<p class="text-warning text-center text-delete">Invalid password confirmation!</p>');
        $('#inputPasswordConfirm').val('')
            .parent().parent().removeClass('has-error');
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

function setRightDateFormat(date) {
    return date.substr(8) +
            '.' + date.substr(5, 2) +
            '.' + date.substr(0, 4);
}