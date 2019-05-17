'use strict';
const periodic = require('periodicjs');
const path = require('path');

module.exports = {
  settings: {
    encryption_key_path: periodic.settings.application.server.https.ssl.private_key,
    cronCheckFileEnabled: true,
    validate_container: false,
    run_on_last_process: false,
    multi_thread_crons: false,
    use_sockets_on_all_threads: true,
    use_automation: false,
    refresh_crons: false,
    filePaths: {
      cronPath: path.resolve(__dirname, '../../../content/files/crons'),
      useCronCheckFile: path.resolve(__dirname, '../../../content/files/croncheck.json'),
    },
    use_cron_host_status: false,
    available_hostnames: [],
  },
  databases: {
  },
};