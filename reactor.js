var http = require("http"),
    redis = require("redis");

var PORT = process.env.WAKEUPCALL_PORT || 9000,
    REDIS_PORT = process.env.WUC_REDIS_PORT || 6379,
    REDIS_HOST = process.env.WUC_REDIS_HOST || '127.0.0.1',
    client = redis.createClient(REDIS_PORT, REDIS_HOST, {});

client.on("error", function (err) {
  console.error("Unable to connect to redis");
  console.error(err);
  process.exit(1);
});

client.on("ready", function () {
  client.keys('*', function (err, reply) {
    reply.forEach(function (key) {
      client.get(key, function (err, reply) {
        if (err) {
          return;
        }
        createCb(key, reply);
      });
    });
  });
});


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
}).listen(PORT);

console.log("Now hosting on 0.0.0.0:" + PORT + "...");

function finish (data, key) {
  delete(data.datetime);
  var req = http.request(data, function () {
    client.del(key);
  });
  req.on('error', function (error) {
    console.log('this is why we can\'t have nice things.');
    console.log(data);
    client.del(key);
    console.log(error);
  });
  req.end();
}

function createCb (key, json) {
  var data = JSON.parse(json);
  var time = calculateTime(new Date(data.datetime));
  var done = finish.bind(undefined, data, key);
  if (time > 0) {
    setTimeout(done, time);
  }
  else {
    done();
  }
}

function now () {
  return (new Date()).getTime();
}

function calculateTime (time) {
  return (time.getTime() - now());
}
