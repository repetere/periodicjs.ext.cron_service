'use strict';
const Sequelize = require('sequelize');
const scheme = {
  _id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    required: true,
  },
  title: {
    type: Sequelize.STRING,
  },
  author: {
    type: Sequelize.STRING,
  },
  content: {
    type: Sequelize.STRING,
  },
  cron_interval: {
    type: Sequelize.STRING,
    required: true,
  },
  cron_interval_pretty: {
    type: Sequelize.STRING,
    required: true,
  },
  active: {
    type: Sequelize.BOOLEAN,
  },
  container: {
    type: Sequelize.STRING,
  },
  time_zone: {
    type: Sequelize.STRING,
  },
  label: {
    type: Sequelize.STRING,
  },
  command_line_arguments: {
    type: Sequelize.STRING,
  },
  runtime_options: {
    type: Sequelize.TEXT,
    // allowNull: false,
    get() {
      return this.getDataValue('runtime_options') ? JSON.parse(this.getDataValue('runtime_options')) : {};
    },
    set(val) {
      this.setDataValue('runtime_options', JSON.stringify(val));
    },
  },
  cron_properties: {
    type: Sequelize.TEXT,
    // allowNull: false,
    get() {
      return this.getDataValue('cron_properties') ? JSON.parse(this.getDataValue('cron_properties')) : {};
    },
    set(val) {
      this.setDataValue('cron_properties', JSON.stringify(val));
    },
  },
  internal_function: {
    type: Sequelize.STRING,
  },
  inline_function: {
    type: Sequelize.STRING,
  },
  inline_test: {
    type: Sequelize.STRING,
  },
  asset_signature: {
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
const associations = [{
  source: 'code',
  association: 'hasOne',
  target: 'asset',
  options: {
    as: 'asset_id',
  },
},];

module.exports = {
  scheme,
  options,
  associations,
  coreDataOptions: {
    docid: ['_id', 'name',],
    sort: { createdat: -1, },
    search: ['title', 'name', 'asset_signature',],
    // population: 'user_id',
  },
};