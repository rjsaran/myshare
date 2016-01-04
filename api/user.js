'use strict';

var util = require('util');
var hash = require('../lib').hash;
var model = require('../model').user;
var APIError = require('../lib').APIError;

var user = {};

user.get = function(input, cb) {
	var options = {
		filters: {}
	};
	['id'].forEach(function(e) {
		if(input[e] !== undefined && !isNaN(Number(input[e]))) { 
			options.filters[e] = Number(input[e]); 
		}
	});
	['name', 'email'].forEach(function(e) {
		if(input[e] !== undefined) { 
			options.filters[e] = input[e]; 
		}
	});
	model.listing(options, function(err, result) {
		if(err) { return cb(err); }
		if(!result || !result.length) {
			return cb(new APIError(450, 'No user found', 'API_UG_4001'));
		}
		if(result[0].password) {
			result[0].password = hash.decrypt(result[0].password);
		}
		cb(null, result[0]);
	});
};

user.listing = function(input, cb) {
	var options = {};
	['id'].forEach(function(e) {
		if(input[e] !== undefined && !isNaN(Number(input[e]))) { 
			options.filters[e] = Number(input[e]); 
		}
	});
	['name', 'email'].forEach(function(e) {
		if(input[e] !== undefined) { 
			options.filters[e] = input[e]; 
		}
	});
	model.listing(options, function(err, result) {
		if(err) { return cb(err); }
		if(!result || !result.length) {
			return cb(new APIError(450, 'No user details found', 'API_UL_4001'));
		}
		cb(null, result);
	});
};

user.add = function(input, cb) {
	var mandatoryFields = ['name', 'email', 'password'];
	var options = {};
	var err;
	['name', 'email', 'password'].forEach(function(e) {
		if(input[e] !== undefined) { 
			options[e] = input[e]; 
		}
	});
	mandatoryFields.forEach(function(m) {
		if(!options[m]) {
			err = new APIError(409, m + ' is mandatory field', 'API_UA_4001');
		}
	});
	if(options.password) {
		var originalPassword = options.password;
		options.password = hash.encrypt(options.password);
	}
	if(err) { return cb(err); }
	model.insert(options, function(err, result) {
		if(err) {return cb(err); }
		options.id = result && result.insertId;
		options.password = originalPassword;
		return cb(null, options);
	});
};

module.exports = user;