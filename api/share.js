'use strict';

var util = require('util');
var model = require('../model').share;
var moment = require('moment');
var constants = require('../model').constants;
var APIError = require('../lib').APIError;

var share = {};

share.get = function(input, cb) {
	var options = {
		filters: {}
	};
	['id', 'user_id', 'status'].forEach(function(e) {
		if(input[e] !== undefined && !isNaN(Number(input[e]))) { 
			options.filters[e] = Number(input[e]); 
		}
	});
	var month = input.month && Number(input.month) || moment().month();
	
	var from = moment().startOf('year').add(month, 'month').toDate(); 
	var to = moment().startOf('year').add(month + 1, 'month').subtract(1, 'second').toDate();
	
	options.filters.created_at = {
		'operator': 'between',
		'to': to,
		'from': from
	};
	
	if(input.summary) {
		options.sum = input.summary;
	}
	model.listing(options, function(err, result) {
		if(err) { return cb(err); }
		if(!result || !result.length) {
			return cb(new APIError(450, 'No Entry Found...', 'API_SG_4001'));
		}
		result.forEach(function(r) {
			r.created_at = moment(r.created_at).format('DD-MMM-YYYY HH:MM');
		})
		cb(null, result);
	});
};

share.insert = function(input, cb) {
	var mandatoryFields = ['description', 'user_id', 'amount'];
	var options = {};
	var err;
	['user_id', 'amount', 'status'].forEach(function(e) {
		if(input[e] !== undefined && !isNaN(Number(input[e]))) { 
			options[e] = Number(input[e]); 
		}
	});
	['description'].forEach(function(e) {
		if(input[e] !== undefined) { 
			options[e] = input[e]; 
		}
	});
	mandatoryFields.forEach(function(m) {
		if(!options[m]) {
			err = new APIError(409, m + ' is mandatory field', 'API_SI_4001');
		}
	});
	if(err) { return cb(err); }
	model.insert(options, function(err, result) {
		if(err) {return cb(err); }
		options.id = result && result.insertId;
		return cb(null, options);
	});
};

share.update = function(input, cb) {
	var mandatoryFields = ['id'];
	var options = {};
	var err;
	['user_id', 'amount', 'status'].forEach(function(e) {
		if(input[e] !== undefined && !isNaN(Number(input[e]))) {
			options[e] = Number(input[e]); 
		}
	});
	['description'].forEach(function(e) {
		if(input[e] !== undefined) { 
			options[e] = input[e]; 
		}
	});
	if(!Object.keys(options) || !Object.keys(options).length) {
		return cb(new APIError(409, ' nothing to update', 'API_SU_4000'));
	}
	if(input.id) {
		if(util.isArray(input.id)) {
			options.id = input.id.map(Number);
		} else {
			options.id = Number(input.id);
		}
	}
	mandatoryFields.forEach(function(m) {
		if(!options[m]) {
			err= new APIError(409, m + ' is mandatory field', 'API_SU_4001');
		}
	});
	if(err) {return cb(err); }
	model.update(options, cb);
};

module.exports = share;