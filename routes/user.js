"use strict";
var util = require('util');
var api = require('../api').user;
var debug = require('debug')('routes:user');
var APIError = require('../lib').APIError;

var user = {};

user.addnew = function(req, res, next) {
	if(!req || !req.body) {
		return next(new APIError(400, 'Invalid Request', 'RT_UA_4000'));
	}
	api.add(req.body, function(err, result) {
		if(err && err.message.indexOf('ER_DUP_ENTRY') !== -1) {
			return next(new APIError(400, 'User name already present. try different name', 'RT_UA_4000'))
		}
		if(err) {
			debug(err);
			return next(err || new APIError(403, 'error in creating new user', 'RT_TA_4001'));
		}
		req.result = result;
		return next();
	});
};

user.listing = function(req, res, next) {
	api.listing({}, function(err, result) {
		if(err) {
			debug(err);
			return next(err || new APIError(403, 'error in fetching user.. please try again later', 'RT_UL_4000'));
		}
		req.result = result;
		return next();
	});
};

user.get = function(req, res, next) {
	if(!req || !req.body) {
		return next(new APIError(400, 'Invalid Request', 'RT_UG_4000'));
	}
	var options = {
		email: req.body.email
	};
	if(!options.email) {
		return next(new APIError(403, 'please enter email address', 'RT_UG_4001'));
	}
	api.get(options, function(err, result) {
		if(err) {
			debug(err);
			return next(err || new APIError(403, 'error in fetching user. please try again later.', 'RT_UG_4002'));
		}
		req.result = result;
		return next();
	});
};

user.loginVerify = function(req, res, next) {
	if(req.body.password !== req.result.password) {
		return next(new APIError(401, 'Please Enter Right Password.','RT_ULV_4000'));
	}
	return next();
};

user.verify = function(req, res, next) {
	if(!req.session || !req.session.user || !req.session.user.loggedIn) {
		return next(new APIError(401, 'please login again to continue.', 'RT_UV_4000'));
	}
	return next();
};

user.buildSession = function(req, res, next) {
	req.session.user = {
		name: req.result.name,
		email: req.result.email,
		id: req.result.id,
		type: req.result.type,
		loggedIn: true
	};
	return next();
};

user.destroySession = function(req, res, next) {
	delete req.session.user;
	return next();
};

user.listResponse = function(req, res, next) {
	var response = {},
		result = req.result
	result.forEach(function(res) {
		var _response = {};
		['id', 'email', 'name'].forEach(function(e) {
			if(res && res[e] !== undefined) {
				_response[e] = res[e];
			}
		});
		response[_response.id] = _response;
	});
	res.json(response);
};

user.getSession = function(req, res, next) {
	res.json(req.session && req.session.user);
};

user.isAdmin = function(req, res, next) {
	if(!req.session || !req.session.user || !req.session.user.type) {
		return next(new APIError(411, 'you don\'t have permission ', 'RT_UV_4000'));
	}
	return next();
};

user.response = function(req, res, next) {
	var response = {};
	['id', 'name', 'email', 'type'].forEach(function(e){
		if(req.result && req.result[e] !== undefined) {
			response[e] = req.result[e];
		}
	});
	response.message = 'success';
	res.json(response);
};

module.exports = user;