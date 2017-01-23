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

$('body').on('click', '#logout', logoutFunction);

function addItemToCart(id, count = 1) {
    let data = '["' + id;
    for (let i = 1; i < count; i++) {
        data += ('","' + id);
    }
    data += '"]';
    $.ajax({
        url: server + "api/tickets" + authorizationString(),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: data,
        type: 'POST',
        success: function(json){
            console.log('woohoo', json);
        },
        error: (e) => errorRefreshFunction(e, addItemToCart, id, count)
    });
}

function attractionsQuery() {
    $.get(server + "/api/attractions", {}, loadAttractions);
}

function authorizationString() {
    const access_token = localStorage.getItem('access_token');
    return '?access_token=' + access_token;
}

function cartQuery(callback) {
    $.ajax({
        url: server + "api/orders/cart" + authorizationString(),
        type: 'GET',
        success: function(json){
            console.log('woohoo', json);
            callback(json);
        },
        error: (e) => errorRefreshFunction(e, cartQuery, callback)
    });
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

function errorRefreshFunction(e, callback, el = 0, el2 = 0) {
    console.log(e);
    const errorStr = JSON.parse(e.responseText).error_description;
    const keep_flag = !(localStorage.getItem('keep_flag') === 'false');
    if (errorStr.includes('Access token expired')) {
        (keep_flag) ? refreshToken() : logoutFunction();
    }
    callback(el, el2);
}

function formattedMessage(mes) {
    let splitted = mes.split("\n");
    return splitted.join('<br>');
}

function getAccountInfo() {
    const curDate = new Date();
    const expireDate = new Date(localStorage.getItem('expires'));
    const access_token = localStorage.getItem('access_token');
    const keep_flag = !(localStorage.getItem('keep_flag') === 'false');
    console.log(access_token, '\n\ntime:', expireDate, keep_flag);
    if (expireDate < curDate) {
        (keep_flag) ? refreshToken() : logoutFunction();
    } else {
        getInfoFromToken();
    }
}

function getInfoFromToken() {
    const access_token = localStorage.getItem('access_token');
    const keep_flag = !(localStorage.getItem('keep_flag') === 'false');
    $.get(server + "api/accounts", {
        access_token: access_token
    }, setProfileMenu)
        .error((e) => {
            console.log(e);
            const errorStr = JSON.parse(e.responseText).error_description;
            if (errorStr.includes('Invalid access token') || errorStr.includes('Access token expired')) {
                (keep_flag) ? refreshToken() : logoutFunction();
            }
        });
}

function logoutFunction() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires');
    localStorage.removeItem('keep_flag');
    window.location = 'index.html';
}

function onLoadFunction() {
    const access_token = localStorage.getItem('access_token');
    if (access_token) {
        getAccountInfo();
    } else {
        window.location = 'index.html';
    }
}

function refreshToken() {
    const refresh_token = localStorage.getItem('refresh_token');
    $.post(server + "oauth/token", {
        client_id: 'web',
        client_secret: 'ticketsale',
        grant_type: 'refresh_token',
        refresh_token: refresh_token
    }, setAccessToken)
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

function setAccessToken(info) {
    localStorage.setItem('access_token', info.access_token);
    localStorage.setItem('refresh_token', info.refresh_token);
    if ($('#keepSignCheckbox').length) {
        localStorage.setItem('keep_flag', $('#keepSignCheckbox').is(':checked'));
    }
    const curDate = new Date();
    const expireDate = curDate.addMinutes((info.expires_in-60)/60);
    localStorage.setItem('expires', expireDate.toString());
    if ($('.login-link').length) {
        window.location = 'index.html'
    } else {
        setTimeout(() => getAccountInfo(), 100);
    }
}

function setProfileInfo(userData) {
    const name  = (userData.firstname && userData.lastname)
        ? userData.firstname + ' ' + userData.lastname
        : userData.mail;
    $('#namePlace').html('<img class="img-circle avatar-img" src="'+ userData.avatar
        + '" alt="">' + name + ' ' + '<span class="caret"></span>');
    cartQuery((data) => {
        $('.menu-span').text(data.tickets.length);
    });
}

function setProfileMenu(userData) {
    if (window.location.href.includes('admin') && !userData.admin) {
        $('body').html('<h1 class="text-incorrect-admin">Access denied!<br>Secret info here!</h1>');
        setTimeout(() => window.location = 'index.html', 1500);
    }
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

Date.prototype.addMinutes = function(minutes)
{
    const date = new Date(this.valueOf());
    date.setMinutes(date.getMinutes() + minutes);
    return date;
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