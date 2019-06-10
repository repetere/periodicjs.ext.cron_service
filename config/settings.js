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
    multi_thread_use_maximum_threads: true,
    multi_thread_number_of_threads: 1,
    multi_thread_max_concurrent_jobs_on_thread: 3,
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