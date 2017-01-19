$(onLoadFunction());

$('.admin-close-question').on('click', function () {
    $(this).parent().parent().remove();
});

$('#dialogModal')
    .on('show.bs.modal', function (event) {
    const item = $(event.relatedTarget);
    const name = item.text();
    $(this).find('.modal-title').text(name);
})
    .on('keydown', sendOnCtrl);

$('.btn-ft-modal').on('click', () => checkIfEmpty($('#dialogMessage')));
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
