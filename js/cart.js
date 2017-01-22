const tomorrow = new Date(new Date().getTime() + 20 * 60 * 60 * 1000);
const nextYearTomorrow = new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000);
const directory = "assets/cart/";

$(onLoadFunction());
$(cartQuery());
$(setTimeout(() => $('#footer').removeClass('hidden'), 200));

$('#visitDate')
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
        cartEmpty();
    } else {
        $("#totalAmount").text(totalCost.toFixed(2));
    }
    checkMenuSum();
}

function cartEmpty() {
    const main = $('#display');
    const testText = "with tickets";
    main.load(directory + "cart_empty.html");
    setTimeout(() => checkMenuSum(), 200);
}

$('body')
    .on('click', '.close-ticket', function () {
        const ticket = $(this).parent().parent();
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

    .on('click', '.change-quant', setSumm);

function cartQuery() {
    $.ajax({
        url: server + "api/orders/cart" + authorizationString(),
        type: 'GET',
        success: function(json){
            console.log('woohoo', json);
            loadCart(json);
        },
        error: (e) => errorRefreshFunction(e, cartQuery)
    });
}

function checkMenuSum() {
    let result = $('.ticket-counter').toArray()
        .reduce((sum, cur) => sum + parseInt(cur.textContent), 0);
    setTimeout(() => $('.menu-span').text(result), 300);
}

function findRepeat(name) {
    let repeat = false;
    $('.cart-item').each(function() {
        if ($(this).find('.cart-item-name').find('span').text() == name) {
            const counterElement = $(this).find('.ticket-counter');
            const sumPrice = $(this).find('[data-price]');
            const ticketCounter = parseInt(counterElement.text(), 10) + 1;
            counterElement.text(ticketCounter);
            sumPrice.text((ticketCounter*parseFloat(sumPrice.data('price'))).toFixed(2));
            repeat = true;
        }
    });
    return repeat;
}

function loadCart(data) {
    if (data.tickets.length) {
        data.tickets.forEach((item, i) => {
            const attr = item.attraction;
            const price = parseFloat(attr.price).toFixed(2);
            console.log(item);
            if (!findRepeat(attr.name)) {
                $('#ticketsPlace').append('<div class="cart-item container row">'
                    + '<div class="col-md-4 col-xs-7 cart-item-img vcenter">'
                    + '<img class="attr-img" src="' + attr.thumbnail + '" alt="attrImage"></div>'
                    + '<div class="col-md-4 col-xs-7 cart-item-info vcenter">'
                    + '<p class="cart-item-name">Attraction: <span>' + attr.name + '</span></p>'
                    + '<p class="cart-item-price">Price: <span>$' + price + '</span></p>'
                    + '<p><span class="quantity-mobile-fix">Quantity: </span> '
                    + '<span class="glyphicon glyphicon-minus change-quant" data-how="down"></span> '
                    + '<span class="ticket-counter">1</span> '
                    + '<span class="glyphicon glyphicon-plus change-quant" data-how="up"> </span> '
                    + '</p></div><div class="col-md-3 col-xs-2 cart-item-sum vcenter">'
                    + '<span>$</span><span data-price="' + attr.price + '">' + price + '</span>'
                    + '</div><div class="col-md-1 col-xs-3 vcenter">'
                    + '<button class="close-ticket"><span class="glyphicon glyphicon-remove">'
                    + '</span></button></div></div>');
            }
        });
        totalAmount();
    } else {
        cartEmpty();
    }
}

function setSumm() {
    const ticketBody = $(this).parent().parent().parent();
    const quantity = ticketBody.find('.ticket-counter');
    const sumPrice = ticketBody.find('[data-price]');
    let ticketCounter = parseInt(quantity.text(), 10);
    const how = $(this).data('how');

    if (how === 'down') {
        (ticketCounter > 1) ? ticketCounter -= 1 : ticketCounter = 1;
    } else if (how === 'up') {
        ticketCounter += 1;
    } else ticketCounter = 1;

    quantity.text(ticketCounter);
    sumPrice.text((ticketCounter*parseFloat(sumPrice.data('price'))).toFixed(2));
    totalAmount();
}