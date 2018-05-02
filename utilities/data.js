'use strict';
const periodic = require('periodicjs');
const path = require('path');
const CoreControllerModule = require('periodicjs.core.controller');

function getDataCoreController() {
  try {
    const dataCoreControllers = new Map();
    for (let [dataName, datum, ] of periodic.datas) {
      if (dataName === 'standard_cron') {
        const CoreController = new CoreControllerModule(periodic, {
          compatibility: false,
          skip_responder: true,
          skip_db: true,
          skip_protocol: true,
        });
        CoreController.initialize_responder({
          adapter: 'json',
        });
        CoreController.initialize_protocol({
          adapter: 'http',
          api: 'rest',
        });
        CoreController.db[dataName] = datum;
        dataCoreControllers.set(dataName, {
          controller: CoreController,
          router: CoreController.protocol.api.implement({
            model_name: dataName,
            // override,
            dirname: path.join(periodic.config.app_root, '/node_modules/periodicjs.ext.cron_service/views'),
          }).router,
        });
      }
    }
    return (dataCoreControllers);
  } catch (e) {
    periodic.logger.error(e);
  }
}

function loadCronDocument(options) {
  const { req, } = options;
  const CronDatas = periodic.datas.get('standard_cron');

  return CronDatas.load({ query: { _id: req.params._id, }, });
}

module.exports = {
  loadCronDocument,
  getDataCoreController,
};