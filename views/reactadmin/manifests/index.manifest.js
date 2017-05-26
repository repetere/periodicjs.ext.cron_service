'use strict';
const path = require('path');

const autoManifests = require(path.join(__dirname, '../../../../../node_modules/periodicjs.ext.reactadmin/utility/detail_views/lib/manifest.js'));
const cronSchema = require('../../../model/crons');
const schemas = {
  crons: (cronSchema.obj) ? cronSchema.obj: cronSchema,
};

module.exports = (periodic) => {
  let reactadmin = periodic.app.controller.extension.reactadmin;
  let extsettings = Object.assign({},
    periodic.app.locals.extension.reactadmin.settings, {
    extension_overrides: Object.assign({},
      periodic.app.locals.extension.reactadmin.settings.extension_overrides,),
  });
  const cronManifests = autoManifests(
    schemas,
    {
      prefix: `${reactadmin.manifest_prefix}extension/crons`,
      // dbname:'logger',
      extsettings,
    });
  return {
    containers: cronManifests,
  };
};