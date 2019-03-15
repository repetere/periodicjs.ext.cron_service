const periodic = require('periodicjs');
const path = require('path');
const { fork, } = require('child_process');
const forkedProcesses = new Map();
// const isForked = typeof process.send === 'function';
const isComputeForked = periodic.config.computeForked;

async function getQueueStatus({ forkName = 'crons',  }) {
  let attempts = 0;
  let status = false;
  
  return new Promise((resolve, reject) => {
    try {
      const forkedProcesses = periodic[ '_utilities_container_repetere-client' ].queue.forkedProcesses;
      const forked = forkedProcesses.get(forkName);
      if (isComputeForked !== true) {
        let t = setInterval(() => {
          if (status || attempts > 10) clearInterval(t);
          attempts++;
        }, 100);
        forked.on('message', msg => {
          if (msg.event === 'compute-status-response') {
            status = msg.payload.status;
            resolve(status);
            clearInterval(t);
          }
        });
        forked.send({ type: 'compute-status', });
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
}

async function createFork({ name='crons', }) {
  // console.log({ isForked, });
  if (isComputeForked !== true) {
    // console.log('CREATING FORK',periodic.config);
    const forked = fork(path.join(periodic.config.app_root, 'compute.js'), [`--e ${periodic.config.process.runtime}`,], { env: { NODE_ENV: periodic.config.process.runtime, }, });
    forked.on('message', msg => {
      const { event, payload = {}, } = msg;
      const { message, meta, status, level = 'silly', } = payload;
      switch (event) {
      case 'compute-log':
        meta.status = status;
        periodic.logger[ level ](message, meta);
        break;
      }
      // console.log('message from child', { msg, });
    });
    // forked.send({ hello: 'world', });
    forkedProcesses.set(name, forked);
    return forked;
  }
}

module.exports = { 
  forkedProcesses,
  getQueueStatus,
  createFork,
};
