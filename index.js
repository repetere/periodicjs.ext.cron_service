'use strict';
var fs = require('fs-extra');
var extend = require('utils-merge');
var path = require('path');
var appenvironment;

module.exports = function(periodic) {
  appenvironment = periodic.settings.application.environment;
  // let cronController = require('./controller/index')(periodic);
  // var cronRouter = cronController.router;
  var userroleController = periodic.app.controller.native.userrole;
  const reUtilPath = path.join(__dirname, '../../node_modules/periodicjs.ext.reactadmin/utility/locals.js');
  let reactadmin = { route_prefix: '/r-admin' };
  periodic = require('./utility/locals')(periodic);
  periodic.app.controller.extension.cron_service = Object.assign({}, periodic.app.controller.extension.cron_service, {
    controller: require('./controller/index')(periodic)
  });
  periodic.app.controller.extension.cron_service.utility = require('./utility/index.js')(periodic);
  let cronServiceRouter = require('./router/index')(periodic);

  for (var x in periodic.settings.extconf.extensions) {
    if (periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.reactadmin') {
      const reactadminUtil = require(reUtilPath)(periodic).app.locals.extension.reactadmin;
      reactadmin = reactadminUtil;
    }
  }

  periodic.app.use(cronServiceRouter);
  // periodic.app.route(`${reactadmin.route_prefix}/crons`)
  //   .get();

  return periodic;
};