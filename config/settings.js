'use strict';
const periodic = require('periodicjs');
const path = require('path');

module.exports = {
  settings: {
    encryption_key_path: periodic.settings.application.server.https.ssl.private_key,
    cronCheckFileEnabled:true,
    validateTheme:false,
    filePaths: {
      cronPath: path.resolve(__dirname, '../../../content/files/crons'),
      useCronCheckFile: path.resolve(__dirname, '../../../content/files/croncheck.json'),
    },
  },
  databases: {
  },
};