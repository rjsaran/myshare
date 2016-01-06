'use strict';
var inherits = require('util').inherits;
var dbConfig = require('../config').db;
var BaseModel = require('./base');

var schema = {
	name: 'share',
	columns: [
		'id',
		'description',
		'user_id',
		'amount',
		'status',
		'isAmongAll',
		'distribute_among',
		'created_at',
		'updated_at'
	]
};

inherits(Share, BaseModel);

function Share(schema, db) {
	BaseModel.call(this, schema, db);
}

module.exports = new Share(schema, dbConfig);