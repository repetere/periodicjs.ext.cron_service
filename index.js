'use strict';
var fs = require('fs-extra');
var extend = require('utils-merge');
var path = require('path');
var appenvironment;

module.exports = function(periodic) {
  appenvironment = periodic.settings.application.environment;
  var cronRouter = periodic.express.Router();
  var userroleController = periodic.app.controller.native.userrole;

  const reUtilPath = path.join(__dirname, '../../node_modules/periodicjs.ext.reactadmin/utility/locals.js');
  let reactadmin = { route_prefix: '/r-admin' };

  for (var x in periodic.settings.extconf.extensions) {
    if (periodic.settings.extconf.extensions[x].name === 'periodicjs.ext.reactadmin') {
      const reactadminUtil = require(reUtilPath)(periodic).app.locals.extension.reactadmin;
      reactadmin = reactadminUtil;
    }
  }

  // periodic.app.route(`${reactadmin.route_prefix}/crons`)
  //   .get();

  return periodic;
};