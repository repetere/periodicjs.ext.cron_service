'use strict';

const path = require('path');

module.exports = function (resources) {
	const cron = require(path.resolve(__dirname, './cron'))(resources);

	return {
		cron,
	};
};
