'use strict';

var util = require('util');
var api = require('../api').share;
var userApi = require('../api/user');
var debug = require('debug')('routes:share');
var APIError = require('../lib').APIError;

var share = {};

share.get = function(req, res, next) {
	var options = {};
	if (req.query && Object.keys(req.query).length) options = req.query;
	api.get(options, function(err, result) {

		if(err) {
			debug(err);
			return next(err || new APIError(403, 'error in fetching shares', 'RT_SG_4001'));
		}

		result.forEach(function(res) {
			res.distribute_among = res.distribute_among.split(',').map(Number);
			res.owner = (res.user_id == req.session.user.id);
		});

		req.result = result;
		return next();
	});
};

share.summary = function(req, res, next) {
	var options = {};
	if (req.query && Object.keys(req.query).length) options = req.query;
	
	userApi.listing({}, function(err, userResult) {
		if(err) {
			return next(err);
		}
		var userIds = [];
		userResult.forEach(function(user) {
			userIds.push(user.id);
		})
		processNext(userIds);
	});
	
	function processNext(userIds) {
		api.get(options, function(err, result) {
			if(err) {
				debug(err);
				return next(err || new APIError(403, 'error in fetching summary', 'RT_SS_4001'));
			}
			var share_map = {},
				total = 0;
			userIds.forEach(function(uid) {
				share_map[uid] = {
					user_id: uid,
					sum: 0,
					balance: 0
				}
			});
			result.forEach(function(res) {
				total += res.amount;
			});
			result.forEach(function(res) {
				var distribute_among = res.distribute_among.split(',').map(Number);
				if(distribute_among.indexOf(Number(res.user_id)) === -1) {
					distribute_among.push(Number(res.user_id));
				}
				var count = distribute_among.length;
				var amount = Number(res.amount);
				var perPerson = Math.round(amount / count);
				share_map[res.user_id].sum += amount;
				distribute_among.forEach(function(uid) {
					if(userIds.indexOf(uid) > -1) {
						if(uid == res.user_id) {
							share_map[uid].balance += amount - perPerson;
						} else {
							share_map[uid].balance -= perPerson;
						}
					}
				});
			});
			result = [];
			for(var uid in share_map) {
				result.push(share_map[uid]);
			}
			var response = {
				total: total,
				data: result
			};
			req.result = response;
			return next();
		});
	}
};

share.insert = function(req, res, next) {
	if(!req || !req.body) {
		return next(new APIError(400, 'Invalid Request', 'RT_SI_4000'));
	}

	var input = req.body;

	input.user_id = req.session.user.id;
	var selectedUsers = input.selectedUsers || [];
	
	if(input.selectedUsers.indexOf(input.user_id) === -1) {
		input.selectedUsers.push(input.user_id);
	}

	input.distribute_among = selectedUsers.map(Number);
	
	api.insert(input, function(err, result) {
		if(err) {
			debug(err);
			return next(err || new APIError(403, 'error in creating share', 'RT_SI_4001'));
		}
		req.result = result;
		return next();
	});
};

share.update = function(req, res, next) {
	if(!req || !req.params) {
		return next(new APIError(400, 'Invalid Request', 'RT_TMD_4000'));
	}
	var input = req.body;
	input.id = req.params['id'];


	input.user_id = req.session.user.id;
	var selectedUsers = input.selectedUsers || [];
	
	if(input.selectedUsers.indexOf(input.user_id) === -1) {
		input.selectedUsers.push(input.user_id);
	}

	input.distribute_among = selectedUsers.map(Number);

	api.update(input, function(err, result) {
		if(err) {
			debug(err);
			return next(err || new APIError(403, 'error in updating share', 'RT_SU_4001'));
		}
		req.result = result;
		return next();
	});
};

share.del = function(req, res, next) {
	if(!req || !req.params) {
		return next(new APIError(400, 'Invalid Request', 'RT_TD_4000'));
	}
	var input = {
		id: req.params['id'],
		status: 0	
	};
	api.update(input, function(err, result) {
		if(err) {
			return next(err || new APIError(403, 'error in deleting share', 'RT_SD_4001'));
		}
		req.result = result;
		return next();
	});
};

share.hasPermission = function(req, res, next) {
	if(!req.body) {
		return next(new APIError(400, 'Invalid Request', 'RT_HP_4000'));
	}
	var user_id = req.session.user.id;

	var options = {
		id: req.body.id,
		status: 1
	};
	api.get(options, function(err, result) {
		if(err) {
			debug(err);
			return next(err || new APIError(403, 'error in fetching shares', 'RT_HP_4001'));
		}

		if(result[0].user_id != user_id) {
			return next(new APIError(400, 'You are not authorized to update this entry', 'RT_HP_4002'));
		}
		return next();
	});
}

share.response = function(req, res, next) {
	res.json(req.result);	
};

module.exports = share;