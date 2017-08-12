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

const FREQUENCY = process.env.FREQUENCY ? parseInt(process.env.FREQUENCY, 10) : 10 * 60 * 1000;

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

function* alert(items = []) {
  if (_.isEmpty(items)) return;
  const notifs = yield getNotifications();

  const messengerRecipients = _.get(notifs, 'messenger.recipients', []);

  const message = `Uj feltoltott kiado lakasok: \r\n${items.map(item => item.link).join('\r\n')}`;

  return Promise.all(_.map(messengerRecipients, recipient => sendFbMessage(message, recipient)));
}

const start = Promise.coroutine(function* (params) {
  try {
    yield scrap(params);
    const lastRun = yield getLastRun();
    yield* alert(yield getLatestFlats(lastRun));
    yield updateLastRun();

    yield Promise.delay(FREQUENCY);
    console.log('running again');
    start(params).then();
  } catch(err) {
    console.error(err);
    start(params).then();
  }
});

function searcher(params) {
  start(params).then();
  return Promise.resolve();
}

module.exports = searcher;
