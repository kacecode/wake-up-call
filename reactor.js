var http = require("http"),
    request = require('request'),
    redis = require("redis");

var PORT = process.env.WUC_PORT || 9000,
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
    if (!body) {
      response.writeHead(400, {'Content-Type': 'text/plain'})
      response.end('No body\n');
      return
    }
    var key = now();
    client.set(key, body);
    try {
      createCb(key, body);
    } catch (e) {
      console.log(e);
      response.writeHead(400, {'Content-Type': 'text/plain'})
      response.end("Bad JSON\n");
      return;
    }
    response.writeHead(201);
    response.end();
  });
}).listen(PORT);

console.log("Now hosting on 0.0.0.0:" + PORT + "...");

function finish (data, key) {
  delete(data.datetime);
  console.log(data.host + ':' + data.port + data.path)
  var req = request.get(data.full_path, function (err) {
    if (err) {
      console.log('This is why we can\'t have nice things.');
      console.log(data);
      console.log(err);
    }
    client.del(key);
  });
}

function createCb (key, json) {
  if (!json) {
    console.log("ERROR")
    console.log("Created at ", key);
    console.log("JSON", json)
    return
  }
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
