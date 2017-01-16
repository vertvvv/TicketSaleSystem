const access_token = localStorage.getItem('access_token');
const server = "http://localhost:8080/";
const index_directory = "assets/index/";

$(window).load(() => {
    $('#page-preloader').delay(1000).fadeOut('slow');
});

$(() => {
    $('[data-toggle="popover"]').popover();
});

$(function () {
    document.title += ' - Ticket Sale System';
});

function formattedMessage(mes) {
    let splitted = mes.split("\n");
    return splitted.join('<br>');
}

function sendOnCtrl(e) {
    const textarea = $(e.target);
    if (e.keyCode == 13 && e.ctrlKey) {
        checkIfEmpty(textarea);
    } else {
        textarea.parent().parent().removeClass('has-error');
        textarea.attr('placeholder', 'Your message...');
    }
}

function checkIfEmpty(textarea) {
    const message = textarea.val();
    if (message.isEmptyString() || !message) {
        textarea.val('');
        textarea.attr('placeholder', 'Write something!');
        textarea.parent().parent().addClass('has-error');
    } else {
        textarea.attr("id") == "dialogMessage" ? sendMessage() : messageSent();
    }
}

function onLoadFunction() {
    if (access_token) {
        $.get(server + "api/accounts", {
            access_token: access_token
        }, setProfileMenu);
    } else {
        window.location = 'index.html';
    }
}

function setProfileInfo(userData) {
    const name  = (userData.firstname && userData.lastname)
        ? userData.firstname + ' ' + userData.lastname
        : userData.mail;
    $('#namePlace').html('<img class="img-circle avatar-img" src="'+ userData.avatar
        + '" alt="">' + name + ' ' + '<span class="caret"></span>')
}

function setProfileMenu(userData) {
    console.log(userData);
    const menuFile = index_directory + ((userData.admin) ? "admin_menu_profile.html" : "menu_profile.html");
    $('#menuPlace').load(menuFile, () => setProfileInfo(userData));
}

String.prototype.isTrueEmail = function () {
    const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegExp.test(this);
};

String.prototype.isEmptyString = function () {
    const regexp = /^\s*$/;
    return regexp.test(this);
};

Date.prototype.getFormattedTime = function () {
    return ("0" + this.getDate()).slice(-2)
        + "."
        + ("0" + (this.getMonth() + 1)).slice(-2)
        + "."
        + this.getFullYear()
        + ", "
        + (this.getHours() + 4)
        + ":"
        + ("0" + this.getMinutes()).slice(-2);
};

Date.prototype.getFormattedDate = function () {
    return this.getFullYear()
        + "-"
        + ("0" + (this.getMonth() + 1)).slice(-2)
        + "-"
        + ("0" + this.getDate()).slice(-2);
};

$.postJSON = function(url, data, callback) {
    return jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        'type': 'POST',
        'url': url,
        'data': JSON.stringify(data),
        'dataType': 'json',
        'success': callback
    });
};