'use strict';
const Mocha = require('mocha');
const Promisie = require('promisie');
const fs = require('fs');
const minimist = require('minimist');
const path = require('path');
const merge = require('util-extend');

(function (argv) {
	try {
		argv = argv.splice(2);
		argv = minimist(argv);
		let testPath = path.join(process.cwd(), argv.fileName);
		if (typeof testPath !== 'string' || path.extname(testPath) !== '.js') {
			throw new TypeError(`${ testPath } does not exist or does not have a extension name`);
		}
		let mochaOptions = (typeof argv.mochaOptions === 'string') ? JSON.parse(argv.mochaOptions) : false;
		let mocha = new Mocha((mochaOptions) ? merge(mochaOptions.options, { reporter: 'json' }) : {
			reporter: 'json'
		});
		Promisie.promisify(fs.stat)(testPath)
			.then(() => {
				mocha.addFile(testPath);
				return Promisie.promisify(mocha.run, mocha)();
			})
			.then(null, process.exit)
			.catch(e => {
				process.stderr.write(JSON.stringify(e));
				process.exit(1);
			});
	}
	catch (e) {
		console.log(e);
		process.stderr.write(JSON.stringify(e));
		process.exit(1);
	}
})(process.argv);
