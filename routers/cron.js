'use strict';

const periodic = require('periodicjs');
const controllers = require('../controllers');
const cronController = controllers.cron;
const cronRouter = periodic.express.Router();;
const oauth2serverControllers = periodic.controllers.extension.get('periodicjs.ext.oauth2server');
const reactappControllers = periodic.controllers.extension.get('periodicjs.ext.reactapp');
let ensureApiAuthenticated = oauth2serverControllers.auth.ensureApiAuthenticated;
const defaultCronRouter = periodic.routers.get('standard_cron').router;

cronRouter.get('/crons/internal-functions',
  cronController.loadInternalFunctions,
  cronController.handleResponseData);
cronRouter.get('/crons/secure-asset/:id/:filename', cronController.decryptAsset);
cronRouter.post('/crons/:id/run',
  ensureApiAuthenticated,
  cronController.loadCron,
  cronController.runCron,
  cronController.handleResponseData);
cronRouter.post('/crons/add',
  reactappControllers.helper.handleFileUpload,
  reactappControllers.helper.fixCodeMirrorSubmit,
  reactappControllers.helper.fixFlattenedSubmit,
  cronController.createCron,
  reactappControllers.helper.handleControllerDataResponse
);
cronRouter.post('/crons/setactive/:id/:status',
  ensureApiAuthenticated,
  cronController.loadCron,
  cronController.setCronStatus,
  cronController.updateCronStatus);
cronRouter.get('/crons/:id/validate',
  cronController.loadCron,
  cronController.validateCron);
cronRouter.get('/crons/:id/mocha',
  cronController.loadCron,
  cronController.mochaCron);
  cronRouter.use(cronRouter);
cronRouter.use(ensureApiAuthenticated, defaultCronRouter);

module.exports = cronRouter;