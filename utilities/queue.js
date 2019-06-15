const periodic = require('periodicjs');
const path = require('path');
const { fork, } = require('child_process');
const forkedProcesses = new Map();
const forkedProccessRetryByName = {};
// const isForked = typeof process.send === 'function';
const isComputeForked = periodic.config.computeForked;
const isForked = typeof process.send === 'function' || process.env.FORKED_CRON_PROCESS;

console.log('pid', process.pid, { isComputeForked, isForked, });
if (!isComputeForked || !isForked) {
  process.on('exit', () => {
    try {
      for (let forkedProcess of forkedProcesses.values()) {
        process.kill(forkedProcess.pid, 'SIGUSR2');
      }
      process.kill(process.pid, 'SIGUSR2');
    } catch (e) {
      console.error(e);
    }
  });
  process.once('SIGUSR2', ()=> {
    for (let forkedProcess of forkedProcesses.values()) {
      process.kill(forkedProcess.pid, 'SIGUSR2');
    }
    process.kill(process.pid, 'SIGUSR2');
  });
}

async function getQueueStatus({ forkName = 'crons',  }) {
  let attempts = 0;
  let status = false;
  
  return new Promise((resolve, reject) => {
    try {
      // const forkedProcesses = periodic[ '_utilities_container_repetere-client' ].queue.forkedProcesses;
      const forkedProcesses = periodic.locals.extensions.get('periodicjs.ext.cron_service').queue.forkedProcesses;
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

async function restartFork({ name = 'crons' }) {
  periodic.logger.verbose('attempting to restart fork: ' + name);
  let existingFork;
  if (forkedProcesses.has(name)) {
    existingFork = forkedProcesses.get(name);
    forkedProccessRetryByName[ name ] = 0;
    process.kill(existingFork.pid, 'SIGUSR2');
    return true;
  } else {
    return await createFork({ name, });
  }
}

async function retryForkCreation({ name = 'crons', retry = true, }) {
  const cronExtensionSettings = periodic.settings.extensions[ 'periodicjs.ext.cron_service' ];
  const { multi_thread_max_retry_process_open } = cronExtensionSettings;
  forkedProccessRetryByName[ name ] = (forkedProccessRetryByName[ name ] || 0) + 1;
  const retryAttempts = forkedProccessRetryByName[ name ];
  periodic.logger.verbose(`Retrying fork process [${name}]`, { name, multi_thread_max_retry_process_open, retryAttempts });

  if (retry && retryAttempts < multi_thread_max_retry_process_open) {
    return await createFork({ name, retry, });  
  } else {
    periodic.logger.warn(`Cannot Retry forking process [${name}]`, { name, multi_thread_max_retry_process_open, retryAttempts });
    return false;
  }
}

async function createFork({ name = 'crons', retry = true, }) {
  // const { multi_thread_max_retry_process_open } = cronExtensionSettings;
  // console.log({ isForked, });
  if (isComputeForked !== true) {
    let execArgv;
    // console.log('CREATING FORK',periodic.config);
    // execArgv = [ '--inspect=9' + String(Math.random()).substr(-3) ];

    const forked = fork(path.join(__dirname, 'compute.js'), [ `--e ${periodic.config.process.runtime}`, '--inspect-brk' ], {
      execArgv,
      env: {
        NODE_ENV: periodic.config.process.runtime,
        USE_SLACK: process.env.USE_SLACK,
        FORKED_CRON_PROCESS: true,
        THREAD_FORK_NAME: name,
        MASTER_THREAD_PID: process.pid.toString(),
      },
    });
    forked.on('message', msg => {
      
      const socketIOServer = periodic.servers.get('socket.io') || {};
      const { server: socketServer, sockets: socketConnections, } = socketIOServer;
      const io = socketServer;
      
      const { event, payload = {}, } = msg;
      const { message, meta, status, level = 'verbose', } = payload;
      switch (event) {
        case 'compute-log':
          meta.status = status;
          periodic.logger[ level ](message, meta);
          break;
        case 'compute-emit':
          io.sockets.emit('stdout', message);
          break;
      }
      // console.log('message from child', { msg, });
    });
    // forked.send({ hello: 'world', });
    forked.on('close', closedData => {
      periodic.logger.error('forked close event: ' + name, closedData);
      forkedProcesses.delete(name);
    });
    forked.on('disconnect', async( disconnectData) => {
      periodic.logger.error('forked disconnect event: ' + name, disconnectData);
      forkedProcesses.delete(name);
      if (retry) {
        let t = setTimeout(async() => {
          clearTimeout(t);
          await retryForkCreation({ name, retry, });
        }, 1000);
      }
    });
    forked.on('error', errorData => {
      periodic.logger.error('forked error event: ' + name, errorData);
    });
    forked.on('exit', exitData => {
      periodic.logger.error('forked exit event: ' + name, exitData);
      forkedProcesses.delete(name);
    });
    forkedProcesses.set(name, forked);
    let t = setTimeout(() => {
      clearTimeout(t);
      return forked;
    }, 500);
  } else return false;
}

module.exports = { 
  forkedProcesses,
  getQueueStatus,
  restartFork,
  createFork,
};
