const async = require('async');
const GLOBAL_PROMISE = Promise;
require('newrelic');
Promise = GLOBAL_PROMISE;
const periodic = require('periodicjs');
const periodicInitServers = require('periodicjs/lib/init/server');
const isForked = typeof process.send === 'function';
const isComputeForked = periodic.config.computeForked;
let periodicContainerSettings;
let CONTAINER_NAME;
let settings;
// let counter = 0;
let tasks = 0;
process.argv.push('--status');
process.argv.push('--cli');
let computeQueue;
const { THREAD_FORK_NAME, MASTER_THREAD_PID, } = process.env;
const THREAD_PID = process.pid.toString();

const mockThis = {
  stop: () => { },
};

// console.log('in compute',{
//   isForked,
//   isComputeForked,
// });



function getQueueStatus() {
  const workers = computeQueue.workersList();
  return {
    length: computeQueue.length(),
    started: computeQueue.started,
    running: computeQueue.running(),
    workersList: workers,
    workersLength: workers.length,
    idle: computeQueue.idle(),
    saturated: computeQueue.saturated,
    concurrency: computeQueue.concurrency,
    tasks,
    THREAD_FORK_NAME, MASTER_THREAD_PID, THREAD_PID,
  };
}


if (isForked) {
  process.on('message', msg => {
    const { type, task, } = msg;
    switch (type) {
    case 'compute-add':
      tasks++;  
      computeQueue.push({ task, }, function computeQueuePush(err) {
        tasks--;
        if (err) periodic.logger.error(err);
        else {
          process.send({
            event: 'compute-log',
            payload: {
              message: 'Completed task computation',
              meta: {
                task,
                clientlog: true,
              },
              status:getQueueStatus(),
            },
          });
        }
      });
      break;
    case 'compute-priority-add':
      tasks++;
      computeQueue.unshift({ task, }, function computeQueuePriorityPush(err) {
        tasks--;
        if (err) periodic.logger.error(err);
        else {
          process.send({
            event: 'compute-log', 
            payload:{
              message: 'Completed prioritized task computation',
              meta: {
                task,
                clientlog: true,
              },
              status: getQueueStatus(),
            },
          });
        }
      });
      break;
    case 'compute-status':
      process.send({
        event: 'compute-status-response',
        payload: {
          status:getQueueStatus(),
          clientlog: true,
        },
      });
      break;
    }
    // console.log('Message from parent:', msg);
  });
}

async function main() {
  const periodicInitStatus = await periodic.init({ debug: true, cli: true, computeForked: true, });
  const cronExtensionSettings = periodic.settings.extensions[ 'periodicjs.ext.cron_service' ];
  // console.log({ periodicInitStatus, cronExtensionSettings, });
  if (cronExtensionSettings.use_sockets_on_all_threads) {
    await periodicInitServers.startSocketIOserver.call(periodic);
  }
  // use_sockets_on_all_threads


  periodicContainerSettings = periodic.settings.container;
  CONTAINER_NAME = periodicContainerSettings.name;
  settings = periodicContainerSettings[ CONTAINER_NAME ];

  computeQueue = async.queue(function queueFunction({ task, }, callback) {
    const { type, name, options, } = task;
    // console.log({ task });
    process.send({
      event: 'compute-log', 
      payload:{
        message: `Adding to computation Queue: ${type}`,
        meta: {
          task,
          clientlog: true,
        },
        status:getQueueStatus(),
      },
    });
    try {
      periodic.locals.container.get(CONTAINER_NAME).crons[ name ].call(mockThis, options)
        .then(result => {
          callback(null, result);
        })
        .catch(callback);
    } catch (e) {
      callback(e);
    }
  }, cronExtensionSettings.multi_thread_max_concurrent_jobs_on_thread || 2);
    
  computeQueue.drain = function queueDrain() {
    process.send({
      event: 'compute-log',
      payload: {
        message: 'All queue computations have been processed',
        meta: {
          clientlog: true,
        },
        status:getQueueStatus(),
      },
    });
  };


  process.send({
    event: 'compute-log', 
    payload:{
      message: 'Forked Process Queue Ready',
      meta: {
        clientlog: true,
      },
      status: getQueueStatus(),
    },
  });
}
main();