'use strict';

const periodic = require('periodicjs');
const utilities = require('./utilities');
const logger = periodic.logger;
const extensionSettings = periodic.settings.extensions[ 'periodicjs.ext.cron_service' ];

module.exports = () => {
  periodic.status.on('configuration-complete', (status) => {
    try {
      if (extensionSettings.cronCheckFileEnabled) {
        logger.silly('Initialzing crons');
        utilities.cron.initializeCrons()
          .then(loadedCrons=>logger.silly('Initialized Crons', loadedCrons))
          .catch(logger.error);
      } else {
        logger.silly('Not initialzing crons');
      }
      if (extensionSettings.refresh_crons) {
        const t = setInterval(() => { 
          logger.silly('refreshing crons');
          utilities.cron.initializeCrons({ skipHosts:true, })
            .then(loadedCrons=>logger.silly('Refreshed Crons', loadedCrons))
            .catch(logger.error);
        }, extensionSettings.refresh_crons);
      }
    }	catch (e) {
      logger.warn('Error calling useCronTasks', e);
    }
  });
  
  return Promise.resolve(true);
};