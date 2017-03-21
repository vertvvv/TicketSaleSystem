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

$('#removeCategory').on('click', () => categoriesQuery(deleteCategoryOnServer));

$('body')
    .on('click', '.btn-change-attr', function () {
        changeAttractionInfo($(this));
    })

    .on('click', '.btn-delete-attr', function () {
        deleteAttraction($(this));
    });

function addMaintenance() {
    $.postJSON(server + "api/attractions/main/" + authorizationString(), {
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

    if (category) {
        fd.append('cat', category);
    }

    $.ajax({
        url: server + "api/attractions" + authorizationString(),
        data: fd,
        type: 'POST',
        contentType: false,
        processData: false,
        success: function (json) {
            console.log('woohoo', json);
            window.location = 'admin_attractions.html';
        },
        error: (e) => {
            const errorText = (JSON.parse(e.responseText).message)
                ? JSON.parse(e.responseText).message
                : JSON.parse(e.responseText).error_description;
            $('#error').html('')
                .append('<p class="font-semi-big">' + errorText + '</p>');
            errorRefreshFunction(e, addNewAttraction);
        }
    });
}

function categoriesQuery(callback, delay = 0) {
    $.get(server + "/api/attractions/cat", {}, (data) => setTimeout(() => callback(data), delay));
}

function changeAttractionInfo(element) {
    const form = element.parent().parent().parent();
    const fd = new FormData(form[0]);
    const id = form.find('.attr-id').val();
    const category = form.find('.category-select option:selected').data('id');
    fd.append('cat', category);

    $.ajax({
        url: server + "api/attractions/" + id + authorizationString(),
        data: fd,
        type: 'PUT',
        contentType: false,
        processData: false,
        success: function (json) {
            console.log('woohoo', json);
            window.location = 'admin_attractions.html';
        },
        error: (e) => errorRefreshFunction(e, changeAttractionInfo, element)
    });
}

function deleteAttraction(element) {
    const form = element.parent().parent().parent();
    const id = form.find('.attr-id').val();

    $.ajax({
        url: server + "api/attractions/" + id + authorizationString(),
        type: 'DELETE',
        success: function (json) {
            console.log('woohoo', json);
            window.location = 'admin_attractions.html';
        },
        error: (e) => errorRefreshFunction(e, deleteAttraction, element)
    });
}

function deleteCategoryFromList() {
    const currentOption = $('#inputCategoryNew').find('option:checked');
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

}

function deleteCategoryOnServer(data) {
    const result = $.grep(data, (item) => item.name == $('#inputCategoryNew').find('option:checked').text());

    if (result.length) {
        $.ajax({
            url: server + "/api/attractions/cat/" + result[0].id + authorizationString(),
            type: 'DELETE',
            success: function (json) {
                console.log('woohoo');
                $('#error').html('');
                deleteCategoryFromList();
            },
            error: (e) => errorRefreshFunction(e, deleteCategoryOnServer, data)
        });
    } else {
        $('#error').html('')
            .append('<p class="font-semi-big">That\'s not a category!</p>');
    }
}

function deleteMaintenance(element) {
    const mtnID = $(element).data('id');
    console.log(mtnID);
    $.ajax({
        url: server + "/api/attractions/main/" + mtnID + authorizationString(),
        type: 'DELETE',
        success: function (json) {
            console.log('woohoo');
            window.location = 'admin_attractions.html'
        },
        error: (e) => errorRefreshFunction(e, deleteMaintenance, mtnID)
    });
}

function loadCategories(data) {
    data.forEach((category, i) => {
        $('select').each((i, item) => {
            const itemChecked = ($(item).data('cur-id') == category.id) ? ' selected="selected"' : '';
            const catID = (category.id) ? category.id : false;
            $(item).append(`<option${itemChecked} data-id="${catID}">${category.name}</option>`);
        })
    });
}

function loadAttractions(data) {
    data.forEach((attraction, i) => {
        const catID = (attraction.category) ? attraction.category.id : false;
        let maintenanceString = '';

        if (attraction.maintenance) {
            maintenanceString = `<label class="radio-inline"><input type="radio" name="inputRadio2" 
                value="off" data-toggle="modal" data-target="#maintenanceModal" checked> On maintenance</label>
                <label class="radio-inline"><input type="radio" data-id="${attraction.maintenance.id}" 
                onclick="deleteMaintenance(this);" name="inputRadio2" value="on"> Already works</label>`;
        } else {
            maintenanceString = `<label class="radio-inline"><input type="radio" name="inputRadio2" 
                value="off" data-toggle="modal" data-target="#maintenanceModal"> On maintenance</label>
                <label class="radio-inline"><input type="radio" name="inputRadio2" value="on" checked> Already works</label>`;
        }
        const mtnID = (attraction.maintenance) ? ' data-id="' + attraction.maintenance.id + '"' : '';
        $('#accordion').append(
            `<div class="panel panel-default">
                <div class="panel-heading" role="tab" id="heading${i}">
                    <h4 class="panel-title"><a class="collapsed" role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse${i}" aria-expanded="false" aria-controls="collapseTwo">${attraction.name}</a></h4>
                </div>
                <div id="collapse${i}" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading${i}">
                    <div class="panel-body"><form class="form-horizontal">
                        <div class="form-group">
                            <label class="col-md-3 col-xs-3 control-label">ID</label>
                            <div class="col-md-7 col-xs-9">
                                <input class="form-control attr-id" name="id" value="${attraction.id}" disabled>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 col-xs-3 control-label">Name</label>
                            <div class="col-md-7 col-xs-9">
                                <input class="form-control" placeholder="Name" name="name" value="${attraction.name}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 col-xs-3 control-label">Description</label>
                            <div class="col-md-7 col-xs-9">
                                <textarea class="form-control" rows="3" name="description" placeholder="Description">${attraction.description}</textarea>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 col-xs-3 control-label">Category</label>
                            <div class="col-md-7 col-xs-9">
                                <select class="form-control category-select" data-cur-id="${catID}">
                                    <option data-id="false">Not indicated</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 col-xs-3 control-label">Price, $</label>
                            <div class="col-md-7 col-xs-9">
                                <input type="number" class="form-control" placeholder="Price" name="price" value="${attraction.price}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 col-xs-3 control-label">Maintenance</label>
                            <div class="col-md-7 col-xs-9 text-left">${maintenanceString}</div>
                        </div>
                        <div class="form-group">
                            <label class="col-md-3 col-xs-3 control-label">New image</label>
                            <div class="col-md-7 col-xs-9 image-input">
                                <input type="file" name="image">
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="col-md-offset-3 col-md-5 col-xs-12">
                                <button type="button" class="btn btn-block btn-primary btn-change-attr">Change</button>
                            </div>
                            <div class="col-md-2 tablet-no-display">
                                <button type="button" class="btn btn-block btn-danger btn-delete-attr">Delete</button>
                            </div>
                        </div>
                    </form></div>
                </div>
            </div>`
        );
    });
}

function setCategoryOnServer() {
    const form = $('#newCategoryForm');
    const name = form.find('input[name=name]').val();
    const age = form.find('input[name=minAge]').val();
    const height = form.find('input[name=minHeight]').val();

    $.postJSON(server + "api/attractions/cat" + authorizationString(), {
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
            .after(`<option data-id="${id}">${name}</option>`);
    });
}

function setMaintenanceToAttraction(mtnID, attrID) {
    const fd = new FormData();
    fd.append('maintenanceid', mtnID);

    $.ajax({
        url: server + "api/attractions/" + attrID + authorizationString(),
        data: fd,
        type: 'PUT',
        contentType: false,
        processData: false,
        success: function (json) {
            console.log('woohoo', json);
            window.location = 'admin_attractions.html';
        },
        error: (e) => errorRefreshFunction(e, setMaintenanceToAttraction, mtnID, attrID)
    });
}