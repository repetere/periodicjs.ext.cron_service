'use strict';

const periodic = require('periodicjs');
const controllers = require('../controllers');
const cronController = controllers.cron;
const cronRouter = periodic.express.Router();
const oauth2serverControllers = periodic.controllers.extension.get('periodicjs.ext.oauth2server');
const reactappControllers = periodic.controllers.extension.get('periodicjs.ext.reactapp');
let ensureApiAuthenticated = oauth2serverControllers.auth.ensureApiAuthenticated;
const defaultCronRouter = periodic.routers.get('standard_cron').router;

defaultCronRouter.get('/crons/internal-functions',
  cronController.loadInternalFunctions,
  cronController.handleResponseData);
defaultCronRouter.get('/crons/secure-asset/:id/:filename', cronController.decryptAsset);
defaultCronRouter.post('/crons/:id/run',
  ensureApiAuthenticated,
  cronController.loadCron,
  cronController.runCron,
  cronController.handleResponseData);
defaultCronRouter.post('/crons/add',
  reactappControllers.helper.handleFileUpload,
  reactappControllers.helper.fixCodeMirrorSubmit,
  reactappControllers.helper.fixFlattenedSubmit,
  cronController.createCron,
  reactappControllers.helper.handleControllerDataResponse
);
defaultCronRouter.post('/crons/setactive/:id/:status',
  ensureApiAuthenticated,
  cronController.loadCron,
  cronController.setCronStatus,
  cronController.updateCronStatus);
defaultCronRouter.get('/crons/:id/validate',
  cronController.loadCron,
  cronController.validateCron);
defaultCronRouter.get('/crons/:id/mocha',
  cronController.loadCron,
  cronController.mochaCron);
  // cronRouter.use(cronRouter);
cronRouter.use(ensureApiAuthenticated, defaultCronRouter);

module.exports = cronRouter;