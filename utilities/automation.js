
const periodic = require('periodicjs');
const mongoose = require('mongoose');
const capitalize = require('capitalize');
const oauth2server = periodic.controllers.extension.get('periodicjs.ext.oauth2server');
const routeUtils = periodic.utilities.routing;
const periodicContainerSettings = periodic.settings.container;
const CONTAINER_NAME = periodicContainerSettings.name;

let utilities;

function getIdQuery(id) {
  const objectIdTest = new RegExp(/[a-f0-9]{24}/i);
  return (mongoose.Types.ObjectId.isValid(id) && objectIdTest.test(id))
    ? {
      _id: mongoose.Types.ObjectId(id),
    }
    : {
      name: id,
    };
}

function getError({ error, status=401,  }) {
  return routeUtils.formatResponse({
    result: 'error',
    status,
    error,
  });
}

const mockThis = {
  stop: () => { },
};

const authMap = {
  go: 'open',
  process: 'client',
  run:'bearer',
};

async function runAutomation(req, res) {
  try {
    let cronFunction;
    const { auth, id, } = req.params;
    const automationScript = await periodic.datas.get('standard_cron').load({ 
      query:getIdQuery(id),
    });
    let automationOptions = Object.assign({}, { req }, automationScript.runtime_options);
    utilities = utilities || periodic.locals.container.get(CONTAINER_NAME);

    if (!automationScript) return res.send(getError({ error: 'Invalid Automation', }));
    const cronAuth = automationScript.cron_properties.auth;
    if (cronAuth !== authMap[ auth ]) return res.send(getError({ error: 'Invalid Automation Authentication', }));

    if (automationScript.internal_function == 'queueOnNewProcess') {
      cronFunction = queueOnNewProcess;
      automationOptions = Object.assign({}, {
        req: {
          query:req.query,
          body:req.body,
        }
      }, automationScript.runtime_options);
    } else {
      cronFunction = automationScript.internal_function !== 'runScript'
        ? periodic.locals.container.get(CONTAINER_NAME).crons[ automationScript.internal_function ]
        : runScript;
    }
      
    const runAutomation = cronFunction.bind({
      stop: () => {
        periodic.logger.debug('Automation ran to completion'); 
      },
    });
    const data = await runAutomation(automationOptions);
    return res.send(routeUtils.formatResponse({
      result: 'success',
      data,
    }));
  } catch (e) {
    periodic.logger.error(e);
    return res.send(getError({ error: 'Invalid Automation Process', status:500, }));
  }
}

async function authenticateAutomation(req, res, next) {
  try {
    const { auth, id, } = req.params;
    req.query.format = 'json';
    if (!auth || ['go', 'process', 'run', ].includes(auth)===false) {
      res.status(401);
      return res.send(getError({ error: 'Invalid Authentication', }));
    } else {
      switch (auth) {
      case 'go':
        return next();
      case 'process':
        req.url = `/automation/authenticate/client/${auth}/${id}`;
        return periodic.app._router.handle(req, res, next);
      case 'run':
        req.url = `/automation/authenticate/bearer/${auth}/${id}`;
        return periodic.app._router.handle(req, res, next);
      }
    }
  } catch (e) {
    periodic.logger.error(e);
    return res.send(getError({ error: 'Invalid Authentication Process', status:500, }));
  }
}

async function downloadFile(req, res) {
  return periodic.core.files.downloadAssetMiddlewareHandler({
    periodic,
  })(req, res);
}

async function runScript({ script, req, }) {
  const cronJobThisContext = this;
  try {
    const Promisie = require('promisie');
    const vm = require('vm');
    const jsonx = require('jsonx');
    const puppeteer = require('puppeteer');
    const request = require('request');
    const $ = require('cheerio');
    const randomUA = require('modern-random-ua');
    const sandbox = {
      asyncMethod: async () => { },
      periodic,
      request,
      Promisie,
      $,
      randomUA,
      $p:periodic,
      puppeteer,
      jsonx,
      req,
      logger:periodic.logger,
      console,
    };
    vm.createContext(sandbox);
    vm.runInContext(`asyncMethod = async function _asyncMethod(){
  ${script}
}`, sandbox);
    const scriptStatus = await sandbox.asyncMethod();
    cronJobThisContext.stop();
    return scriptStatus;
  } catch (e) {
    cronJobThisContext.stop();
    periodic.logger.error(e);
    throw e;
  }
}

async function queueOnNewProcess({ type, name, options = {}, req = {}, script, priority, forkName = 'crons', }) {
  // console.log({ type, name, options, req, script, priority, forkName, })
  const forkedProcesses = periodic.locals.extensions.get('periodicjs.ext.cron_service').queue.forkedProcesses;
  const forked = forkedProcesses.get(forkName);

  if (periodic.settings.extensions[ 'periodicjs.ext.cron_service' ].multi_thread_crons!==true || !forked) {
    options.req = req;
    options.script = script;
    return periodic.locals.container.get(CONTAINER_NAME).crons[ name ].call(mockThis, options);
  } else {
    // const forkedProcesses = periodic.locals.container.get(CONTAINER_NAME).queue.forkedProcesses;
    const cronJobThisContext = (this && typeof this.stop === 'function') ? this : mockThis;
    if (forked) {
      options.req = req;
      options.script = script;
      const task = { type, name, options, }; //type = feature/forecast/data, name=function name/importIntegrations, options
      const queueType = priority ? 'compute-priority-add' : 'compute-add';
      forked.send({ type: queueType, task, });
      cronJobThisContext.stop();
      return true;
    } else return false;
  }
}


module.exports = {
  runAutomation,
  authenticateAutomation,
  downloadFile,
  runScript,
  queueOnNewProcess,
};