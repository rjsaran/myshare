'use strict';

var util = require('util');
var env = process.env.NODE_ENV || 'development';

var error = function(err, req, res, next) {
	var code = err.status || 500;
	var response = {
		code: code,
		error: err.message,
		title: err.title || 'Error',
		errorCode: err.errorCode,
		data: err.data
	};
	if(env === 'development') {
		response.stack = err.stack.split('\n');
	}
	util.log(util.format('%s %s %s', req.originalUrl, err.message, code));
	res.status(code).json(response);
};

module.exports = error;
