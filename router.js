var storageData = null;
var static = require("./static").static;
var fs = require('fs');
var path = require('path');
var dirArr = [];
function router(request, response){
    switch(request.url){
        case "/api/save-data":
        {
            // get from browser
            var fileData = '';
            request.on("data", function(chunk){
                console.log(chunk);
                fileData += chunk.toString();
            });
            request.on("end", function(){
                var paintData = JSON.parse(fileData);
                var saveData = JSON.stringify(paintData.data);
                var adress =path.resolve("./paintData/", paintData.saveName);
                console.log(adress);
                fs.writeFile( adress,saveData,function (err) {
                    console.log(err);
                })

            });
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.end('OK');
        }
        break;
        case "/api/list-data":
        {
           fs.readdir(path.resolve("./paintData/"),function (error,files) {
               dirArr = JSON.stringify(files);
               console.log(dirArr);
               if (error){
                   console.log("error");
               }else {
                   response.writeHead(200, {'Content-Type': 'application/json'});
                   response.end(dirArr);
               }
           });
        }
        break;
        case "/api/load-data":
        {
            request.on("data",function (fileName) {
                fs.readFile(path.resolve("./paintData/" + fileName),
                    function(error,data){
                        var fileData = data;
                        if (error){
                            console.log("faken error")
                            response.writeHead(404, {'Content-Type': 'text/html'});
                            response.end();

                        }else {

                            console.log("file load")
                            response.writeHead(200, {'Content-Type': 'application/json'});
                            response.end(fileData);
                        }
                    });
            })
        }
        break;
    }
}
exports.router = router;