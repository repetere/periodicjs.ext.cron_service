'use strict';

const Sequelize = require('sequelize');
const scheme = {
  cron_name: {
    type: Sequelize.STRING,
  },
  cron_id: {
    type: Sequelize.INTEGER,
  },
  start_time: {
    type: Sequelize.DATE,
  },
  complete_time: {
    type: Sequelize.DATE,
  },
  status: {
    type: Sequelize.STRING,
  },
  duration: {
    type: Sequelize.TEXT,
    // allowNull: false,
    get() {
      return this.getDataValue('duration') ? JSON.parse(this.getDataValue('duration')) : {};
    },
    set(val) {
      this.setDataValue('duration', JSON.stringify(val));
    },
  },
  environment: {
    type: Sequelize.STRING,
  },
  cron_interval: {
    type: Sequelize.STRING,
  },
  cron_interval_pretty: {
    type: Sequelize.STRING,
  },
  container: {
    type: Sequelize.STRING,
    'default': 'periodicjs.container.default',
  },
  hostname: {
    type: Sequelize.STRING,
  },
  pid: {
    type: Sequelize.STRING,
  },
  master_pid: {
    type: Sequelize.STRING,
  },
};
const options = {
  underscored: true,
  timestamps: true,
  indexes: [{
    fields: ['createdat',],
  },],
  createdAt: 'createdat',
  updatedAt: 'updatedat',
};
const associations = [];

module.exports = {
  scheme,
  options,
  associations,
  coreDataOptions: {
    docid: ['_id',],
    sort: { createdat: -1, },
    search: ['cron_name', 'status', 'cron_interval',],
    // population: 'asset',
  },
};