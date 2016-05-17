'use strict';
const Mocha = require('mocha');
const Promisie = require('promisie');
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const MochaReporter = require('mocha-js-reporter')(Mocha);
const merge = require('util-extend');

var reporter = function (err, data) {
	if (err) {
		process.stderr.write(JSON.stringify(err));
	}
	else {
		if (data && data.stats && data.stats.failures > 0) {
			process.stdout.write(JSON.stringify({
				result: 'success',
				data: {
					message: 'Test completed with failures',
					report: data
				}
			}));
		}
		else {
			process.stdout.write(JSON.stringify({
				result: 'success',
				data: {
					message: 'Test completed with no failures',
					report: data
				}
			}));
		}
	}
};

(function (argv) {
	try {
		argv = argv.splice(2);
		argv = minimist(argv);
		let testPath = path.join(process.cwd(), argv.fileName);
		if (typeof testPath !== 'string' || path.extname(testPath) !== '.js') {
			throw new TypeError(`${ testPath } does not exist or does not have a extension name`);
		}
		let mochaOptions = (typeof argv.mochaOptions === 'string') ? JSON.parse(argv.mochaOptions) : false;
		let mocha = new Mocha((mochaOptions) ? merge(mochaOptions.options, { reporter: new MochaReporter(reporter) }) : {
			ui: 'tdd',
			reporter: new MochaReporter(reporter)
		});
		Promisie.promisify(fs.stat)(testPath)
			.then(() => {
				mocha.addFile(testPath);
				mocha.run(() => {
					process.on('exit', () => process.exit(0));
				});
			})
			.catch(e => {
				process.stderr.write(JSON.stringify(e));
				process.exit(1);
			});
	}
	catch (e) {
		process.stderr.write(JSON.stringify(e));
		process.exit(1);
	}
})(process.argv);
