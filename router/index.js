'use strict';

const path = require('path');

module.exports = function(periodic){
  const ExtensionRouter = periodic.express.Router();
  const CronRouter = require(path.resolve(__dirname, './cron'))(periodic);

  ExtensionRouter.use(`/${periodic.app.locals.adminPath}/content`, CronRouter);

  return ExtensionRouter;
};