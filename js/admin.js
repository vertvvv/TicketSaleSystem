$(onLoadFunction());

$('.ban-button').on('click', function () {
    if ($(this).text() == 'Ban') {
        $(this).text('Unban')
            .removeClass('btn-danger')
            .addClass('btn-default')
            .parent().siblings('.user-status').text('Banned');
    } else {
        $(this).text('Ban')
            .removeClass('btn-default')
            .addClass('btn-danger')
            .parent().siblings('.user-status').text('Active');
    }
});

$('.admin-close-question').on('click', function () {
    $(this).parent().parent().remove();
});

$('#maintenanceModal').on('show.bs.modal', function (event) {
    const item = $(event.relatedTarget)
        .parent().parent().parent().parent()
        .find('div:first-of-type').find('.attr-id');
    const name = (item.length) ? item.attr('placeholder') : 'New attraction';
    $(this).find('.attr-id-rdy').attr('placeholder', name);
});

$('#addCategory').on('click', () => {
    const selects = $('select');
    const category = $('#newCategoryName').val();
    console.log(category);
    selects.each(function (item) {
        $(this)
            .find('option:last-of-type')
            .after('<option>'+category+'</option>');
    });
});

$('#removeCategory').on('click', function() {
    const currentOption = $(this)
        .parent().parent()
        .find('select').find('option:checked');
    const optionText = currentOption.text();
    const selects = $('select');
    selects.each(function (item) {
        const options = $(this).find('option');
        options.each(function (option) {
            if ($(this).text() == optionText) {
                $(this).remove();
            }
        });
    });
});

$('#dialogModal')
    .on('show.bs.modal', function (event) {
    const item = $(event.relatedTarget);
    const name = item.text();
    $(this).find('.modal-title').text(name);
})
    .on('keydown', sendOnCtrl);

$('.btn-ft-modal').on('click', () => checkIfEmpty($('#dialogMessage')));
$('.user-container-search input').each((i, item) => $(item).on('change', filterUsers));
$('#srch-term').on('keyup', filterUsers);

function filterUsers() {
    const idSearch = $('#inlineRadio1').is(':checked');
    const loginSearch = $('#inlineRadio2').is(':checked');
    const isBanned = $('#inlineCheckbox4').is(':checked');
    const filter = $('#srch-term').val().toLowerCase();

    function filterString(user, str) {
        if (!(str.includes(filter))) {
            user.addClass('no-display');
        }
    }

    $('.user-container').each(function () {
        if (isBanned) {
            let str = $(this).find('.user-status').text();
            $(this).toggleClass('no-display', !(str.includes('Banned')));
        } else {
            $(this).removeClass('no-display');
        }
        let str = (idSearch) ? $(this).find('.user-id').text() :
            (loginSearch) ? $(this).find('.user-login').text().toLowerCase() :
                $(this).find('.user-name').text().toLowerCase();
        filterString($(this), str);
    })
}

function randomID () {
    return randomPartID(4)+'-'+randomPartID(5)+'-'+randomPartID(6)+'-'+randomPartID(4);
}

function randomPartID(multiply) {
    let min = 0;
    for (let i = 0; i < multiply - 1; i++) {
        min += 9*Math.pow(10, i);
    }
    const max = Math.pow(10, multiply);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sendMessage() {
    const lastMessage = $('.modal-message:last');
    const dialogMessage = $('#dialogMessage');
    const tomorrow = new Date(new Date().getTime() + 20 * 60 * 60 * 1000);
    lastMessage.after('<div class="modal-message modal-question">'
        + '<img class="img-circle message-img" src="img/identicon6.png" alt="">'
        + '<p>' + formattedMessage(dialogMessage.val()) + '</p>'
        + '<span class="message-date">' + tomorrow.getFormattedTime() + '</span>'
        + '</div>');
    dialogMessage.val('');
}

$('#testButton').on('click', function () {
    $.get("http://localhost:8080//api/accounts/all", {
        limit: 5,
        access_token: access_token
    }, consoleLogInfo);
});

$('#testButton2').on('click', function () {
    $.postJSON(server + "api/accounts", {
        mail: $('#login').val(),
        password: md5($('#pass').val())
    }, (info) => {
        console.log('success!');
    })
        .error(function() {
            console.log('error!', $('#login').val(), $('#pass').val(), md5($('#pass').val()));
        });
});

function consoleLogInfo(info) {
    console.log(info);
}
