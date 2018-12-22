var fs = require('fs');
var path = require('path');

function static(request,response) {

    var filePath = './website/' + request.url;
    var extname = String(path.extname(filePath)).toLowerCase();

    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };

    var contentType = mimeTypes[extname] || 'application/octet-stream';

    filePath = path.resolve(__dirname, filePath);
    console.log('file ', filePath);

    fs.readFile(filePath, function (error, content) {
        console.log("2");
        if (error) {
            if (error.code == 'ENOENT') {
                fs.readFile(__dirname + '/404.html', function (error, content) {
                    response.writeHead(404, {'Content-Type': 'text/html'});
                    response.end(content);
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
                response.end();
            }
        }
        else {
            response.writeHead(200, {'Content-Type': contentType});
            response.end(content, 'utf-8');
        }
    });
    console.log("3");
}
exports.static = static;