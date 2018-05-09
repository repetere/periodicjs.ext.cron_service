'use strict';
const periodic = require('periodicjs');
const logger = periodic.logger;
const Promisie = require('promisie');
const path = require('path');
const https = require('https');
const fs = require('fs-extra');
const CoreControllerModule = require('periodicjs.core.controller');
const cronMap = new Map();
const CronJob = require('cron').CronJob;

function getCronFilePath(assetFilename) {
  const cronPath = extensionSettings.filePaths.cronPath;
  return  path.join(cronPath, assetFilename);
}

function downloadRemoteFiles(options) {
  const { crons=[], } = options;
  const extensionSettings = periodic.settings.extensions[ 'periodicjs.ext.cron_service' ];
  const cronPath = extensionSettings.filePaths.cronPath;
  return new Promise((resolve, reject) => { 
    try {
      fs.ensureDir(cronPath)
        .then(() => { 
          const remoteFiles = crons.filter(cron => cron.asset && cron.asset.locationtype !== 'local');
          if (remoteFiles.length) {
            Promisie.map(remoteFiles.map(cron => cron.asset), 5, asset => {
              const writeStream = fs.createWriteStream(path.join(cronPath, asset.attributes.periodicFilename));
              writeStream.on('finish', () => {
                return true;
              });
              https.get(`/extension/crons/secure-asset/${asset._id}/${asset.attributes.periodicFilename}`, res => { 
                res
                  .pipe(writeStream)
                  .on('end', () => {
                    logger.info('File Stream downloaded end event', asset.attributes.periodicFilename);
                  })
                  .on('close', () => {
                    logger.info('File Stream downloaded end close', asset.attributes.periodicFilename);
                  })
                  .on('finish', () => {
                    logger.info('File Stream downloaded end finish', asset.attributes.periodicFilename);
                  })
                  .on('error', e => {
                    reject(e);
                  });
              });
            })
              .then(resolve)
              .catch(reject);
          } else {
            resolve(crons);
          }
        })
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

function runRemoteFiles(options) {
  return new Promise((resolve, reject) => { 
    try {
      const { crons } = options;
      const cron = crons[ 0 ];
      const CACHE = require.cache;
      const cronFnPath = getCronFilePath(cron.asset.attributes.periodicFilename);
      delete CACHE[ cronFnPath ];
      const cronModule = require(cronFnPath);
      resolve(cronModule.script(Object.assign({}, cron.runtime_options)));
    } catch(e){
      reject(e);
    }
  });
}

function cleanupCronFiles(options) {
  return new Promise((resolve, reject) => {
    try {
      const { crons } = options;
      const cron = crons[ 0 ];
      const cronFnPath = getCronFilePath(cron.asset.attributes.periodicFilename);
      resolve(fs.remove(cronFnPath));
    } catch (e) {
      reject(e);
    }
  });
}

function createCronJob(cron) {
  const containerName = periodic.settings.container.name;
  const modulePath = (cron.asset)
    ? getCronFilePath(cron.asset.attributes.periodicFilename)
    : undefined;
  const runtimeArgs = Object.assign({},
    cron.runtime_options);
  const fn = (cron.internal_function)
    ? periodic.locals.container.get(containerName).crons[ cron.internal_function ].bind(null, runtimeArgs)
    : require(modulePath).script(periodic).bind(null, runtimeArgs);
  console.log({ fn });
  const task = new CronJob({
    cronTime: cron.cron_interval,
    onTick: fn,
    onComplete: function () {},
    start: false,
  });
  return task;
};

const check_cluster_safe_check = function(periodic) {
  let cluster_safe = true;
  let config_file_path = path.resolve(__dirname, `../../../content/config/environment/${appenvironment}.json`);
  let config_settings;
  let original_config_settings;
  let cron_service_hostname_settings = periodic.app.controller.extension.cron_service.settings.disable_cluster_hostnames;
  let hostname_matched_filter = false;
  let hostname = os.hostname();

  if (cron_service_hostname_settings && Array.isArray(cron_service_hostname_settings) && cron_service_hostname_settings.length > 0) {
      cron_service_hostname_settings.forEach(hostname_filter => {
          if (hostname.search(new RegExp(hostname_filter, 'gi')) !== -1) {
              hostname_matched_filter = true;
          }
      });
  }

  fs.readJsonAsync(config_file_path)
      .then(config_file_path_json => {
          original_config_settings = Object.assign({}, config_file_path_json);
          config_settings = Object.assign({}, config_file_path_json);
          if (hostname_matched_filter && config_file_path_json.cluster_process) {
              config_settings.cluster_process = false;
              return fs.outputJsonAsync(config_file_path, config_settings, { spaces: 2 });
          }
      })
      .then((outputJsonResult) => {
          if (hostname_matched_filter && original_config_settings.cluster_process) {
              periodic.logger.warn(`Cron Service cannot run in a clustered environemt, fixing content/config/environment/${appenvironment}.json and restarting Periodicjs`);
              periodic.core.utilities.restart_app({ callback: function() {} });
          }
          // else {
          // 	console.log('hostname',hostname,'hostname_matched_filter', hostname_matched_filter, 'config_settings.cluster_process', config_settings.cluster_process, 'do not restart app');
          // }
      })
      .catch(e => periodic.logger.error(e));
};

function encryptCronFile(cron) {
  return new Promise((resolve, reject) => {
    resolve(cron);
  });
}

function decryptCronFile(cron) {
  return new Promise((resolve, reject) => {
    resolve(cron);
    // const cronFnPath = getCronFilePath(cron.asset.attributes.periodicFilename);
    // fs.stat(cronFnPath).then(() => {
    //   let signData = new Buffer(file.trim()).toString('base64');
    //   let sign = crypto.createSign('RSA-SHA256');
    //   sign.update(signData);
    //   let signature = sign.sign(pemfile, 'hex');
    //   if (signature === cron.asset_signature) {
    //     result.push(cron);
    //     eachcb(null, 'success');
    //   } else {
    //     logger.warn(`Asset ${cron.name} is unsigned and will not be loaded`);
    //     result.push(false);
    //     eachcb(null, 'failed');
    //   }
    // });
  });
}

function digestCronDocument(options) {
  return new Promise((resolve, reject) => {
    try {
      const extensionSettings = periodic.settings.extensions[ 'periodicjs.ext.cron_service' ];
      const { req, cron } = options;
      const cronObj = cronMap.get(cron._id.toString()) || {};
      if (!cronObj.task) {
        const task = createCronJob(cron);
        cronObj.cron = cron;
        cronObj.task = task;
        cronObj.active = cron.active;
      }
      // console.log({ cronObj, cron, extensionSettings});
      if (cron.active && extensionSettings.cronCheckFileEnabled) {
        logger.silly('STARTING CRON');
        cronObj.task.start();
      } else if (cron.active === false) {
        logger.silly('STOPPING CRON');
        cronObj.task.stop();
      }
      const updatedCronObj = {
        cron,
        task: cronObj.task,
        active: cron.active,
      };
      cronMap.set(cron._id, updatedCronObj);
      resolve(cron);
    } catch (e) {
      reject(e);
    }
  });
}

function findCronsForInitialization(options) {
  return new Promise((resolve, reject) => {
    try {
      const extensionSettings = periodic.settings.extensions[ 'periodicjs.ext.cron_service' ];
      const validateTheme = extensionSettings.validateTheme;
      const CronDatas = periodic.datas.get('standard_cron');
      CronDatas.query({
        query: (typeof validateTheme === 'string') ? {
          $and: [ {
            active: true,
          }, {
            theme: validateTheme,
          }, ],
        } : {
            active: true,
          },
        limit: 10000,
        population: 'asset',
      })
        .then(resolve)
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
};

function initializeCrons() {
  return new Promise((resolve, reject) => { 
    try {
      const extensionSettings = periodic.settings.extensions[ 'periodicjs.ext.cron_service' ];
      findCronsForInitialization()
        .then(crons => downloadRemoteFiles({crons}))
        .then(crons => {
          if (Array.isArray(crons) && crons.length) {
            return Promisie.map(crons, 10, cron => {
              return decryptCronFile(cron);
            });
          } else {
            return [];
          }
        })
        .then(crons => {
          // console.log()
          crons.map(cronDoc => {
            const cron = cronDoc.toJSON();
            const task = createCronJob(cron);
            const cronObj = {
              cron,
              task,
              active: cron.active,
            };
            cronMap.set(cron._id.toString(), cronObj);
            if (cron.active && extensionSettings.cronCheckFileEnabled) {
              task.start();
            }
            return cronObj;
          });
          resolve(crons);
        })
        .catch(e => {
          logger.warn('Error starting crons', e);
          reject(e);
        });
    }	catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getCronFilePath,
  downloadRemoteFiles,
  runRemoteFiles,
  digestCronDocument,
  initializeCrons,
  findCronsForInitialization,
};