$($.when(onLoadFunction()).done(() => setTimeout(() => usersQuery(), 200)));

$('body')
    .on('click','.ban-button', function () {
        const parentElement = $(this).parent();
        const id = parentElement.siblings('.user-id').text();
        const access_token = '&access_token=' + localStorage.getItem('access_token');
        let enabled = '?enabled=';
        if ($(this).text() == 'Ban') {
            $(this).text('Unban')
                .removeClass('btn-danger')
                .addClass('btn-default');
            parentElement.siblings('.user-status').text('Banned');
            enabled += 'false';
        } else {
            $(this).text('Ban')
                .removeClass('btn-default')
                .addClass('btn-danger')
                .parent().siblings('.user-status').text('Active');
            enabled += 'true';
        }
        const url = server + "api/accounts/" + id + enabled + access_token;
        $.ajax({
            url: url,
            type: 'PUT',
            success: function () {
                console.log('woohoo');
            },
            error: function() {
                console.log('fuck');
            }
        })
    });

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

function loadUsers(data) {
    const accounts = data.content;
    accounts.forEach((item) => {
        const status = (item.enabled) ? (item.admin) ? 'Admin' : 'Active' : 'Banned';
        const name = (item.firstname) ? item.firstname : 'Name';
        const surname = (item.lastname) ? item.lastname : 'Surname';
        const fullName = (name + surname === 'NameSurname')
            ? 'Not indicated' : name + ' ' + surname;
        const disabled = (item.admin) ? 'disabled' : '';
        const banButton = (item.enabled) ? ' btn-danger" ' + disabled + '>Ban' : ' btn-default" ' + disabled + '>Unban';
        $('#loadInfo').after('<div class="user-container row">'
            + '<div class="col-md-1 col-xs-3 vcenter">'
            + '<img class="img-thumbnail img-thumbnail-small" '
            + 'src="' + item.avatar + '"></div>'
            + '<div class="col-md-3 col-xs-4 vcenter user-id">'
            + item.id + '</div>'
            + '<div class="col-md-2 col-xs-3 vcenter user-login">'
            + item.mail + '</div>'
            + '<div class="col-md-2 col-xs-3 vcenter user-name">'
            + fullName + '</div>'
            + '<div class="col-md-2 col-xs-4 vcenter user-status">'
            + status + '</div>'
            + '<div class="col-md-1 col-xs-3 user-ban vcenter">'
            + '<button class="btn btn-block ban-button'
            + banButton + '</button></div></div>');
    });
}

function usersQuery() {
    let access_token = localStorage.getItem('access_token');
    $.get(server + "api/accounts/all", {
        access_token: access_token
    }, loadUsers)
        .error(() => setTimeout(() => usersQuery(), 200));
}