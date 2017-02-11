const directory = "assets/orders/";

$(onLoadFunction());
$(getUserOrders());

$('body')
    .on('click', 'header', function () {
        const elements = $(this).parent().children('div');
        if ($(elements).css('display') == 'none') {
            elements.show().animate({opacity:1});
            $(this).parent().find('.print-button').on('click', printTicket);
        } else {
            elements.hide().animate({opacity:0});
            $(this).parent().find('.print-button').off('click');
        }
    });

function getUserOrders() {
    $.ajax({
        url: server + "api/orders" + authorizationString(),
        headers: {
            'Accept': 'application/json'
        },
        type: 'GET',
        success: function(json){
            console.log('woohoo', json);
            loadOrdersOnPage(json);
        },
        error: (e) => errorRefreshFunction(e, getUserOrders)
    });
}

function loadOrdersOnPage(orders) {
    if (orders.length) {
        orders.forEach((order, ordercnt) => {
            $('#ordersPlace').append('<div class="for-print"><div class="order-outer"><header id="order' + ordercnt
                + '" class="order-header"><div class="col-md-6 col-xs-12 vcenter"><p class="order-info">Order date: '
                + order.orderdate + '</p><p class="order-info">Visit date: ' + order.visitdate + '</p></div>'
                + '<div class="col-md-5 vcenter text-right">'
                + '<button class="print-button"><span class="print-icon">'
                + '</span></button></div></header></div></div>');
            order.tickets.forEach((ticket, i) => {
                const attr = ticket.attraction;
                const price = parseFloat(attr.price).toFixed(2);
                const code = (ticket.enabled) ? ticket.code.substr(1) : 'img/wrongqr.png';
                $('#order' + ordercnt).after('<div id="' + ticket.id + '" class="orders-container container row">'
                    + '<div class="col-md-5 col-xs-5 vcenter">'
                    + '<img class="ticket-image" src="' + code + '" title="QR-Code" alt="QR-Code">'
                    + '</div><div class="col-md-6 col-xs-7 ticket-info-container vcenter">'
                    + '<p class="ticket-name">Attraction: <span>' + attr.name + '</span></p>'
                    + '<p>Price: <span>$' + price + '</span></p>'
                    + '<p>Category: <span>' + attr.category.name + '</span></p></div></div>'
                );
                $('#' + ticket.id).css('background-image', 'url(' + attr.image.substr(1) + ')');
            });
        });
    }
    else {
        $('#display').load(directory + "orders_empty.html");
    }
}

function printTicket(e) {
    e.stopPropagation();
    $(this).parent().parent().parent().parent()
        .printElement(
            {
                overrideElementCSS:[
                    'main.css',
                    { href:'css/main.css', media:'print'}]
            });
}