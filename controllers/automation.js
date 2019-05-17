
const periodic = require('periodicjs');
const extensionSettings = periodic.settings.extensions[ 'periodicjs.ext.cron_service' ];
let utilities;


async function runAutomation(req, res, next) {
  utilities = utilities || periodic.locals.extensions.get('periodicjs.ext.cron_service');

  if (extensionSettings.use_automation) {
    return await utilities.automation.runAutomation(req, res, next);
  } else next(ReferenceError('Automation Disabled'));
}

async function authenticateAutomation(req, res, next) {
  utilities = utilities || periodic.locals.extensions.get('periodicjs.ext.cron_service');

  if (extensionSettings.use_automation) {
    return await utilities.automation.authenticateAutomation(req, res, next);
  } else next(ReferenceError('Automation Disabled'));
}

async function downloadFile(req, res, next) {
  utilities = utilities || periodic.locals.extensions.get('periodicjs.ext.cron_service');

  if (extensionSettings.use_automation) {
    return await utilities.automation.downloadFile(req, res, next);
  } else next(ReferenceError('Automation Disabled'));
}

module.exports = {
  runAutomation,
  authenticateAutomation,
  downloadFile,
};