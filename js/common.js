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
    const data = makeTicketsArray(id, count);
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
            if (window.location.href.includes('cart')) {
                totalAmount(json);
            }
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
        textarea.attr("id") == "dialogMessage" ? sendMessage() : sendNewDialog();
    }
}

function errorRefreshFunction(e, callback, el = 0, el2 = 0) {
    console.log(e);
    const errorStr = e.responseText;
    const keep_flag = !(localStorage.getItem('keep_flag') === 'false');
    if (errorStr.includes(' token')) {
        (keep_flag) ? refreshToken() : logoutFunction();
        setTimeout(() => callback(el, el2), 1000);
    }
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
    cartQuery(setProfileMenu);
}

function logoutFunction() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires');
    localStorage.removeItem('keep_flag');
    window.location = 'index.html';
}

function makeTicketsArray(id, count) {
    let data = '["' + id;
    for (let i = 1; i < count; i++) {
        data += ('","' + id);
    }
    data += '"]';
    return data;
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
        .done(function(msg){})
        .fail(function(xhr, status, error) {
            logoutFunction();
        });
}

function sendMessage() {
    const dialogMessage = $('#dialogMessage');
    const modal = $('#dialogModal');
    const todayDate = (new Date()).getFullFormattedDate();
    const messageType = (window.location.href.includes('admin')) ? '/addanswer' : '/addquestion';
    const idString = modal.data('id') + messageType;
    $.postJSON(server + "api/dialogs/" + idString + authorizationString(), {
        date: todayDate,
        text: dialogMessage.val(),
    }, (json) => {
        console.log('woohoo', json);
        const lastMessage = $('.modal-message:last');
        const type = (window.location.href.includes('admin')) ? 'modal-answer' : 'modal-question';
        const i = json.messages.length - 1;
        const imgpath = json.messages[i].user.avatar.substr(1);
        lastMessage.after('<div class="modal-message ' + type + '">'
            + '<img class="img-circle message-img" src="' + imgpath + '" alt="">'
            + '<p>' + formattedMessage(dialogMessage.val()) + '</p>'
            + '<span class="message-date">' + todayDate + '</span>'
            + '</div>');
        dialogMessage.val('');
        if (window.location.href.includes('admin')) {
            $('.admin-questions').html('');
            waitingDialogsQuery();
            $('.admin-answered-questions').html('');
            openedDialogsQuery();
        }
    })
        .error((e) => errorRefreshFunction(e, sendMessage));
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

function setProfileInfo(data) {
    const userData = data.account;
    const name  = (userData.firstname && userData.lastname)
        ? userData.firstname + ' ' + userData.lastname
        : userData.mail;
    $('#namePlace').html('<img class="img-circle avatar-img" src="' + userData.avatar.substr(1)
        + '" alt="">' + name + ' ' + '<span class="caret"></span>');
    $('.menu-span').text(data.tickets.length);
}

function setProfileMenu(cartData) {
    if (window.location.href.includes('admin') && !cartData.account.admin) {
        $('body').html('<h1 class="text-incorrect-admin">Access denied!<br>Secret info here!</h1>');
        setTimeout(() => window.location = 'index.html', 1500);
    }
    if (window.location.href.includes('cart')) {
        loadCart(cartData);
    }
    const menuFile = index_directory + ((cartData.account.admin) ? "admin_menu_profile.html" : "menu_profile.html");
    $('#menuPlace').load(menuFile, () => setProfileInfo(cartData));
}

function singleDialogQuery(id) {
    $.ajax({
        url: server + "api/dialogs/" + id + authorizationString(),
        type: 'GET',
        success: function(json){
            console.log('woohoo', json);
            putInfoInModal(json);
        },
        error: (e) => errorRefreshFunction(e, singleDialogQuery, id)
    });
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

Date.prototype.getFormattedTime = function() {
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

Date.prototype.getFormattedDate = function() {
    return this.getFullYear()
        + "-"
        + ("0" + (this.getMonth() + 1)).slice(-2)
        + "-"
        + ("0" + this.getDate()).slice(-2);
};

Date.prototype.getFullFormattedDate = function() {
    return this.getFullYear()
        + "-"
        + ("0" + (this.getMonth() + 1)).slice(-2)
        + "-"
        + ("0" + this.getDate()).slice(-2)
        + " "
        + (this.getHours())
        + ":"
        + ("0" + this.getMinutes()).slice(-2)
        + ":"
        + ("0" + this.getSeconds()).slice(-2);
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