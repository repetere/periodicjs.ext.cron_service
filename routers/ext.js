'use strict';

const periodic = require('periodicjs');
const extRouter = periodic.express.Router();
const usesBasicAdmin = periodic.extensions.has('periodicjs.ext.admin');
const usesReactApp = periodic.extensions.has('periodicjs.ext.reactapp');
// const controllers = require('../controllers');
//controllers.admin.adminResLocals

if (usesBasicAdmin || usesReactApp) {
  const utilities = require('../utilities');
  const dataRouters = utilities.data.getDataCoreController();
  
  if (usesBasicAdmin) {
    const adminControllers = periodic.controllers.extension.get('periodicjs.ext.admin').admin;
    extRouter.use(adminControllers.adminResLocals);
  }
  extRouter.use(dataRouters.get('standard_cron').router);
  extRouter.use(dataRouters.get('standard_cronhoststatus').router);
}

module.exports = extRouter;