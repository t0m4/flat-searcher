'use strict';
const Promise = require('bluebird');
const _ = require('lodash');

const {
  connect,
  storeFlats,
  getAllForSource,
  cleanFlats
} = require('./services/mongo');
const adapters = require('./adapters');

const startUp = Promise.coroutine(function* startUp() {
  yield connect();
  return cleanFlats()
});

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
    console.info('source', source);
    console.info(items);
  });
});


const start = Promise.coroutine(function* (params) {
  yield scrap(params);

  yield Promise.delay(15 * 60 * 1000);
  console.log('running again');
  start(params).then();
});

function* searcher(params) {
  yield startUp();
  start(params).then();
}

module.exports = Promise.coroutine(searcher);
