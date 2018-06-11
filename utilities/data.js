'use strict';
const periodic = require('periodicjs');
const path = require('path');
const CoreControllerModule = require('periodicjs.core.controller');

function getDataCoreController() {
  try {
    const dataCoreControllers = new Map();
    for (let [dataName, datum, ] of periodic.datas) {
      if (dataName === 'standard_cron' || dataName === 'standard_cronhoststatus') {
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

  return CronDatas.load({ query: { _id: req.params.id, }, });
}

function updateCronDocument(options) {
  const { req, } = options;
  const CronDatas = periodic.datas.get('standard_cron');

  return CronDatas.update({
    id: req.params.id, 
    updatedoc: req.body,
  });
}

function createCronDocument(options) {
  const { req, } = options;
  const CronDatas = periodic.datas.get('standard_cron');
  const dateTimeStamp = new Date().valueOf();
  const filename = req.controllerData && req.controllerData.assets && req.controllerData.assets[ 0 ]
    ? req.controllerData.assets[ 0 ].name
    : false;
  const asset = req.controllerData && req.controllerData.assets && req.controllerData.assets[ 0 ]
    ? req.controllerData.assets[ 0 ]._id
    : undefined;
  const internal_functionname = req.body && req.body.internal_function
    ? req.body.internal_function
    : false;
  const name = req.body.name ||
    (filename)
    ? `${filename}_${dateTimeStamp}`
    : `${internal_functionname}_${dateTimeStamp}`;
  const asset_signature = undefined;
  const newCron = {
    name,
    title: req.body.title || name,
    content: req.body.content,
    theme: req.body.content,
    active: req.body.active || false,
    cron_interval: req.body.cron_interval || '00 05 * * * *',
    internal_function : req.body.internal_function,
    asset,
    asset_signature,
  };

  // console.log({newCron})
  return CronDatas.create({ newdoc: newCron, });
}

module.exports = {
  loadCronDocument,
  updateCronDocument,
  createCronDocument,
  getDataCoreController,
};