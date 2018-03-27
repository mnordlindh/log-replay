var fs = require('fs');
var staticFileEndings = ['.js','.jpg','.png','.gif','.woff','.css','.png'];

var isStaticFileRequest = function(logObj){
	if(logObj === undefined ) return true;
	if(logObj.requestPath === undefined) return true;

	for(var i = 0; i < staticFileEndings.length; i++) {
		var suffix = staticFileEndings[i];
		if(logObj.requestPath.length < suffix.length) continue;
		if(logObj.requestPath.indexOf(suffix, logObj.requestPath.length - suffix.length) !== -1) return true;
	}
  
	return false;
};

var getLogObject = function(str){
	return {
		raw: str,
		requestMethod: getRequestMethod(str),
		requestPath: getRequestPath(str),
		requestPort: getRequestPort(str),
		requestTime: getRequestTime(str),
		requestTimeTaken: getTimeTaken(str),
		responseStatus: getResponseStatus(str)
	};
};

var getRequestTime = function(str){
	return new Date(getLogPart(0, str) + ' ' + getLogPart(1, str));
};

var getRequestPath = function(str){
	var path = getLogPart(4, str);
	var query = getLogPart(5, str);
	if(query !== '-') path += '?' + query;

	return path;
};

var getResponseStatus = function(str){
	return getLogPart(11, str);
};

var getTimeTaken = function(str){
	return parseInt(getLogPart(14, str), 10);
};

var getRequestPort = function(str){
	return parseInt(getLogPart(6, str), 10);
};

var getRequestMethod = function(str){
	return getLogPart(3, str);
};

var getLogPart = function(part, str){
	return str.split(' ')[part];
};

var isValid = function(str){
	if(str.substr(0,1) === "#") return false;
	if(str.length < 20) return false;
	return true;
};

exports.parseLine = function(line, includeStaticFileEndings) {
	if (!isValid(line)) return false;
	var log = getLogObject(line);
	if (!includeStaticFileEndings && isStaticFileRequest(log)) return false;
	if (log.requestMethod !== 'GET') return false;

	return log;
};