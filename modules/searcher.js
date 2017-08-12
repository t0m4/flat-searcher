'use strict';
const Promise = require('bluebird');
const _ = require('lodash');

const {
  storeFlats,
  getAllForSource,
  cleanFlats,
  updateLastRun,
  getLastRun,
  getFlats,
  getLatestFlats
} = require('../services/mongo');
const adapters = require('./adapters');

const scrap = Promise.coroutine(function* scrap(params) {
  let results = {};

  for (let adapter of adapters) {
    const existing = yield getAllForSource(adapter.source);
    results[adapter.source] = yield adapter.run(params, existing);
  }

  for (let source in results) {
    yield storeFlats(source, results[source]);
  }

  _.forEach(results, (items, source) => {
    console.info('result', { source, hits: items.length });
  });
});

function alert(items = []) {
  if (_.isEmpty(items)) return;

  console.log('Alert: ', items);
}

const start = Promise.coroutine(function* (params) {
  yield scrap(params);
  const lastRun = yield getLastRun();
  alert(yield getLatestFlats(lastRun));
  yield updateLastRun();

  yield Promise.delay(15 * 60 * 1000);
  console.log('running again');
  start(params).then();
});

function searcher(params) {
  start(params).then();
  return Promise.resolve();
}

module.exports = searcher;
