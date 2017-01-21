$(onLoadFunction());
$(attractionsQuery());
$(categoriesQuery(loadCategories, 300));

$('#addCategory').on('click', setCategoryOnServer);

$('#addMaintenance').on('click', addMaintenance);

$('#addNewAttraction').on('click', addNewAttraction);

$('#maintenanceModal').on('show.bs.modal', function (event) {
    const item = $(event.relatedTarget)
        .parent().parent().parent().parent()
        .find('div:first-of-type').find('.attr-id');
    const name = item.val();
    $(this).find('#attrMtnID').val(name);
});

$('#removeCategory').on('click', function() {
    categoriesQuery(deleteCategoryOnServer);
    setTimeout(() => {
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

    }, 200);
});

$('body')
    .on('click', '.btn-change-attr', function() {
        changeAttractionInfo($(this));
    })

    .on('click', '.btn-delete-attr', function() {
        deleteAttraction($(this));
    });

function addMaintenance() {
    const access_token = localStorage.getItem('access_token');
    const authorization_string = '?access_token=' + access_token;
    $.postJSON(server + "api/attractions/main/" + authorization_string,{
        startdate: $('#startDate').val(),
        reason: $('#reason').val(),
        enddate: $('#endDate').val()
    }, (data) => {
        console.log('woohoo', data);
        setMaintenanceToAttraction(data.id, $('#attrMtnID').val());
    })
        .error((e) => errorRefreshFunction(e, addMaintenance));
}

function addNewAttraction() {
    const form = $('#newAttractionForm')[0];
    const fd = new FormData(form);
    const category = $('#inputCategoryNew option:selected').data('id');
    const access_token = localStorage.getItem('access_token');
    const authorization_string = '?access_token=' + access_token;
    if (category) {
        fd.append('cat', category);
    }
    $.ajax({
        url: server + "api/attractions" + authorization_string,
        data: fd,
        type: 'POST',
        contentType: false,
        processData: false,
        success: function(json) {
            console.log('woohoo', json);
            window.location = 'admin_attractions.html';
        },
        error: (e) => errorRefreshFunction(e, addNewAttraction)
    });
}

function categoriesQuery(callback, delay = 0) {
    $.get(server + "/api/attractions/cat", {}, (data) => setTimeout(() => callback(data), delay));
}

function changeAttractionInfo(element) {
    const form = element.parent().parent().parent();
    const fd = new FormData(form[0]);
    const id = form.find('.attr-id').val();
    const access_token = localStorage.getItem('access_token');
    const authorization_string = '?access_token=' + access_token;
    const category = form.find('.category-select option:selected').data('id');
    fd.append('cat', category);
    $.ajax({
        url: server + "api/attractions/" + id + authorization_string,
        data: fd,
        type: 'PUT',
        contentType: false,
        processData: false,
        success: function(json){
            console.log('woohoo', json);
            window.location = 'admin_attractions.html';
        },
        error: (e) => errorRefreshFunction(e, changeAttractionInfo, element)
    });
}

function deleteAttraction(element) {
    const form = element.parent().parent().parent();
    const id = form.find('.attr-id').val();
    const access_token = localStorage.getItem('access_token');
    const authorization_string = '?access_token=' + access_token;
    $.ajax({
        url: server + "api/attractions/" + id + authorization_string,
        type: 'DELETE',
        success: function(json){
            console.log('woohoo', json);
            window.location = 'admin_attractions.html';
        },
        error: (e) => errorRefreshFunction(e, deleteAttraction, element)
    });
}

function deleteCategoryOnServer(data) {
    const result = $.grep(data, (item) => item.name == $('#inputCategoryNew').find('option:checked').text());
    const access_token = localStorage.getItem('access_token');
    const authorization_string = '?access_token=' + access_token;
    $.ajax({
        url: server + "/api/attractions/cat/" + result[0].id + authorization_string,
        type: 'DELETE',
        success: function(json){
            console.log('woohoo');
        },
        error: (e) => errorRefreshFunction(e, deleteCategoryOnServer, data)
    });
}

function deleteMaintenance(element) {
    const mtnID = $(element).data('id');
    console.log(mtnID);
    const access_token = localStorage.getItem('access_token');
    const authorization_string = '?access_token=' + access_token;
    $.ajax({
        url: server + "/api/attractions/main/" + mtnID + authorization_string,
        type: 'DELETE',
        success: function(json){
            console.log('woohoo');
            window.location = 'admin_attractions.html'
        },
        error: (e) => errorRefreshFunction(e, deleteMaintenance, mtnID)
    });
}

function errorRefreshFunction(e, callback, el = 0, el2 = 0) {
    console.log(e);
    const errorStr = JSON.parse(e.responseText).error_description;
    const keep_flag = !(localStorage.getItem('keep_flag') === 'false');
    if (errorStr.includes('Access token expired')) {
        (keep_flag) ? refreshToken() : logoutFunction();
    }
    callback(el, el2);
}

function loadCategories(data) {
    data.forEach((category, i) => {
        $('select').each((i, item) => {
            const itemChecked = ($(item).data('cur-id') == category.id) ? ' selected="selected"' : '';
            const catID = (category.id) ? category.id : false;
            $(item).append('<option' + itemChecked + ' data-id="' + catID + '">' + category.name + '</option>');
        })
    });
}

