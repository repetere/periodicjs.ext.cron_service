'use strict';
const path = require('path');
const Promisie = require('promisie');
const fs =  Promisie.promisifyAll(require('fs-extra'));
const Errorie = require('errorie');
const cronSchema = require('../models/crons');
const os = require('os');
let cron_check_file_enabled = false;
let appenvironment;
const set_cron_check_file = function () {
	try {
		let usecroncheckfile = path.resolve(__dirname, '../../../content/files/croncheck.json');
		console.log('usecroncheckfile', usecroncheckfile);
		cron_check_file_enabled = (fs.readJsonSync(usecroncheckfile)) ? true : false;
	}
	catch (e) {
		cron_check_file_enabled = false;
	}
};
const check_cluster_safe_check = function (periodic) {
	let cluster_safe = true;
	let config_file_path = path.resolve(__dirname, `../../../content/config/environment/${appenvironment}.json`);
	let config_settings;
	let original_config_settings;
	let cron_service_hostname_settings = periodic.app.controller.extension.cron_service.settings.disable_cluster_hostnames;
	let hostname_matched_filter = false;
	let hostname = os.hostname();

	if (cron_service_hostname_settings && Array.isArray(cron_service_hostname_settings) && cron_service_hostname_settings.length > 0) {
		cron_service_hostname_settings.forEach(hostname_filter => {
			if (hostname.search(new RegExp(hostname_filter, 'gi')) !== -1) {
				hostname_matched_filter = true;
			}
		});
	}

	fs.readJsonAsync(config_file_path)
		.then(config_file_path_json => {
			original_config_settings = Object.assign({},config_file_path_json);
			config_settings = Object.assign({},config_file_path_json);
			if (hostname_matched_filter && config_file_path_json.cluster_process) {
				config_settings.cluster_process = false;
				return fs.outputJsonAsync(config_file_path,config_settings, {spaces: 2});
			}
		})
		.then((outputJsonResult) => {
			if (hostname_matched_filter && original_config_settings.cluster_process) {
				periodic.logger.warn(`Cron Service cannot run in a clustered environemt, fixing content/config/environment/${appenvironment}.json and restarting Periodicjs`);
				periodic.core.utilities.restart_app({ callback: function () { } });
			}
			// else {
			// 	console.log('hostname',hostname,'hostname_matched_filter', hostname_matched_filter, 'config_settings.cluster_process', config_settings.cluster_process, 'do not restart app');
			// }
		})
		.catch(e => periodic.logger.error(e));
};

module.exports = function (periodic) {
	appenvironment = periodic.settings.application.environment;
	let config = fs.readJsonSync(path.join(__dirname, '../../../content/config/extensions/periodicjs.ext.cron_service/settings.json'));
	let envconfig = config[appenvironment].settings;
	if (!envconfig.pemfile_path) {
		let application_client_side_pem_path = fs.readJsonSync(path.join(__dirname, '../../../content/config/config.json')).client_side_encryption_key_path;
		envconfig.pemfile_path = path.join(__dirname, '../../../', application_client_side_pem_path);
	}
	if (envconfig.validate_theme !== false) {
		envconfig.validate_theme = true;
	}

	set_cron_check_file();

	config[appenvironment].settings = envconfig;
	periodic.app.controller.extension.cron_service = periodic.app.controller.extension.cron_service || {};
	periodic.app.controller.extension.cron_service.settings = envconfig;
	periodic.app.controller.extension.cron_service.settings.cron_check_file_enabled = cron_check_file_enabled;
	periodic.mongoose.model('Cron', cronSchema);
	periodic.app.locals.cron_util = require('../lib/cron_tables')(periodic);
	periodic.app.locals.theme_name = periodic.settings.theme;
	check_cluster_safe_check(periodic);
	periodic.app.locals.extension = Object.assign({},periodic.app.locals.extension,{
		cron_service: {
			settings: periodic.app.controller.extension.cron_service.settings
		}
	}); 

	return periodic;
};
