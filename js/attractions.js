$(onLoadFunction());
$(attractionsQuery());

// $('#addNewAttraction').on('click', () => {
//     const fd = new FormData(document.getElementById("newAttractionForm"));
//     const authorization_string = 'Bearer ' + access_token;
//     $.ajax({
//         url: server + "api/attractions?access_token=" + access_token,
//         // headers: {
//         //     'Accept': 'application/json'
//         // },
//         type: 'POST',
//         cache: false,
//         contentType: false,
//         processData: false,
//         data: fd,
//         success: function(json){
//             console.log(json);
//         }
//     });
// });

$('#maintenanceModal').on('show.bs.modal', function (event) {
    const item = $(event.relatedTarget)
        .parent().parent().parent().parent()
        .find('div:first-of-type').find('.attr-id');
    const name = (item.length) ? item.attr('placeholder') : 'New attraction';
    $(this).find('.attr-id-rdy').attr('placeholder', name);
});

$('#addCategory').on('click', () => {
    const selects = $('select');
    const category = $('#newCategoryName').val();
    console.log(category);
    selects.each(function (item) {
        $(this)
            .find('option:last-of-type')
            .after('<option>'+category+'</option>');
    });
});

$('#removeCategory').on('click', function() {
    const currentOption = $(this)
        .parent().parent()
        .find('select').find('option:checked');
    const optionText = currentOption.text();
    const selects = $('select');
    selects.each(function (item) {
        const options = $(this).find('option');
        options.each(function (option) {
            if ($(this).text() == optionText) {
                $(this).remove();
            }
        });
    });
});

function loadAttractions(data) {
    data.forEach((attraction, i) => {
        $('#accordion').append('<div class="panel panel-default">'
            + '<div class="panel-heading" role="tab" id="heading' + i + '">'
            + '<h4 class="panel-title">'
            + '<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse' + i + '"'                   + ' aria-expanded="false" aria-controls="collapseTwo">' + attraction.name + '</a></h4></div>'
            + '<div id="collapse' + i + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading' + i + '">'
            + '<div class="panel-body"><form class="form-horizontal"><div class="form-group">'
            + '<label class="col-md-3 col-xs-3 control-label"></label><div class="col-md-7 col-xs-9">'
            + '<input class="form-control attr-id" value="' + attraction.id + '" disabled></div></div>'
            + '<div class="form-group"><label class="col-md-3 col-xs-3 control-label">Name</label>'
            + '<div class="col-md-7 col-xs-9"><input class="form-control" placeholder="Name" value="' + attraction.name + '">'
            + '</div></div><div class="form-group"><label class="col-md-3 col-xs-3 control-label">Description</label>'
            + '<div class="col-md-7 col-xs-9"><textarea class="form-control" rows="3" placeholder="Description">'
            + attraction.description + '</textarea></div></div><div class="form-group">'
            + '<label class="col-md-3 col-xs-3 control-label">Category</label><div class="col-md-7 col-xs-9">'
            + '<select class="form-control"><option>Kids</option><option>Extreme</option><option>Hyper extreme</option>'
            + '<option>Over hyper extreme</option></select></div></div><div class="form-group">'
            + '<label class="col-md-3 col-xs-3 control-label">Price, $</label><div class="col-md-7 col-xs-9">'
            + '<input type="number" class="form-control" placeholder="Price" value="' + attraction.price + '">'
            + '</div></div><div class="form-group"><label class="col-md-3 col-xs-3 control-label">Maintenance</label>'
            + '<div class="col-md-7 col-xs-9 text-left"><label class="radio-inline"><input type="radio" name="inputRadio2" '
            + 'value="off" data-toggle="modal" data-target="#maintenanceModal"> On maintenance</label>'
            + '<label class="radio-inline"><input type="radio" name="inputRadio2" value="on" checked> Already works</label>'
            + '</div></div><div class="form-group"><label class="col-md-3 col-xs-3 control-label">New image</label>'
            + '<div class="col-md-7 col-xs-9 image-input"><input type="file"></div></div><div class="form-group">'
            + '<div class="col-md-offset-3 col-md-5 col-xs-12"><button type="submit" class="btn btn-block btn-primary">'
            + 'Change</button></div><div class="col-md-2 tablet-no-display"><button type="submit" '
            + 'class="btn btn-block btn-danger">Delete</button></div></div></form></div></div></div>')
    })
}