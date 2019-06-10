'use strict';
const os = require('os');
const periodic = require('periodicjs');
const utilities = require('./utilities');
const logger = periodic.logger;
const extensionSettings = periodic.settings.extensions[ 'periodicjs.ext.cron_service' ];

module.exports = () => {
  periodic.status.on('configuration-complete', (status) => {
    try {
      if (extensionSettings.cronCheckFileEnabled) {
        logger.silly('Initialzing crons');
        utilities.cron.initializeCrons({})
          .then(loadedCrons=>logger.silly('Initialized Crons', loadedCrons.length))
          .catch(logger.error);
      } else {
        logger.silly('Not initialzing crons');
      }
      if (extensionSettings.refresh_crons) {
        const t = setInterval(() => { 
          logger.silly('refreshing crons');
          utilities.cron.initializeCrons({ skipHosts:true, })
            .then(loadedCrons=>logger.silly('Refreshed Crons', loadedCrons.length))
            .catch(logger.error);
        }, extensionSettings.refresh_crons);
      }
    }	catch (e) {
      logger.warn('Error calling useCronTasks', e);
    }
  });
  if (extensionSettings.multi_thread_crons) {
    let numWorkers = extensionSettings.multi_thread_number_of_threads;
    if (extensionSettings.multi_thread_use_maximum_threads) {
      const cpuThreads = os.cpus().length - 1;
      numWorkers = cpuThreads > 1 ? cpuThreads : numWorkers;
    }
    if (numWorkers > 1) {
      for (let i = 0; i < numWorkers; i++){
        utilities.queue.createFork({ name: `crons_${i}`, });
      }
    } else utilities.queue.createFork({ name: 'crons', });
  }

  return Promise.resolve(true);
};