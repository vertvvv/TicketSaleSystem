const tomorrow = new Date(new Date().getTime() + 20 * 60 * 60 * 1000);
const nextDate = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
const directory = "assets/cart/";

$(onLoadFunction());
$(setTimeout(() => $('#footer').removeClass('hidden'), 400));

$('#visitDate')
    .val(tomorrow.getFormattedDate())
    .attr('min', tomorrow.getFormattedDate())
    .attr('max', nextDate.getFormattedDate())
    .on('change', function() {
        if ($(this).val() < $(this).attr('min') || $(this).val() > $(this).attr('max')) {
            $('.btn-pay-now').attr('disabled', 'disabled');
            $(this).parent().parent().addClass('has-error');
        } else {
            $('.btn-pay-now').removeAttr('disabled');
            $(this).parent().parent().removeClass('has-error');
        }
    });

$('body')
    .on('click', '.close-ticket', function () {
        const ticket = $(this).parent().parent();
        const id = ticket.data('id');
        const count = parseInt(ticket.find('.ticket-counter').text(), 10);
        window.currentTicket = false;
        deleteItemFromCart(id, count);
        ticket.addClass('nonvisible-ticket');
        ticket.delay(1000).queue(function() {
            $(this)
                .removeClass('nonvisible-ticket')
                .addClass('hidden-ticket');
        });
    })

    .on('click', '.btn-pay-now', () => {
        let thisdate = new Date($("#visitDate").val());
        confirmPurchase(thisdate);
        $('#completeDate').text(thisdate.toLocaleDateString());
        $('#completeCost').text($('#totalAmount').text());
    })

    .on('click', '.change-quant', setSumm);

function addTicketToCart(element) {
    const ticketBody = $(element).parent().parent().parent();
    const id = ticketBody.data('id');
    addItemToCart(id);
}

function cartEmpty() {
    $('#display').load(directory + "cart_empty.html");
    setTimeout(checkMenuSum, 200);
}

function checkMenuSum() {
    let result = $('.ticket-counter').toArray()
        .reduce((sum, cur) => sum + parseInt(cur.textContent), 0);
    setTimeout(() => $('.menu-span').text(result), 300);
}

function confirmPurchase(date) {
    const visitdate = '?visitdate=' + date.getFormattedDate() + '&';

    $.ajax({
        url: server + "api/orders" + visitdate + authorizationString().substr(1),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        type: 'PUT',
        success: function(json){
            console.log('woohoo', json);
        },
        error: (e) => errorRefreshFunction(e, confirmPurchase, date)
    });
}

function countItemAmount() {
    if (window.currentTicket) {
        const ticketBody = currentTicket.parent().parent().parent();
        const quantity = ticketBody.find('.ticket-counter');
        const sumPrice = ticketBody.find('[data-price]');
        let ticketCounter = parseInt(quantity.text(), 10);
        const how = currentTicket.data('how');

        if (how === 'down') {
            (ticketCounter > 1) ? ticketCounter -= 1 : ticketCounter = 1;
        } else if (how === 'up') {
            ticketCounter += 1;
        } else ticketCounter = 1;

        quantity.text(ticketCounter);
        sumPrice.text((ticketCounter*parseFloat(sumPrice.data('price'))).toFixed(2));
    }
    $('.change-quant').css("pointer-events", "auto");
}

function deleteItemFromCart(id, count = 1) {
    const data = makeTicketsArray(id, count);

    $.ajax({
        url: server + "api/tickets" + authorizationString(),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: data,
        type: 'DELETE',
        success: function(json){
            console.log('woohoo', json);
            totalAmount(json);
            countItemAmount();
        },
        error: (e) => errorRefreshFunction(e, deleteItemFromCart, id, count)
    });
}

function deleteTicketFromCart(element) {
    const ticketBody = $(element).parent().parent().parent();
    const id = ticketBody.data('id');

    deleteItemFromCart(id);
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
            if (!findRepeat(attr.name)) {
                $('#ticketsPlace').append(
                    `<div class="cart-item container row" data-id="${attr.id}">
                        <div class="col-md-4 col-xs-7 cart-item-img vcenter">
                            <img class="attr-img" src="${attr.thumbnail.substr(1)}" alt="attrImage">
                        </div>
                        <div class="col-md-4 col-xs-7 cart-item-info vcenter">
                            <p class="cart-item-name">Attraction: <span>${attr.name}</span></p>
                            <p class="cart-item-price">Price: <span>$${price}</span></p>
                            <p><span class="quantity-mobile-fix">Quantity: </span>
                            <span class="glyphicon glyphicon-minus change-quant" data-how="down"></span>
                            <span class="ticket-counter">1</span>
                            <span class="glyphicon glyphicon-plus change-quant" data-how="up"> </span> 
                            </p>
                        </div>
                        <div class="col-md-3 col-xs-2 cart-item-sum vcenter">
                            <span>$</span><span data-price="${attr.price}">${price}</span>
                        </div>
                        <div class="col-md-1 col-xs-3 vcenter">
                            <button class="close-ticket"><span class="glyphicon glyphicon-remove"></span></button>
                        </div>
                    </div>`
                );
            }
        });
        totalAmount(data);
    } else {
        cartEmpty();
    }
}

function setSumm() {
    window.currentTicket = $(this);

    $('.change-quant').css("pointer-events", "none");

    if ($(this).hasClass('glyphicon-plus')) {
        addTicketToCart(this);
    } else if ($(this).hasClass('glyphicon-minus') && (parseInt($(this).siblings('.ticket-counter').text(), 10) > 1)){
        deleteTicketFromCart(this);
    } else {
        $('.change-quant').css("pointer-events", "auto");
    }
}

function totalAmount(data) {
    if (data.total == 0) {
        cartEmpty();
    } else {
        $('#totalAmount').text(data.total.toFixed(2));
    }

    checkMenuSum();
}