'use strict';
const Mocha = require('mocha');
const Promisie = require('promisie');
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');

(function (argv) {
	try {
		argv = argv.splice(2);
		argv = minimist(argv);
		let testPath = argv.filePath;
		if (typeof testPath !== 'string' || path.extname(testPath) !== '.js') {
			throw new TypeError(`${ testPath } does not exist or does not have a extension name`);
		}
		let mochaOptions = (typeof argv.mochaOptions === 'string') ? JSON.parse(argv.mochaOptions) : false;
		let mocha = new Mocha((mochaOptions) ? mochaOptions.options : {
			ui: 'tdd',
			reporter: 'list'
		});
		Promisie.promisify(fs.stat)(testPath)
			.then(() => {
				mocha.addFile(testPath);
				return Promisie.promisify(mocha.run, mocha)();
			})
			.then(() => {
				process.stdout.write(JSON.stringify({
					result: 'success',
					data: {
						message: 'Test completed with no errors'
					}
				}));
				return 0;
			}, failures => {
				process.stdout.write(JSON.stringify({
					result: 'success',
					data: {
						message: 'Test completed with errors',
						failures: failures
					}
				}));
				return 0;
			})
			.then(process.exit)
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
