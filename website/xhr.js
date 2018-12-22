
function requestData(url, data, callback) {
    function reqListener() {
        var data = this.responseText;
        callback(data);
    }

    function reqError(err) {
        console.log('Fetch Error :-S', err);
    }

    var oReq = new XMLHttpRequest();
    oReq.onload = reqListener;
    oReq.onerror = reqError;
    oReq.open('post', url, true);
    oReq.send(data);
}