function loadAttractions(data) {
    data.forEach((attraction, i) => {
        const catID = (attraction.category) ? attraction.category.id : false;
        let maintenanceString = '';
        if (attraction.maintenance) {
            maintenanceString = '<label class="radio-inline"><input type="radio" name="inputRadio2" '
            + 'value="off" data-toggle="modal" data-target="#maintenanceModal" checked> On maintenance</label>'
            + '<label class="radio-inline"><input type="radio" data-id="'
            + attraction.maintenance.id + '" onclick="deleteMaintenance(this);"'
            + ' name="inputRadio2" value="on"> Already works</label>'
        } else {
            maintenanceString = '<label class="radio-inline"><input type="radio" name="inputRadio2" '
        + 'value="off" data-toggle="modal" data-target="#maintenanceModal"> On maintenance</label>'
        + '<label class="radio-inline"><input type="radio" name="inputRadio2" value="on" checked> Already works</label>'
        }
        const mtnID = (attraction.maintenance) ? ' data-id="' + attraction.maintenance.id + '"' : '';
        $('#accordion').append('<div class="panel panel-default">'
            + '<div class="panel-heading" role="tab" id="heading' + i + '">'
            + '<h4 class="panel-title">'
            + '<a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse' + i + '"'                   + ' aria-expanded="false" aria-controls="collapseTwo">' + attraction.name + '</a></h4></div>'
            + '<div id="collapse' + i + '" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading' + i + '">'
            + '<div class="panel-body"><form class="form-horizontal"><div class="form-group">'
            + '<label class="col-md-3 col-xs-3 control-label">ID</label><div class="col-md-7 col-xs-9">'
            + '<input class="form-control attr-id" name="id" value="' + attraction.id + '" disabled></div></div>'
            + '<div class="form-group"><label class="col-md-3 col-xs-3 control-label">Name</label>'
            + '<div class="col-md-7 col-xs-9"><input class="form-control" placeholder="Name" name="name" value="'
            + attraction.name + '"></div></div><div class="form-group"><label class="col-md-3 col-xs-3 '
            + 'control-label">Description</label><div class="col-md-7 col-xs-9"><textarea class="form-control" rows="3" '
            + 'name="description" placeholder="Description">' + attraction.description + '</textarea></div></div>'
            + '<div class="form-group"><label class="col-md-3 col-xs-3 control-label">Category</label>'
            + '<div class="col-md-7 col-xs-9"><select class="form-control category-select" data-cur-id="'
            + catID + '"><option data-id="false">Not indicated</option></select></div></div><div '
            + 'class="form-group"><label class="col-md-3 col-xs-3 control-label">Price, $</label><div class="col-md-7 col-xs-9">'
            + '<input type="number" class="form-control" placeholder="Price" name="price" value="' + attraction.price + '">'
            + '</div></div><div class="form-group"><label class="col-md-3 col-xs-3 control-label">Maintenance</label>'
            + '<div class="col-md-7 col-xs-9 text-left">' + maintenanceString
            + '</div></div><div class="form-group"><label class="col-md-3 col-xs-3 control-label">New image</label>'
            + '<div class="col-md-7 col-xs-9 image-input"><input type="file" name="image"></div></div><div class="form-group">'
            + '<div class="col-md-offset-3 col-md-5 col-xs-12"><button type="button" class="btn btn-block '
            + 'btn-primary btn-change-attr">Change</button></div><div class="col-md-2 tablet-no-display"><button type="button" '
            + 'class="btn btn-block btn-danger btn-delete-attr">Delete</button></div></div></form></div></div></div>')
    })
}

function setCategoryOnServer() {
    const form = $('#newCategoryForm');
    const access_token = localStorage.getItem('access_token');
    const name = form.find('input[name=name]').val();
    const age = form.find('input[name=minAge]').val();
    const height = form.find('input[name=minHeight]').val();
    const authorization_string = '?access_token=' + access_token;
    $.postJSON(server + "api/attractions/cat" + authorization_string,{
        name: name,
        minAge: age,
        minHeight: height
    }, (data) => {
        console.log('woohoo', data);
        setCategoryInDOM(data);
    })
        .error((e) => errorRefreshFunction(e, setCategoryOnServer));
}

function setCategoryInDOM(category) {
    const selects = $('select');
    const name = category.name;
    const id = category.id;
    selects.each(function (item) {
        $(this)
            .find('option:last-of-type')
            .after('<option data-id="' + id + '">' + name + '</option>');
    });
}

function setMaintenanceToAttraction(mtnID, attrID) {
    const fd = new FormData();
    const access_token = localStorage.getItem('access_token');
    const authorization_string = '?access_token=' + access_token;
    fd.append('maintenanceid', mtnID);
    $.ajax({
        url: server + "api/attractions/" + attrID + authorization_string,
        data: fd,
        type: 'PUT',
        contentType: false,
        processData: false,
        success: function(json){
            console.log('woohoo', json);
            window.location = 'admin_attractions.html';
        },
        error: (e) => errorRefreshFunction(e, setMaintenanceToAttraction, mtnID, attrID)
    });
}