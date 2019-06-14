'use strict';
const os = require('os');
const periodic = require('periodicjs');
const Promisie = require('promisie');
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
    let numWorkers = extensionSettings.multi_thread_number_of_threads || extensionSettings.mutli_thread_process_names.length;
    if (extensionSettings.mutli_thread_process_names.length) {
      Promisie.each(extensionSettings.mutli_thread_process_names, 1, async (name) => {
        return await utilities.queue.createFork({ name, });
      });
    } else {
      if (extensionSettings.multi_thread_use_maximum_threads) {
        const cpuThreads = os.cpus().length - 1;
        numWorkers = cpuThreads > 1 ? cpuThreads : numWorkers;
      }
      if (numWorkers > 1) {
        let i = 0; 
        Promisie.each(numWorkers, 1, async () => {
          const launched = await utilities.queue.createFork({ name: `crons_${i}`, });
          i++;
          return launched;
        })
      } else utilities.queue.createFork({ name: 'crons', });
    }
  }
  return Promise.resolve(true);
};