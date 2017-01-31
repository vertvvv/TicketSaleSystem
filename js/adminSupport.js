$(onLoadFunction());
$(waitingDialogsQuery());

$('#dialogModal')
    .on('show.bs.modal', function (event) {
        const item = $(event.relatedTarget);
        const id = item.data('id');
        $('.modal-message').remove();
        singleDialogQuery(id);
        const name = item.text();
        const modal = $(this);
        modal.find('.modal-title').text(name);
        modal.data('id', id);
})
    .on('keydown', sendOnCtrl);

$('.btn-ft-modal').on('click', () => checkIfEmpty($('#dialogMessage')));

$('body')
    .on('click', '.admin-close-question', function () {
        $(this).parent().parent().remove();
    });

function putInfoInModal(info) {
    info.messages.forEach((item) => {
        const className = (item.type === 'question') ? 'modal-question' : 'modal-answer';
        $('#modalDialogBody').before('<div class="modal-message ' + className + '">'
            + '<img class="img-circle message-img" src="' + item.user.avatar.substr(1) + '">'
            + '<p>' + item.text + '</p>'
            + '<span class="message-date">' + item.date + '</span></div>');
    })
}

function setDialogsOnPage(data) {
    data.content.forEach((item) => {
        const userInfo = item.messages[0].user;
        const avatar = userInfo.avatar.substr(1);
        const name = userInfo.firstname + ' ' + userInfo.lastname;
        $('.admin-questions').append('<div class="admin-question-container row">'
            + '<div class="col-md-2 col-xs-12 vcenter">'
            + '<img class="img-thumbnail img-thumbnail-small" src="' + avatar + '">'
            + '</div><div class="col-md-3 col-xs-12 vcenter user-name">'
            + name + '</div><div class="col-md-4 col-xs-12 vcenter">'
            + '<a data-toggle="modal" data-target="#dialogModal" data-id="'
            + item.id + '">' + item.title
            + '</a></div><div class="col-md-2 col-xs-8 vcenter">'
            + '<button class="btn btn-block btn-danger admin-close-question">Close</button>'
            + '</div></div>')
    })
}

function waitingDialogsQuery() {
    $.ajax({
        url: server + "api/dialogs/waiting" + authorizationString(),
        type: 'GET',
        success: function(json){
            console.log('woohoo', json);
            setDialogsOnPage(json);
        },
        error: (e) => errorRefreshFunction(e, waitingDialogsQuery)
    });
}