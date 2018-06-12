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
    }	catch (e) {
      logger.warn('Error calling useCronTasks', e);
    }
  });
  
  return Promise.resolve(true);
};