var http = require("http");

var server = http.createServer(function (request, response) {

  var body = '';
  request.on('data', function (data) {
    body += data;
  });

  request.on('end', function () {
    var data = JSON.parse(body);
    //console.log(body)

    var options = {
      host: data.host,
      path: data.path,
      port: data.port,
      method: data.method
    };

    setTimeout(function () {
      http.request(options,
        function () {
          console.log("callback complete");
        }).end();
    }, data.delay);

    response.writeHead(201);
    response.end();
  });
}).listen("9000");

console.log("Now hosting...");
