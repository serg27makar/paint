var http = require('http');

var static = require("./static").static;
var router = require('./router').router;

http.createServer(function (request, response) {
    console.log('request ', request.url);

    if(request.url.substr(0, 4) === '/api') {
        router(request, response);
    }else {
        static(request,response);
    }


}).listen(8080);