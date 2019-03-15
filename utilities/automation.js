
const periodic = require('periodicjs');
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

const authMap = {
  go: 'open',
  process: 'client',
  run:'bearer',
};

async function runAutomation(req, res) {
  try {
    const mongoose = require('mongoose');
    const { auth, id, } = req.params;
    const automationScript = await periodic.datas.get('standard_cron').load({ 
      query:getIdQuery(req.params.id),
    });
    utilities = utilities || periodic.locals.container.get(CONTAINER_NAME);

    if (!automationScript) return res.send(getError({ error: 'Invalid Automation', }));
    const cronAuth = automationScript.runtime_options.req_body.cron_properties.auth;
    if (cronAuth !== authMap[ auth ]) return res.send(getError({ error: 'Invalid Automation Authentication', }));
    const runAutomation = utilities.crons.runScript.bind({
      stop: () => {
        periodic.logger.debug('Automation ran to completion'); 
      },
    });
    const data = await runAutomation({ req, script: automationScript.runtime_options.script, });
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

function downloadFile(req, res) {
  return periodic.core.files.downloadAssetMiddlewareHandler({
    periodic,
  })(req, res);
}

async function runScript({ script, req, }) {
  const cronJobThisContext = this;
  try {
    const sandbox = {
      asyncMethod: async () => { },
      datasets,
      helpers:functionprops,
      periodic,
      request,
      Promisie,
      $,
      randomUA,
      $p:periodic,
      puppeteer,
      rebulma,
      rjx,
      crons,
      req,
      importHelpers:helpers,
      logger:periodic.logger,
      console,
      scripts,
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
  const forkedProcesses = periodic.locals.container.get(CONTAINER_NAME).queue.forkedProcesses;
  const forked = forkedProcesses.get(forkName);
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


module.exports = {
  runAutomation,
  authenticateAutomation,
  downloadFile,
};