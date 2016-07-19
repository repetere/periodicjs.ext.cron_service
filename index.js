'use strict';
const fs = require('fs-extra');
const path = require('path');
const Errorie = require('errorie');
let cronServiceRouter;

var extension = function (periodic) {
	try {
		//configure locals
		periodic = require('./utility/locals')(periodic);
		// periodic.app.themeconfig.utility = require('./utility/index.js')(periodic);
		periodic.app.controller.extension.cron_service.controller = Object.assign({},require('./controller/index')(periodic));
		cronServiceRouter = require('./router/index')(periodic);
		periodic.app.use(cronServiceRouter);
	}
	catch (e) {
		throw new Errorie({
			name: 'Cron Service Extension',
			message: 'Config error - ' + e.message
		});
	}
	return periodic;
};

module.exports = extension;