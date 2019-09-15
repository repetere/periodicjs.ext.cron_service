const async = require('async');
const GLOBAL_PROMISE = Promise;
require('newrelic');
Promise = GLOBAL_PROMISE;
const periodic = require('periodicjs');
const prettysize = require('prettysize');
const v8 = require('v8');
const periodicInitServers = require('periodicjs/lib/init/server');
const memwatch = require('node-memwatch');
let memoryStatistics;

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

memwatch.on('stats', (stats) => {
  [ "estimated_base",
    "current_base",
    "min",
    "max",
  ].forEach(prop => {
      stats[ prop ] = prettysize(stats[ prop ]);
    });
  memoryStatistics = stats;  
});


function getQueueStatus() {
  let workers=[];
  if (computeQueue && computeQueue.workersList) {
    workers = computeQueue.workersList();
  } else {
    computeQueue = {
      length() { return undefined; },
      running() { return undefined; },
      idle() { return undefined; }
    }
  }
  const memoryUsage = process.memoryUsage();
  const heapStatistics = v8.getHeapStatistics();
  for (let key in memoryUsage) {
    memoryUsage[ key ] = prettysize(memoryUsage[ key ]);
  }
  for (let key in heapStatistics) {
    heapStatistics[ key ] = prettysize(heapStatistics[ key ]);
  }
  return {
    length: computeQueue.length(),
    started: computeQueue.started,
    running: computeQueue.running(),
    workersList: workers,
    workersLength: workers.length,
    idle: computeQueue.idle(),
    saturated: computeQueue.saturated,
    concurrency: computeQueue.concurrency,
    THREAD_FORK_NAME, MASTER_THREAD_PID, THREAD_PID,
    memoryUsage,
    memoryStatistics,
    heapStatistics,
    tasks,
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
  try { 
    const periodicInitStatus = await periodic.init({ debug: true, cli: true, computeForked: true, skip_reconfig: true, });
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
    memwatch.on('leak', (leakInfo) => { 
      process.send({
        event: 'compute-log', 
        payload: {
          level:'error',
          message: 'Memory Leak Detected',
          meta: {
            clientlog: true,
            leakInfo,
          },
          status: getQueueStatus(),
        },
      });
    });
  } catch (e) {
    console.error(e);
    process.send({
      event: 'compute-log', 
      payload: {
        level:'error',
        message: 'Error launching process fork',
        meta: {
          clientlog: true,
        },
        status: getQueueStatus(),
      },
    });
    process.exit(0);
  }
}
main();