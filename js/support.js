const directory = "assets/support/";

$(onLoadFunction());
$(dialogsQuery());

$('#dialogModal').on('show.bs.modal', function (event) {
    const item = $(event.relatedTarget);
    const id = item.data('id');
    $('.modal-message').remove();
    singleDialogQuery(id);
    const name = item.text();
    const modal = $(this);
    modal.find('.modal-title').text(name);
    modal.data('id', id);
    $('#dialogMessage').removeClass('hidden');
    $('.modal-footer').removeClass('hidden');
    modal.find('.questions-danger-text').remove();
    if (item.data('closed')) {
        $('#dialogMessage').addClass('hidden');
        $('.modal-footer').addClass('hidden');
        modal.find('.col-md-12').append('<p class="questions-danger-text">Dialog is closed</p>')
    }
});

$('.btn-ft-modal').on('click', function (e) {
    const modalWindow = $(this).parent().parent().parent().parent();
    modalWindow.attr("id") == "dialogModal" ? checkIfEmpty($('#dialogMessage'))
                                            : checkIfEmpty($('#newMessage'));
});

$('#dialogMessage').on('keydown', sendOnCtrl);
$('#newMessage').on('keydown', sendOnCtrl);

function dialogsQuery() {
    $.ajax({
        url: server + "api/dialogs?limit=20&" + authorizationString().substr(1),
        type: 'GET',
        success: function(json){
            console.log('woohoo', json);
            setDialogsContent(json);
        },
        error: (e) => errorRefreshFunction(e, dialogsQuery)
    });
}

function putInfoInModal(info) {
    info.messages.forEach((item) => {
        const className = (item.type === 'question') ? 'modal-question' : 'modal-answer';
        $('#modalDialogBody').before('<div class="modal-message ' + className + '">'
            + '<img class="img-circle message-img" src="' + item.user.avatar.substr(1) + '">'
            + '<p>' + item.text + '</p>'
            + '<span class="message-date">' + item.date + '</span></div>');
    })
}

function sendNewDialog() {
    const titleElement = $('#inputName');
    const title = '?title=' + ((titleElement.val()) ? titleElement.val() : 'No title') + '&' ;
    const todayDate = (new Date()).getFullFormattedDate();
    console.log(todayDate);
    $.postJSON(server + "api/dialogs" + title + authorizationString().substr(1), {
        date: todayDate,
        text: $('#newMessage').val(),
    }, (json) => {
        console.log('woohoo', json);
        const modalBody = $('#modalBody');
        modalBody.load(directory + "support_success_message.html");
        modalBody.siblings('.modal-footer').remove();
        setTimeout(() => {window.location = 'support.html'}, 1500);
    })
        .error((e) => errorRefreshFunction(e, sendNewDialog));
}

function setDialogsContent(data) {
    const questionsPlace = $('#questionsPlace');
    questionsPlace.append('<ul id="questionsList"></ul>');
    const list = $('#questionsList');
    if (data.content.length) {
        data.content.forEach((item) => {
            list.append('<li><a data-toggle="modal" data-target="#dialogModal" data-id="'
                + item.id + '" data-closed="' + item.closed + '">' + item.title + '</a></li>');
        });
        if (list.is(':empty')) {
            questionsPlace.append('<span>You have not any questions now.</span>');
            list.remove();
        }
    } else {
        questionsPlace.append('<span>You have not any questions now.</span>');
    }
}