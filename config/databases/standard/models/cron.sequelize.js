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
  active: {
    type: Sequelize.BOOLEAN,
  },
  theme: {
    type: Sequelize.STRING,
  },
  command_line_arguments: {
    type: Sequelize.STRING,
  },
  runtime_options: {
    type: Sequelize.TEXT,
    // allowNull: false,
    get() {
      return this.getDataValue('command_line_arguments') ? JSON.parse(this.getDataValue('command_line_arguments')) : {};
    },
    set(val) {
      this.setDataValue('command_line_arguments', JSON.stringify(val));
    },
  },
  internal_function: {
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
    fields: ['createdat'],
  }],
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
}, ];

module.exports = {
  scheme,
  options,
  associations,
  coreDataOptions: {
    docid: ['_id', 'name', ],
    sort: { createdat: -1, },
    search: ['title', 'name', 'asset_signature', ],
        // population: 'user_id',
  },
};