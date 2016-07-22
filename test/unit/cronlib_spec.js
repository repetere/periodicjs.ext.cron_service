'use strict';
const chai = require('chai'),
	expect = chai.expect,
	http = require('http'),
	Promisie = require('promisie'),
	fs = Promisie.promisifyAll(require('fs-extra')),
	path = require('path'),
	session = require('supertest-session'),
	CronJob = require('cron').CronJob,
	periodic = require(path.resolve(__dirname, '../../../../../app/lib/periodic.js')),
	testPort = 8998,
	bcrypt = require('bcrypt'),
	periodicLib = periodic({
		waitformongo: true,
		port: 8998,
		skip_install_check: true,
		env: 'test'
	});

var periodicjs,
	cronlib;

describe('Cron lib unit testing', function () {
			let request,
				ppsUser,
				server;
			before(function (done) {
				this.timeout(10000);
				() => {
					return new Promise(resolve => {
						setTimeout(function () {
							periodicLib.init({}, function (err, initialized) {
								if (err) {
									done(err);
								}
								else {
									periodicjs = initialized;
									cronlib = require(path.resolve(__dirname, '../../lib/crons'))(periodicjs.periodic);
									let periodicExpressApp = http.createServer(periodicjs.expressapp).listen(8998, function () {
										server = periodicExpressApp;
										resolve(session(periodicExpressApp));
									});
								}
							});
						}, 1000);
					});
				}().then(sessionEnabled => {
					request = sessionEnabled;
					let Account = periodicjs.periodic.mongoose.model('Account');
					let userPassword = 'Welcome15';
					let salt = bcrypt.genSaltSync(10);
					let hash = bcrypt.hashSync(userPassword, salt);
					return Promise.resolve(Account.remove({
							username: 'test-admin',
							email: 'test-admin@promisefin.com',
							accounttype: 'admin'
						}))
						.then(() => {
							return Promise.resolve(Account.create({
								username: 'test-admin',
								email: 'test-admin@promisefin.com',
								password: hash,
								accounttype: 'admin'
							}));
						})
						.then(user => {
							return user;
						}, e => {
							done(e);
						});
				}).then(user => {
					ppsUser = user;
					request
						.post('/auth/login')
						.send({
							username: user.username,
							password: 'Welcome15'
						})
						.end(done);
				});
			});
			after(function (done) {
				let Account = periodicjs.periodic.mongoose.model('Account');
				server.close();
				Account.remove({
					username: 'test-admin'
				}, done);
			});
			it('Should be able to run', function () {
				expect(true).to.be.true;
			});
			let activeCron;
			let cronIsActive,
				cronFilePath = path.resolve(__dirname, '../../../../files/croncheck.json');
			describe('findCronsForInitialization', function () {
				let findCronsForInitialization;
				before(function (done) {
					this.timeout(10000);
					findCronsForInitialization = cronlib.findCronsForInitialization;
					let Cron = periodicjs.periodic.mongoose.model('Cron');
					let makeRequest = function (cb) {
						request
							.post('/pps/api/v1/crons?format=json')
							.field('interval', '00 */2 * * * *')
							.attach('mediafiles', path.resolve(__dirname, '../../testfiles/test_cron_upload.js'))
							.end((err, res) => {
								console.log('res.body', res.body);
								expect(res.body).to.be.an('object');
								expect(res.body.result).to.equal('success');
								expect(res.body.data.crons).to.be.an('array');
								expect(res.body.data.crons.length).to.equal(1);
								activeCron = res.body.data.crons[0];
								Cron.findByIdAndUpdate(activeCron._id, {
									active: true
								}, cb);
							});
					};
					fs.statAsync(cronFilePath)
						.then(() => {
							cronIsActive = true;
							fs.removeAsync(cronFilePath)
								.then(() => {
									makeRequest(done);
								});
						}, e => {
							console.log('Croncheck does not exists', e);
							makeRequest(done);
						});
				});
				it('Should immediately callback with an array of crons if provided with an array', function (done) {
					findCronsForInitialization([activeCron], function (err, crons) {
						if (err) {
							done(err);
						}
						else {
							expect(crons).to.be.an('array');
							expect(crons.length).to.equal(1);
							done();
						}
					});
				});
				it('Should query for crons if not passed an crons as an argument', function (done) {
					findCronsForInitialization(null, function (err, crons) {
						if (err) {
							done(err);
						}
						else {
							expect(crons).to.be.an('array');
							expect(crons.length).to.be.ok;
							done();
						}
					});
				});
			});
			describe('findCronDiff', function () {
				let findCronDiff;
				it('Should return crons if there are no active crons', function (done) {
					findCronDiff = cronlib.findCronDiff;
					findCronDiff({}, function (err, crons) {
						if (err) {
							done(err);
						}
						expect(crons).to.be.an('array');
						expect(crons[0]._id.toString()).to.equal(activeCron._id);
						done();
					});
				});
				it('Should return crons less the active crons', function (done) {
					let map = {
						[activeCron._id]: activeCron
					};
					findCronDiff(map, function (err, crons) {
						if (err) {
							done(err);
						}
						expect(crons).to.be.an('array');
						expect(crons.filter(cron => cron._id === activeCron._id).length).to.equal(0);
						done();
					});
				});
			});
			describe('createCronJob', function () {
				let createCronJob;
				before(done => {
					this.timeout(10000);
					createCronJob = cronlib.createCronJob;
					let assetId = activeCron.asset;
					let Asset = periodicjs.periodic.mongoose.model('Asset');
					let downloadRemoteFiles = cronlib.downloadRemoteFiles;
					Promisie.promisify(Asset.findById, Asset)(assetId)
						.then(asset => {
							activeCron.asset = asset;
							return downloadRemoteFiles([activeCron]);
						})
						.then(() => {
							done();
						})
						.catch(done);
				});
				it('Should create a new cronjob when given cron data', function () {
					let newJob = createCronJob(activeCron);
					expect(newJob).to.be.an.instanceof(CronJob);
					expect(newJob).to.respondTo('start');
				});
			});
			describe('initializeCrons', function () {
				let initializeCrons;
				before(done => {
					initializeCrons = cronlib.initializeCrons;
					if (typeof activeCron.asset !== 'object' || !activeCron.asset._id) {
						let assetId = activeCron.asset;
						let Asset = periodicjs.periodic.mongoose.model('Asset');
						let downloadRemoteFiles = cronlib.downloadRemoteFiles;
						Promisie.promisify(Asset.findById, Asset)(assetId)
							.then(asset => {
								activeCron.asset = asset;
								return downloadRemoteFiles([activeCron]);
							})
							.then(() => {
								done();
							})
							.catch(done);
					}
					else {
						done();
					}
				});
				after(done => {
					(function () {
						return new Promise(resolve => {
							if (!activeCron) {
								resolve();
							}
							else {
								let cronId = activeCron._id;
								request
									.delete(`/p-admin/content/crons/${ cronId }`)
									.end(err => {
										done(err);
									});
							}
						});
					})().then(() => {
						if (cronIsActive) {
							fs.writeJsonAsync(cronFilePath, {
									usecron: true
								})
								.then(() => {
									done();
								}, e => {
									done(e);
								});
						}
						else {
							done();
						}
					});
				});
				it('Should start a cron if asset has a valid signature', function (done) {
					initializeCrons([activeCron], function (err, data) {
						if (err) {
							done(err);
						}
						else {
							expect(data).to.be.an('array');
							expect(data[0]).to.deep.equal(activeCron);
							done();
						}
					});
				});
				//Need to modifiy cloud file to test this section
				// it('Should not start a cron if asset does not have a valid signature', function (done) {
				//   let cronFilePath = path.resolve(__dirname, '../../../../files/crons', activeCron.title);
				//   console.log('cronFilePath', cronFilePath);
				//   fs.writeFileAsync(cronFilePath, '//some random comment')
				//     .then(() => {
				//       initializeCrons([activeCron], function (err, data) {
				//         if (err) {
				//           done(err);
				//         }
				//         else {
				//           console.log('last it block data', data);
				//           expect(data).to.be.an('array');
				//           expect(data[0]).to.be.false;
				//           done();
				//         }
				//       });
				//     }, function (err) {
				//       console.log('the append file error', err, err.stack);
				//       done(err);
				//     });
				// });
				//});
			});
