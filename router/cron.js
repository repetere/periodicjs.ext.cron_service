'use strict';

module.exports = function(resources) {
  const cronController = resources.app.controller.extension.cron_service.controller.cron;
  const CronRouter = cronController.router;

  // CronRouter.post('/process_application',
  // 	cronController.get_sor_customer_guid,
  // 	customerRequests.findCustomers,
  // 	cronController.get_sor_application, 
  // 	cronController.process_application);


// 	periodic.app.controller.extension.cron_service.service = require('./controller/crons')(periodic);
// periodic.app.use(`/${periodic.app.locals.adminPath}/content`, periodic.app.controller.extension.cron_service.service.router);

  return CronRouter;
};

  