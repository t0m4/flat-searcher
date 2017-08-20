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

  console.info('Results with params:', JSON.stringify(params));
  _.forEach(results, (items, source) => {
    console.info({ source, hits: items.length });
  });
});

function* alert(items = []) {
  if (_.isEmpty(items)) return;
  const notifs = yield getNotifications();

  const messengerRecipients = _.get(notifs, 'messenger.recipients', []);
  const mapFn = item => `${item.link} ${(item.balcony ? ' *' : '')}`;
  const message = `Uj feltoltott kiado lakasok: \r\n${items.map(mapFn).join('\r\n')}`;

  return Promise.all(_.map(messengerRecipients, recipient => sendFbMessage(message, recipient)));
}

function* run(params) {
  yield scrap(params);
  const lastRun = yield getLastRun();
  yield* alert(yield getLatestFlats(lastRun));
  return updateLastRun();
}

module.exports = Promise.coroutine(run);
