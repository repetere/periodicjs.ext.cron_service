'use strict';

const lowkie = require('lowkie');
const Schema = lowkie.Schema;
const ObjectId = Schema.ObjectId;
const scheme = {
  name: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  title: String,
  author: String,
  content: String,
  cron_interval: {
    type: String,
    required: true,
  },
  cron_interval_pretty: String,
  active: {
    type: Boolean,
    default: false,
  },
  container: {
    type: String,
    'default': 'periodicjs.container.default',
  },
  command_line_arguments: String,
  runtime_options: Schema.Types.Mixed,
  cron_properties: Schema.Types.Mixed,
  internal_function: String,
  inline_function: String,
  inline_test: String,
  time_zone: String,
  label: String,
  asset_signature: {
    type: String,
    // required: true
  },
  asset: {
    type: ObjectId,
    ref: 'Asset',
    // required: true
  },
};

module.exports = {
  scheme,
  options: {},
  coreDataOptions: {
    docid: ['_id', 'name',],
    sort: { createdat: -1, },
    search: ['title', 'name', 'asset_signature',],
    population: 'asset',
  },
};