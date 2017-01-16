const tomorrow = new Date(new Date().getTime() + 20 * 60 * 60 * 1000);
const nextYearTomorrow = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
const directory = "assets/cart/";

$("#visitDate")
    .val(tomorrow.getFormattedDate())
    .attr('min', tomorrow.getFormattedDate())
    .attr('max', nextYearTomorrow.getFormattedDate());

function totalAmount() {
    let totalCost = 0;
    $('.cart-item').each(function() {
       const ticket = $(this).find('[data-price]');
       const ticketPrice = ticket.text();
       if (!($(this).hasClass('hidden-ticket'))) {
           totalCost += parseFloat(ticketPrice);
       }
    });
    if (totalCost == 0) {
        cartEmpty(false);
    } else {
        $("#totalAmount").text(totalCost.toFixed(2));
    }
    checkMenuSum();
}

function cartEmpty() {
    const main = $('#display');
    const testText = "with tickets";
    if (this.text == testText) {
        main.load(directory + "cart_full.html");
        setTimeout(() => loadInfo(),50);
        this.text = "when empty";
    } else {
        main.load(directory + "cart_empty.html");
        this.text = testText;
        setTimeout(() => checkMenuSum(), 200);
    }
}

$('body')
    .on('click', '#testEmpty', cartEmpty)

    .on('click', '.close-ticket', function () {
        const item = $(this).parent().parent().attr('id').substr(6);
        const ticket = $('#ticket' + item);
        ticket.addClass('nonvisible-ticket');
        ticket.delay(1000).queue(function() {
            $(this)
                .removeClass('nonvisible-ticket')
                .addClass('hidden-ticket');
            totalAmount();
        });
    })

    .on('click', '.btn-pay-now', () => {
        let thisdate = new Date($("#visitDate").val());
        $("#completeDate").text(thisdate.toLocaleDateString());
        $("#completeCost").text($("#totalAmount").text());
    })

    .on('click', '.change-quant', function () {
        const ticketBody = $(this).parent().parent().parent();
        const item = ticketBody.attr('id').substr(6);
        const quantity = ticketBody.find('.ticket-counter');
        const sumPrice = ticketBody.find('[data-price]');
        let ticketCounter = parseInt(quantity.text(), 10);
        console.log(ticketBody);
        const how = $(this).data('how');

        if (how === 'down') {
            (ticketCounter > 1) ? ticketCounter -= 1 : ticketCounter = 1;
        } else if (how === 'up') {
            ticketCounter += 1;
        } else ticketCounter = 1;

        quantity.text(ticketCounter);
        sumPrice.text((ticketCounter*parseFloat(sumPrice.data('price'))).toFixed(2));
        totalAmount();
    });

$(loadInfo());
$(onLoadFunction());

function checkMenuSum() {
    let result = $('.ticket-counter').toArray()
        .reduce((sum, cur) => sum + parseInt(cur.textContent), 0);
    $('.menu-span').text(result);
}

function loadInfo() {
    $('.cart-item').each(function() {
        $(this).find('.attr-img').attr('src', 'img/attr' + this.id.substr(6) + '.png');
    });
    totalAmount();
}