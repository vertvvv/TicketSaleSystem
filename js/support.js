const directory = "assets/support/";

$(onLoadFunction());

$('#dialogModal').on('show.bs.modal', function (event) {
    const item = $(event.relatedTarget);
    const name = item.text();
    const modal = $(this);
    modal.find('.modal-title').text(name);
});

$('.btn-ft-modal').on('click', function (e) {
    const modalWindow = $(this).parent().parent().parent().parent();
    modalWindow.attr("id") == "dialogModal" ? checkIfEmpty($('#dialogMessage'))
                                            : checkIfEmpty($('#newMessage'));
});

$('#dialogMessage').on('keydown', sendOnCtrl);
$('#newMessage').on('keydown', sendOnCtrl);

$('body')
    .on('click', '.test-link', function (e) {
        const questions = $('#questions');
        const linkText = "with questions";
        this.text == linkText ? questions.load(directory + "questions_true.html") : questions.load(directory + "questions_false.html");
    });

function messageSent() {
    const modalBody = $('#modalBody');
    modalBody.load(directory + "support_success_message.html");
    modalBody.siblings('.modal-footer').remove();
    setTimeout(() => {window.location = 'support.html'}, 1500);
}

function sendMessage() {
    const lastMessage = $('.modal-message:last');
    const dialogMessage = $('#dialogMessage');
    const tomorrow = new Date(new Date().getTime() + 20 * 60 * 60 * 1000);
    lastMessage.after('<div class="modal-message modal-question">'
        + '<img class="img-circle message-img" src="img/identicon8.png" alt="">'
        + '<p>' + formattedMessage(dialogMessage.val()) + '</p>'
        + '<span class="message-date">' + tomorrow.getFormattedTime() + '</span>'
        + '</div>');
    dialogMessage.val('');
}