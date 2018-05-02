'use strict';

const periodic = require('periodicjs');
const extensionRouter = periodic.express.Router();
const cronRouter = require('./cron');

extensionRouter.use('/extension', cronRouter);

module.exports = extensionRouter;