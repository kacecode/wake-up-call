var http = require("http"),
    redis = require("redis"),
    client = redis.createClient();


client.on("ready", function () {
  client.del('1429844494791');
  client.keys('*', function (err, reply) {
    reply.forEach(function (key) {
      client.get(key, function (err, reply) {
        if (err) {
          return;
        }
        createCb(key, reply);
      })
    })
  });
})


var server = http.createServer(function (request, response) {
  var body = '';
  request.on('data', function (data) {
    body += data;
  });

  request.on('end', function () {
    var key = now();
    client.set(key, body);
    createCb(key, body);
    response.writeHead(201);
    response.end();
  });
}).listen("9000");

console.log("Now hosting...");

function finish (data, key) {
  delete(data.datetime);
  http.request(data, function () {
    client.del(key);
  }).end();
}

function createCb (key, json) {
  var data = JSON.parse(json);
  var time = calculateTime(data.datetime);
  var done = finish.bind(undefined, data, key);
  if (time > 0) {
    setTimeout(done, time);
  }
  else (done())
}

function now () {
  return (new Date()).getTime();
}

function calculateTime (time) {
  return (parseInt(time) - now());
}
