$(function () {
    const url = window.location.href;
    console.log(url);
    const urlArr = url.split('=');
    const emailArr = urlArr[1].split('&');
    const email = emailArr[0];
    const activationID = urlArr[2];
    const queryString = '?mail=' + email + '&activateid=' + activationID;
    console.log(queryString);
    $.ajax({
        url: server + "api/accounts/activate" + queryString,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        data: {},
        type: 'GET',
        success: function(json){
            console.log('woohoo', json);
            window.location = 'index.html';
        },
        error: (e) => {
            console.log(e);
            window.history.replaceState('page', '', 'wrongactivationlink');
            window.location = 'index.html';
        }
    });
});