$(() => {
    $('.orders-container').each(function() {
        $(this).css('background-image', 'url(img/attr' + this.id.substr(6) + '.png)');
    });
    onLoadFunction();
    getUserOrders();
});

$('body')
    .on('click', '.print-button', function () {
        $(this).parent().parent().parent().parent()
            .printElement(
                {
                    overrideElementCSS:[
                        'main.css',
                        { href:'css/main.css', media:'print'}]
                });
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
    orders.forEach((order, ordercnt) => {
        $('#ordersPlace').append('<div><div class="order-outer"><header id="order' + ordercnt
            + '" class="order-header"><div class="col-md-6 col-xs-12 vcenter"><p class="order-info">Order date: '
            + order.orderdate + '</p><p class="order-info">Visit date: ' + order.visitdate + '</p></div>'
            + '<div class="col-md-5 vcenter text-right">'
            + '<button class="print-button"><span class="print-icon">'
            + '</span></button></div></header></div></div>');
        order.tickets.forEach((ticket, i) => {
            const attr = ticket.attraction;
            const price = parseFloat(attr.price).toFixed(2);
            $('#order' + ordercnt).after('<div id="' + ticket.id + '" class="orders-container container row">'
                + '<div class="col-md-5 col-xs-5 vcenter">'
                + '<img class="ticket-image" src="' + ticket.code + '" title="QR-Code" alt="QR-Code">'
                + '</div><div class="col-md-6 col-xs-7 ticket-info-container vcenter">'
                + '<p class="ticket-name">Attraction: <span>' + attr.name + '</span></p>'
                + '<p>Price: <span>$' + price + '</span></p>'
                + '<p>Category: <span>' + attr.category.name + '</span></p></div></div>'
            );
            $('#' + ticket.id).css('background-image', 'url(' + attr.image.substr(1) + ')');
        });
    });
}