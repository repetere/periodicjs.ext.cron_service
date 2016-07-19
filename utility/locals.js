'use strict';
var path = require('path');
var fs = require('fs-extra');
var Errorie = require('errorie');
const cronSchema = require('../models/crons');

module.exports = function (periodic) {
	let appenvironment = periodic.settings.application.environment;
	let config = fs.readJsonSync(path.join(__dirname, '../../../content/config/extensions/periodicjs.ext.cron_service/settings.json'));
	let envconfig = config[appenvironment].settings;
	if (!envconfig.pemfile_path) {
		let application_client_side_pem_path = fs.readJsonSync(path.join(__dirname, '../../../content/config/config.json')).client_side_encryption_key_path;
		envconfig.pemfile_path = path.join(__dirname, '../../../', application_client_side_pem_path);
	}
	if (envconfig.validate_theme !== false) {
		envconfig.validate_theme = true;
	}
	config[appenvironment].settings = envconfig;
	periodic.app.controller.extension.cron_service = periodic.app.controller.extension.cron_service || {};
	periodic.app.controller.extension.cron_service.settings = envconfig;
	periodic.mongoose.model('Cron', cronSchema);
	periodic.app.locals.cron_util = require('../lib/cron_tables')(periodic);
	// periodic.app.controller.extension.cron_service.service = require('./controller/crons')(periodic);
	// periodic.app.use(`/${ periodic.app.locals.adminPath }/content`, periodic.app.controller.extension.cron_service.service.router);

	return periodic;
};
