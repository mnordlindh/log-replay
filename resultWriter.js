var fs = require('fs');

var create = function(filepath) {
  var separator = '\t';

  var appendFile = function(str) {
    fs.appendFile(filepath, str, function(err){
      if(err) console.log(err);
    });
  };

  var createRow = function(logItem) {
    var diff = logItem.requestTimeTaken - logItem.result.timeTaken;
    return [logItem.requestPath, logItem.responseStatus, logItem.requestTimeTaken, logItem.result.status, logItem.result.timeTaken, diff].join(separator) + '\r\n';
  };

  var clean = function () {
    fs.writeFileSync(filepath, '');
  };

  var write = function(str){
    appendFile(str);
  };

  var writeLog = function(logItem){
    appendFile(createRow(logItem));
  };

  return {
    clean,
    write,
    writeLog
  }
}

module.exports = {
  create
}