var fs = require('fs')
  , util = require('util')
  , stream = require('stream')
  , es = require('event-stream')
  , http = require('http')
  , logParser = require('./logParser')
  , resultWriterFactory = require('./resultWriter');

function start(file, output, host, throttle, skip, includeStatic) {
  var resultWriter = resultWriterFactory.create(output);

  var requestCount = 0;
  var lastTime = null;
  var skipCount = skip;

  var stream = fs.createReadStream(file)
    .pipe(es.split())
    .pipe(es.through(function(line) {
      var stream = this;
      stream.pause();

      if (skipCount > 0) {
        skipCount--;
        return stream.resume();
      } 

      var log = logParser.parseLine(line, includeStatic);

      if (!log) {
        return stream.resume();
      }

      var delay = (log.requestTime.getTime() - (lastTime || log.requestTime.getTime())) / throttle;

      lastTime = log.requestTime.getTime();
      requestCount++;

      print('running request num: %s, applying delay %d', requestCount, delay);

      var wrapper = delay > 0 ? setTimeout : immediate;

      wrapper(function() {
        doRequest(log, host, function(err, result) {
          if (err) {
            return resultWriter.write('error' + err);
          }

          log.result = result;
          resultWriter.writeLog(log);
        });  
        stream.resume();
      }, delay);
    })
    .on('error', function(e){
        print('Error while reading file.', e);
        stream.resume();
    })
    .on('end', function(){
        print('Done. Executed %s requests', requestCount);
    })
  );
}

function doRequest(item, host, cb) {
  var startTime = new Date();
  print('-> %s', item.requestPath);

  var req = http.request({
    host: host,
    path: item.requestPath,
    port: item.requestPort
  }, function(response){
    cb(null, {
      status: response.statusCode,
      timeTaken: new Date().getTime() - startTime.getTime()
    });
  });

  req.on('error', function(err) {
    cb(err);
  });

  req.shouldKeepAlive = false;
  req.end();
}

function print() {
  console.log.call(console, ['[', new Date().toLocaleTimeString(), '] ', util.format.apply(util, arguments)].join(''));
}

function immediate(cb) { return cb(); }

module.exports = {
  start
};
