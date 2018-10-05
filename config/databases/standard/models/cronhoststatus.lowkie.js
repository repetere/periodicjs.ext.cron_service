'use strict';

const lowkie = require('lowkie');
const Schema = lowkie.Schema;
const ObjectId = Schema.ObjectId;
const scheme = {
  cron_name: String,
  cron_id: ObjectId,
  start_time: Date,
  complete_time: Date,
  status: String,
  duration: Schema.Types.Mixed,
  environment: String,
  cron_interval: String,
  cron_interval_pretty: String,
  container: {
    type: String,
    'default': 'periodicjs.container.default',
  },
  hostname: String,
  pid: String,
  master_pid: String,
};

module.exports = {
  scheme,
  options: {},
  coreDataOptions: {
    docid: ['_id',],
    sort: { createdat: -1, },
    search: ['cron_name', 'status', 'cron_interval',],
    // population: 'asset',
  },
};