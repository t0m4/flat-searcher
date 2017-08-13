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
  getLatestFlats,
  getNotifications
} = require('../services/mongo');

const { send: sendFbMessage } = require('../services/fbmessage');

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
    console.info({ source, hits: items.length, params });
  });
});

function* alert(items = []) {
  if (_.isEmpty(items)) return;
  const notifs = yield getNotifications();

  const messengerRecipients = _.get(notifs, 'messenger.recipients', []);

  const message = `Uj feltoltott kiado lakasok: \r\n${items.map(item => item.link).join('\r\n')}`;

  return Promise.all(_.map(messengerRecipients, recipient => sendFbMessage(message, recipient)));
}

const run = Promise.coroutine(function* run(params) {
  yield scrap(params);
  const lastRun = yield getLastRun();
  yield* alert(yield getLatestFlats(lastRun));
  return updateLastRun();
});

function searcher(params) {
  return run(params);
}

module.exports = searcher;
