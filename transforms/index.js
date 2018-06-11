'use strict';
const periodic = require('periodicjs');
const prettyCron = require('prettycron');
function testPreTransform(req) {
  return new Promise((resolve, reject) => {
    periodic.logger.silly('sample pre transfrom', req.params.id);
    resolve(req);
  });
}
function addPrettyCronToHosts(req) {
  return new Promise((resolve, reject) => {
    try {
      const extensionSettings = periodic.settings.extensions[ 'periodicjs.ext.cron_service' ];
      if (req.controllerData && req.controllerData.standard_cronhoststatuses && req.controllerData.standard_cronhoststatuses.standard_cronhoststatuses && Array.isArray(req.controllerData.standard_cronhoststatuses.standard_cronhoststatuses.documents)) {
        req.controllerData.standard_cronhoststatuses.standard_cronhoststatuses.documents = req.controllerData.standard_cronhoststatuses.standard_cronhoststatuses.documents.map(cron => {
          const cronDoc = (cron.toObject) ? cron.toObject() : cron;
          const updatedCron = Object.assign({}, cronDoc);
          
          updatedCron.display_cron = (cronDoc.cron_interval) ? prettyCron.toString(cronDoc.cron_interval, true):'N/A';
          updatedCron.display_next_cron = (cronDoc.cron_interval) ? prettyCron.getNext(cronDoc.cron_interval, true) : 'N/A';
          // console.log({ cronDoc, });
          // console.log({ updatedCron, });
          return updatedCron;
        }); 
      }
      req.controllerData = Object.assign({}, req.controllerData);
      req.controllerData.cronConfig = extensionSettings;
      resolve(req);
    } catch (e) {
      reject(e);
    }
  });
}
function addPrettyCron(req) {
  return new Promise((resolve, reject) => {
    try {
      const extensionSettings = periodic.settings.extensions[ 'periodicjs.ext.cron_service' ];
      if (req.controllerData && req.controllerData.standard_crons && req.controllerData.standard_crons.standard_crons && Array.isArray(req.controllerData.standard_crons.standard_crons.documents)) {
        req.controllerData.standard_crons.standard_crons.documents = req.controllerData.standard_crons.standard_crons.documents.map(cron => {
          const cronDoc = (cron.toObject) ? cron.toObject() : cron;
          const updatedCron = Object.assign({}, cronDoc, {
            display_cron: prettyCron.toString(cronDoc.cron_interval,true),
            display_next_cron: prettyCron.getNext(cronDoc.cron_interval,true),
          });
          // console.log({ updatedCron, });
          return updatedCron;
        }); 
      }
      req.controllerData = Object.assign({}, req.controllerData);
      req.controllerData.cronConfig = extensionSettings;
      resolve(req);
    } catch (e) {
      reject(e);
    }

  });
}

module.exports = {
  pre: {
    GET: {
      // '/some/route/path/:id':[testPreTransform]
      '/b-admin/ext/cron_service/standard_crons':[testPreTransform,],
    },
    PUT: {
    },
  },
  post: {
    GET: {
      '/b-admin/ext/cron_service/standard_crons':[addPrettyCron,],
      '/b-admin/ext/cron_service/standard_cronhoststatuses':[addPrettyCronToHosts,],
    },
    PUT: {
    },
  },
};