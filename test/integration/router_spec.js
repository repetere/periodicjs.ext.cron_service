// 'use strict';
// const chai = require('chai'),
// 		expect = chai.expect,
// 		http = require('http'),
// 		Promisie = require('promisie'),
// 		fs = Promisie.promisifyAll(require('fs-extra')),
// 		path = require('path'),
// 		session = require('supertest-session'),
// 		periodic = require(path.resolve(__dirname, '../../../../../app/lib/periodic.js')),
// 		testPort = 8999,
// 		periodicLib = periodic({
// 				waitformongo: true,
// 				port: testPort,
// 				skip_install_check: true,
// 				env: 'test'
// 		}),
// 		bcrypt = require('bcrypt');
// var periodicjs;

// var customerMock = function () {
// 		return {
// 				"email": "test-customer@development.promisefinancial.co",
// 				"communication_preferences": {
// 						"marketing_emails_unsubscribe_flag": false
// 				},
// 				"identification": {
// 						"full_name": "Test Customer",
// 						"first_name": "Test",
// 						"last_name": "Customer",
// 						"middle_initial": "T",
// 						"citizenship": "Permanent Resident",
// 						"date_of_birth": new Date("1990-09-18T05:00:00.000Z"),
// 						"social_security_number": "999999999",
// 				},
// 				"latest_contact": {
// 						"address_street": "6544 GATEHOUSE LN",
// 						"address_city": "LAS VEGAS",
// 						"address_state": "NV",
// 						"address_postal_code": "89108-5355",
// 						"physical_address_street": null,
// 						"physical_address_city": null,
// 						"physical_address_state": null,
// 						"physical_address_postal_code": null,
// 						"email": "test-customer@development.promisefinancial.co",
// 						"phone_number_cell": null,
// 						"phone_number_primary": "5558394549",
// 						"phone_number_work": null,
// 						"how_did_you_hear_about_us": null,
// 						"how_did_you_hear_about_us_note": null,
// 						"creation_date": new Date("2016-01-19T21:19:55.368Z")
// 				},
// 				"user_account": {
// 						"status": "closed"
// 				}
// 		};
// };

// var webhookMock = function (to, from) {
// 		return {
// 				subject: 'Automated Test Communication',
// 				'body-plain': 'Hello World',
// 				To: to || 'Test Customer <test-customer@development.promisefinancial.co>',
// 				From: from || 'development-no-reply@promisefinancial.co',
// 				'Content-Type': 'multipart/form-data',
// 				'mime-version': '1.0'
// 		};
// };

