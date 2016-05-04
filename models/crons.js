'use strict';
const mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ObjectId = Schema.ObjectId;

const cronSchema = new Schema({
	id: ObjectId,
	title: String,
	name: {
		type: String,
		unique: true
	},
	createdat: {
		type: Date,
		default: new Date()
	},
	updatedat: {
		type: Date,
		default: new Date()
	},
	author: String,
	content: String,
	asset: {
		type: ObjectId,
		ref: 'Asset',
		required: true
	},
	asset_signature: {
		type: String,
		required: true
	},
	cron_interval: {
		type: String,
		required: true
	},
	active: {
		type: Boolean,
		default: false
	},
	entitytype: {
		type: String,
		'default': 'cron'
	},
	attributes: Schema.Types.Mixed,
	contenttypeattributes: Schema.Types.Mixed,
	extensionattributes: Schema.Types.Mixed,
	random: Number
});

module.exports = cronSchema;