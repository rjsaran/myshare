'use strict';

var util = require('util');

var _error = function (httpStatus, message, errorCode, title) {
  this.status = httpStatus;
  this.message = message;
  this.errorCode = errorCode;
  this.title = title;
  this.toString = function () {
    return '' + this.message;
  };

  Error.captureStackTrace(this, _error);
};

util.inherits(_error, Error);

module.exports = _error;