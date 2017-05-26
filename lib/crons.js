'use strict';
const Promisie = require('promisie');
const CronJob = require('cron').CronJob;
const path = require('path');
const fs = require('fs-extra');
const crypto = require('crypto');
const async = require('async');
const usecroncheckfile = path.resolve(__dirname, '../../../content/files/croncheck.json');
const cronPath = path.resolve(__dirname, '../../../content/files/crons');
const cronMap = {};

var CoreController,
	mongoose,
	Cron,
	logger,
	pemfile,
	periodic,
	cloudUploads,
	downloadCron,
	appenvironment,
	appSettings,
	validateTheme;

var createCronJob = function (cronData) {
	let assetData = cronData.asset;
	let modulePath = path.join(cronPath, assetData.attributes.periodicFilename);
	let fn = require(modulePath).script(periodic).bind(null, Object.assign({},cronData.runtime_options));
	let task = new CronJob({
		cronTime: cronData.cron_interval,
		onTick: fn,
		onComplete: function () {},
		start: false
	});
	return task;
};

var findCronsForInitialization = function (crons, cb) {
	if (crons) {
		cb(null, crons);
	}
	else {
		CoreController.searchModel({
			model: Cron,
			query: (typeof validateTheme === 'string') ? {
				$and: [{
					active: true
				}, {
					theme: validateTheme
				}]
			} : {
				active: true
			},
			limit: 100,
			population: 'asset'
		}, cb);
	}
};

var downloadRemoteFiles = function (crons) {
	return new Promise((resolve, reject) => {
		Promisie.promisify(fs.ensureDir)(cronPath)
			.then(() => {
				try {
					let remoteFiles = crons.filter(cron => cron.asset.locationtype !== 'local');
					if (remoteFiles.length) {
						async.eachLimit(remoteFiles.map(cron => cron.asset), 5, function (asset, eachcb) {
							let writeStream = fs.createWriteStream(path.join(cronPath, asset.attributes.periodicFilename));
							writeStream.on('finish', function () {
								eachcb(null, 'finished');
							});
							downloadCron({
								url: asset.fileurl,
								algorithm: asset.attributes.client_encryption_algo,
								writeStream: writeStream
							}, function (err) {
								if (err) {
									console.log(err);
									eachcb(err);
								}
							});
						}, function (err) {
							if (err) {
								reject(err);
							}
							else {
								resolve(crons);
							}
						});
					}
					else {
						resolve(crons);
					}
				}
				catch (e) {
					reject(e);
				}
			}, reject);
	});
};

var initializeCrons = function (crons, cb) {
	try {
		Promisie.promisify(findCronsForInitialization)(crons)
			.then(crons => downloadRemoteFiles(crons))
			.then(crons => {
				let loaderAsync = Promisie.promisify(async.eachSeries),
					result = [];
				return loaderAsync(crons, function (cron, eachcb) {
					let modulePath = path.join(cronPath, cron.asset.attributes.periodicFilename);
					Promisie.promisify(fs.stat)(modulePath)
						.then(() => {
							Promisie.promisify(fs.readFile)(modulePath, 'utf8')
								.then(file => {
									let signData = new Buffer(file.trim()).toString('base64');
									let sign = crypto.createSign('RSA-SHA256');
									sign.update(signData);
									let signature = sign.sign(pemfile, 'hex');
									if (signature === cron.asset_signature) {
										result.push(cron);
										eachcb(null, 'success');
									}
									else {
										logger.warn(`Asset ${ cron.name } is unsigned and will not be loaded`);
										result.push(false);
										eachcb(null, 'failed');
									}
								});
						}, e => {
							logger.warn(`Asset ${ cron.name } could not be found and will not be loaded`, e);
							result.push(false);
							eachcb(null, 'failed');
						});
				}).then(() => result, () => false);
			})
			.then(crons => {
				if (Array.isArray(crons)) {
					crons.forEach(cron => {
						if (cron && cron.active) {
							let task = createCronJob(cron);
							task.start();
							cronMap[cron._id] = {
								task: task,
								cron: cron
							};
						}
					});
				}
				if (typeof cb === 'function') {
					cb(null, crons);
				}
			})
			.catch(e => {
				logger.warn('Error starting crons', e);
				if (typeof cb === 'function') {
					cb(e);
				}
			});
	}
	catch (e) {
		logger.warn('Error starting crons', e);
		if (typeof cb === 'function') {
			cb(e);
		}
	}
};

var findCronDiff = function (map, cb) {
	let currentCrons = Object.keys(map);
	let query = {
		$and: [{
			active: true
		}, {
			_id: { $nin: currentCrons }
		}]
	};
	if (typeof validateTheme === 'string') {
		query.$and.push({
			theme: validateTheme
		});
	}
	CoreController.searchModelPromisified({
		model: Cron,
		query: query,
		limit: 50,
		population: 'asset'
	})
		.then(crons => {
			cb(null, crons);
		})
		.catch(cb);
};

var digestCrons = function (modified, cb) {
	try {
		let skipDigest;
		if (periodic.app.controller.extension.cron_service.settings.cron_check_file_enabled) { 
			logger.silly('Updating crons');
			Promisie.promisify(findCronDiff)(cronMap)	
				.then(crons => {
					if (!skipDigest) {
						return Promisie.promisify(initializeCrons)(crons);
					}
					else {
						return false;
					}
				})
				.then(() => {
					if (!skipDigest) {
						if (Array.isArray(modified) && modified.length) {
							modified.forEach(cron => {
								if (cron.status === false && cronMap[cron.id]) {
									cronMap[cron.id].task.stop();
									cronMap[cron.id] = null;
									delete cronMap[cron.id];
								}
							});
						}
						cb(null, 'Crons updated');
					}
				})
				.catch(e => {
					cb(e);
				});
		}
		else {
			cb(null, 'No croncheck file skipping initialization');
		}
	}
	catch (e) {
		 cb(e);
	}
};

var useCronTasks = function () {
	try {
		if (periodic.app.controller.extension.cron_service.settings.cron_check_file_enabled) {			
			logger.silly('Initialzing crons');
			initializeCrons(null, function (err) {
				if (err) {
					logger.error('Could not start crons', err);
				}
				else {
					logger.silly('Crons initialized');
				}
			});
		}
		else {
			logger.silly('Not initialzing crons');
		}
	}
	catch (e) {
		logger.warn('Error calling useCronTasks', e);
	}
};

var getCronMap = function(){
	return cronMap;
};

var initialize = function (resources) {
	periodic = resources;
	CoreController = resources.core.controller;
	pemfile = fs.readFileSync(resources.app.controller.extension.cron_service.settings.pemfile_path, 'utf8');
	appSettings = resources.settings;
	validateTheme = (resources.app.controller.extension.cron_service.settings.validate_theme === true) ? appSettings.theme : false;
	logger = resources.logger;
	mongoose = resources.mongoose;
	Cron = mongoose.model('Cron');
	cloudUploads = resources.app.controller.extension.cloudupload.cloudupload;
	downloadCron = Promisie.promisify(cloudUploads.decryptHTTPStream);
	appenvironment = appSettings.application.environment;
	useCronTasks();
	return {
		getCronMap: getCronMap,
		digest: digestCrons,
		useCronTasks: useCronTasks,
		findCronDiff: findCronDiff,
		initializeCrons: initializeCrons,
		findCronsForInitialization: findCronsForInitialization,
		createCronJob: createCronJob,
		downloadRemoteFiles: downloadRemoteFiles
	};
};

module.exports = initialize;