// describe('Router methods for PPS Applications', function () {
// 		let request,
// 				ppsUser,
// 				server;
// 		before(function (done) {
// 				this.timeout(10000);
// 				() => {
// 						return new Promise((resolve, reject) => {
// 							setTimeout(function () {
// 								Promise.resolve(periodicLib.init({}))
// 									.then(initialized => {
// 										periodicjs = initialized;
// 										let periodicExpressApp = http.createServer(periodicjs.expressapp).listen(testPort, function () {
// 												server = periodicExpressApp;
// 												resolve(session(periodicExpressApp));
// 										});
// 									}, e => {
// 										reject(e);
// 									});
// 							}, 1000);
// 						});
// 				}().then(sessionEnabled => {
// 						request = sessionEnabled;
// 						let Account = periodicjs.periodic.mongoose.model('Account');
// 						let userPassword = 'Welcome15';
// 						let salt = bcrypt.genSaltSync(10);
// 						let hash = bcrypt.hashSync(userPassword, salt);
// 						return Promise.resolve(Account.remove({
// 										username: 'test-admin',
// 										email: 'test-admin@promisefin.com',
// 										accounttype: 'admin'
// 								}))
// 								.then(() => {
// 										return Promise.resolve(Account.create({
// 												username: 'test-admin',
// 												email: 'test-admin@promisefin.com',
// 												password: hash,
// 												accounttype: 'admin'
// 										}));
// 								})
// 								.then(user => {
// 										return user;
// 								}, e => {
// 										done(e);
// 								});
// 				}).then(user => {
// 						ppsUser = user;
// 						request
// 								.post('/auth/login')
// 								.send({
// 										username: user.username,
// 										password: 'Welcome15'
// 								})
// 								.end(done);
// 				});
// 		});
// 		after(function (done) {
// 				let Account = periodicjs.periodic.mongoose.model('Account');
// 				server.close();
// 				Account.remove({
// 						username: 'test-admin'
// 				}, done);
// 		});
// 		describe('Cron Router', function () {
// 				describe('POST /pps/api/v1/crons', function () {
// 						let cronIsActive,
// 								cronFilePath = path.resolve(__dirname, '../../../../files/croncheck.json'),
// 								cronToRemove;
// 						before(done => {
// 								fs.statAsync(cronFilePath)
// 										.then(() => {
// 												fs.remove(cronFilePath, function (e) {
// 														cronIsActive = true;
// 														done(e);
// 												});
// 										}, e => {
// 												console.log('Crons were not active pre-test', e);
// 												done();
// 										});
// 						});
// 						after(done => {
// 								let Cron = periodicjs.periodic.mongoose.model('Cron');
// 								let Asset = periodicjs.periodic.mongoose.model('Asset');
// 								(function () {
// 										return new Promise(resolve => {
// 												if (!cronToRemove) {
// 														resolve();
// 												} else {
// 														let filePath = path.resolve(__dirname, '../../../../files/crons', cronToRemove.title);
// 														let cronId = cronToRemove._id;
// 														let assetId = cronToRemove.asset;
// 														Promise.all([
// 																fs.removeAsync(filePath),
// 																Promise.resolve(Cron.remove({
// 																		_id: cronId
// 																})),
// 																Promise.resolve(Asset.remove({
// 																		_id: assetId
// 																}))
// 														]).then(() => {
// 																resolve();
// 														}).
// 														catch(e => {
// 																done(e);
// 														});
// 												}
// 										});
// 								})().then(() => {
// 										if (cronIsActive) {
// 												fs.writeJsonAsync(cronFilePath, {
// 																usecron: true
// 														})
// 														.then(() => {
// 																done();
// 														}, e => {
// 																done(e);
// 														});
// 										} else {
// 												done();
// 										}
// 								});
// 						});
// 						it('Should create a new cron when given a valid file', function (done) {
// 								this.timeout(10000);
// 								request
// 										.post('/pps/api/v1/crons?format=json')
// 										.field('interval', '00 */2 * * * *')
// 										.attach('mediafiles', path.resolve(__dirname, '../../testfiles/test_cron_upload.js'))
// 										.end((err, res) => {
// 												console.log('res.body', res.body);
// 												expect(res.body).to.be.an('object');
// 												expect(res.body.result).to.equal('success');
// 												expect(res.body.data.crons).to.be.an('array');
// 												expect(res.body.data.crons.length).to.equal(1);
// 												cronToRemove = res.body.data.crons[0];
// 												done(err);
// 										});
// 						});
// 						it('Should not create a cron when given an invalid file', function (done) {
// 								this.timeout(10000);
// 								request
// 										.post('/pps/api/v1/crons?format=json')
// 										.field('interval', '00 */2 * * * *')
// 										.attach('mediafiles', path.resolve(__dirname, '../../testfiles/test_text.txt'))
// 										.end((err, res) => {
// 												expect(res.body).to.be.an('object');
// 												expect(res.body.result).to.equal('error');
// 												expect(res.body.data.error).to.be.a('string');
// 												done(err);
// 										});
// 						});
// 				});
// 		});
// 		describe('Communication Router', function () {
// 				describe('POST /mail/incoming', function () {
// 						let PDS_Customers = periodicjs.periodic.app.controller.extension.pds_request.customers,
// 								testCustomer;
// 						before(function (done) {
// 								this.timeout(10000);
// 								PDS_Customers.returnCreateCustomers({
// 										user: {
// 												username: 'test'
// 										},
// 										isAuthenticated: function () {
// 												return true;
// 										},
// 										headers: {
// 												host: 'pps-development.promisefinancial.net'
// 										},
// 										body: customerMock()
// 								}, function (err, customer) {
// 										if (err) {
// 												done(err);
// 										} else {
// 												testCustomer = customer;
// 												done();
// 										}
// 								});
// 						});
// 						after(function (done) {
// 								this.timeout(10000);
// 								PDS_Customers.returnDeleteCustomers({
// 										user: {
// 												username: 'test'
// 										},
// 										isAuthenticated: function () {
// 												return true;
// 										},
// 										headers: {
// 												host: 'pps-development.promisefinancial.net'
// 										},
// 										params: {
// 												id: testCustomer._id
// 										}
// 								}, done);
// 						});
// 						it('Should create a new communication if sender/recipient is whitelisted and customer exist', function (done) {
// 								this.timeout(10000);
// 								request
// 										.post('/mail/incoming')
// 										.set('Authorization', 'Basic MDdjZDNiYmI4MTdjYThjMzBkMDlkMjE3OGYzOTRkYWE6YzEyYTE4NGI3ZGU3MDFiNjdlNThkZTQ4YWNmMTE2MjY=')
// 										.send(webhookMock())
// 										.end((err, res) => {
// 												if (err) {
// 														done(err);
// 												} else {
// 														expect(res.body).to.be.an('object');
// 														expect(res.body.result).to.equal('success');
// 														expect(res.body.data.message).to.be.a('string');
// 														let PDS_Communications = periodicjs.periodic.app.controller.extension.pds_request.communications;
// 														PDS_Communications.returnLoadCommunicationsAsync({
// 																user: {
// 																		username: 'test'
// 																},
// 																isAuthenticated: function () {
// 																		return true;
// 																},
// 																headers: {
// 																		host: 'pps-development.promisefinancial.net'
// 																},
// 																controllerData: {
// 																		model_query: {
// 																				'lastest_contact.email': testCustomer.latest_contact.email
// 																		}
// 																}
// 														}).then(data => {
// 																expect(data.communications).to.be.an('array');
// 																expect(data.communications.length).to.be.okay;
// 																done();
// 														}).
// 														catch(done);
// 												}
// 										});
// 						});
// 						it('Should not create a communication if sender/recipient is not whitelisted', function (done) {
// 								this.timeout(10000);
// 								request
// 										.post('/mail/incoming')
// 										.set('Authorization', 'Basic MDdjZDNiYmI4MTdjYThjMzBkMDlkMjE3OGYzOTRkYWE6YzEyYTE4NGI3ZGU3MDFiNjdlNThkZTQ4YWNmMTE2MjY=')
// 										.send(webhookMock('somefakecustomer@fake.ly', 'somefakeadmin@fake.ly'))
// 										.end((err, res) => {
// 												if (err) {
// 														done(err);
// 												} else {
// 														console.log('req.body for not whitelisted', res.body);
// 														expect(res.body).to.be.an('object');
// 														expect(res.body.result).to.equal('error');
// 														expect(res.body.data.error.message.toLowerCase()).to.equal('Email was not sent or received by Promise Financial'.toLowerCase());
// 														done();
// 												}
// 										});
// 						});
// 						it('Should not create a communication if customer does not exist', function (done) {
// 								this.timeout(10000);
// 								request
// 										.post('/mail/incoming')
// 										.set('Authorization', 'Basic MDdjZDNiYmI4MTdjYThjMzBkMDlkMjE3OGYzOTRkYWE6YzEyYTE4NGI3ZGU3MDFiNjdlNThkZTQ4YWNmMTE2MjY=')
// 										.send(webhookMock('somefakecustomer@fake.ly'))
// 										.end((err, res) => {
// 												if (err) {
// 														done(err);
// 												} else {
// 														console.log('req.body for no customer', res.body);
// 														expect(res.body).to.be.an('object');
// 														expect(res.body.result).to.equal('error');
// 														expect(res.body.data.error.message.toLowerCase()).to.equal('Could not find associated customer for incoming message somefakecustomer@fake.ly'.toLowerCase());
// 														done();
// 												}
// 										});
// 						});
// 				});
// 		});
// });
