'use strict';
const path = require('path');
const periodic = require('periodicjs');
const logger = periodic.logger;
const utilities = require('../utilities');
const routeUtils = periodic.utilities.routing;

const executeProcess = require('child_process').exec;
const spawnProcess = require('child_process').spawn;
const extensionSettings = periodic.settings.extensions[ 'periodicjs.ext.cron_service' ];
let encryption_key;

function loadCron(req, res, next) {
  utilities.data.loadCronDocument({ req })
    .then(cron => {
      req.controllerData.cron = cron;
      next();
    })
    .catch(err => {
      periodic.core.controller.renderError({
        err,
        req,
        res,
      }); 
    });
}

function runCron(req, res, next) {
  try {
    const cron = req.controllerData.cron.toJSON();
    const containerName = periodic.settings.container.name;
    const runtimeArgs = Object.assign({},
      JSON.parse(req.body.runtime_options||'{}'),
      cron.runtime_options);
    const crons = [ cron ];
    let status = {};
    if (cron.internal_function) {
      Promise.resolve(periodic.locals.container.get(containerName).crons[ cron.internal_function ](runtimeArgs))
        .then(status => {
          req.controllerData.status = status;
          next();
        })
        .catch(next);
    } else {
      utilities.cron.downloadRemoteFiles({crons})
        .then(downloadFilesStatus => {
          logger.silly({ downloadFilesStatus });
          return utilities.cron.runRemoteFiles({crons})
        })
        .then(runFileStatus => {
          status = runFileStatus;
          return utilities.cron.cleanupCronFiles({crons})
        })
        .then(() => { 
          req.controllerData.status = status;
          next();
        })
        .catch(next);
    }
  } catch (e) {
    next(e);
  }
}

function handleResponseData(req, res) {
  res.send(routeUtils.formatResponse({
    result: 'success',
    data: Object.assign({}, req.params, req.query, req.controllerData),
  }));
}

function setCronStatus(req, res, next) {
	req.body = req.controllerData.cron.toJSON();
	req.body.docid = req.controllerData.cron._id;
	req.body.active = !req.body.active;
	req.body._id = undefined;
	req.body.asset = req.controllerData.cron.asset._id;
	req.skipemptyvaluecheck = true;
	delete req.body._id;
	next();
}

function updateCronStatus(req, res, next) {
  next();
}

function validateCron(req, res, next) {
  next();
}

function mochaCron(req, res, next) {
  next();
}

const decryptAsset = function (req, res, next) {
  if (!encryption_key) {
    const encryption_key = fs.readFileSync(extensionSettings.encryption_key_path).toString();
  }
  return periodic.core.files.decryptAssetMiddlewareHandler({
    periodic,
    encryption_key,
  })(req, res, next);
};

module.exports = {
  loadCron,
  runCron,
  validateCron,
  mochaCron,
  handleResponseData,
  setCronStatus,
  updateCronStatus,
  decryptAsset,
}


/*
 *
 * const routeUtils = periodic.utilities.routing;

   res.send(routeUtils.formatResponse({
    result: 'success',
    data: Object.assign({}, req.params, req.query, req.controllerData),
  }));
 * 
 * periodic.core.controller.renderError({
        err,
        req,
        res,
      });   



function loginView(req, res) {
  const entitytype = utilities.auth.getEntityTypeFromReq({
    req,
    accountPath: utilities.paths.account_auth_login,
    userPath: utilities.paths.user_auth_login,
  });  
  const viewtemplate = {
    // themename,
    viewname: 'auth/login',
    extname: 'periodicjs.ext.passport',
    // fileext,
  };
  const flashMsg = (req.query.msg) ? req.query.msg.toString() : false;
  const viewdata = {
    entityType: entitytype,
    loginPaths: utilities.paths,
    loginPost: utilities.paths[`${entitytype}_auth_login`],
    registerPost: utilities.paths[`${entitytype}_auth_register`],
    forgotPost: utilities.paths[ `${entitytype}_auth_forgot` ],
    notification: (flashMsg)?passportSettings.notifications[flashMsg]:false,
  };
  periodic.core.controller.render(req, res, viewtemplate, viewdata);
}



const CACHE = require.cache;
delete CACHE[ filepath ];
 */