'use strict';
var inherits = require('util').inherits;
var dbConfig = require('../config').db;
var BaseModel = require('./base');

var schema = {
	name: 'user',
	columns: [
		'id',
		'name',
		'email',
		'type',
		'password',
		'created_at',
		'updated_at'
	]
};

inherits(User, BaseModel);

function User(schema, db) {
	BaseModel.call(this, schema, db);
}

module.exports = new User(schema, dbConfig);