'use strict';
const urlTool = require('url');
const Promise = require('bluebird');
const _ = require('lodash');

const getData = require('./get-data');

function* search(params, existing, options) {
  let existingIds = [];
  if (existing) existingIds = _.map(existing, 'id');
  if (options.constructUrl) options.baseUrl = options.constructUrl(params, options);
  console.info(`Search started on ${options.source}`);
  const data = yield getData(params, existingIds, options);

  console.info(`Search finished on ${options.source}`);
  return data;
}

module.exports = Promise.coroutine(search);
