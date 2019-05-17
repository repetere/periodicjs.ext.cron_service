'use strict';

const periodic = require('periodicjs');
const extensionRouter = periodic.express.Router();
const automationRouter = require('./automation');
const cronRouter = require('./cron');
const extRouter = require('./ext');

extensionRouter.use('/b-admin/ext/cron_service', extRouter);
extensionRouter.use('/extension/automation', automationRouter);
extensionRouter.use('/extension', cronRouter);

module.exports = extensionRouter;