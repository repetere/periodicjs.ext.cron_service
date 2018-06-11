'use strict';

const periodic = require('periodicjs');
const extensionRouter = periodic.express.Router();
const cronRouter = require('./cron');
const extRouter = require('./ext');

extensionRouter.use('/b-admin/ext/cron_service', extRouter);
extensionRouter.use('/extension', cronRouter);

module.exports = extensionRouter;