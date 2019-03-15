'use strict';

const periodic = require('periodicjs');
const controllers = require('../controllers');
const automationRouter = periodic.express.Router();
const restful_apiControllers = periodic.controllers.extension.get('periodicjs.ext.restful_api');
const oauth2server = periodic.controllers.extension.get('periodicjs.ext.oauth2server');

automationRouter.get('/files/download/:id/:filename', controllers.automation.downloadFile);
if (periodic.controllers.extension.has('periodicjs.ext.restful_api')) {
  automationRouter.post('/auth/app/:auth/:id', oauth2server.auth.isClientAuthenticated,
    restful_apiControllers.handleFileUpload,
    restful_apiControllers.fixCodeMirrorSubmit,
    restful_apiControllers.fixFlattenedSubmit,
    controllers.automation.runAutomation);
  
  automationRouter.post('/auth/oauth/:auth/:id', oauth2server.auth.ensureApiAuthenticated,
    restful_apiControllers.handleFileUpload,
    restful_apiControllers.fixCodeMirrorSubmit,
    restful_apiControllers.fixFlattenedSubmit,
    controllers.automation.runAutomation);
  
  automationRouter.post('/auth/auto/:auth/:id',
    restful_apiControllers.handleFileUpload,
    restful_apiControllers.fixCodeMirrorSubmit,
    restful_apiControllers.fixFlattenedSubmit,
    controllers.automation.runAutomation);
}

module.exports = automationRouter;