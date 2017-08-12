'use strict';
const { MongoClient } = require('mongodb');
const Promise = require('bluebird');
const _ = require('lodash');

const DB_URL = 'mongodb://localhost:27017/flat-searcher'

let db;

function getCollection(coll) {
  return db.collection(coll);
}

function connect() {
  return MongoClient.connect(DB_URL)
    .then((connectedDb) => {
      db = connectedDb;
      console.info('Connected to database');
      return Promise.resolve(db);
    })
    .catch(err => console.error(err));
}

function* storeChunk(source, items, coll) {
  for (let item of items) {
    const uniqid = `${source}:${item.id}`;
    item.uniqid = uniqid;
    item.source = source;
    yield coll.update({ uniqid }, { $set: item }, { upsert: true });
  }
}

function getAllForSource(source) {
  if (!source) return;
  const coll = getCollection('flats');
  return coll.find({ source }).toArray();
}

function getFlats(match) {
  if (!match || _.isEmpty(match)) throw new Error('match must be not empty');
  const coll = getCollection('flats');
  return coll.find(match, {}, { sort: { creaAt: -1 } }).toArray();
}

function* storeFlats(source, flats) {
  if (!_.isArray(flats) || _.isEmpty(flats)) {
    console.info('No items to save');
    return;
  }
  if (!db) yield connect();

  const coll = getCollection('flats');

  const chunks = _.chunk(flats, 20);

  for (let chunk of chunks) {
    yield* storeChunk(source, chunk, coll);
  }
}

function clearFlats() {
  const coll = getCollection('flats');
  return coll.remove({});
}

function getUser(username, password) {
  const coll = getCollection('users');
  return coll.findOne({ username, password });
}

function updateLastRun() {
  const coll = getCollection('app');
  return coll.update({ type: 'iterations' }, { $set: { type: 'iterations', lastRun: new Date() } }, { upsert: true });
}

function getLastRun() {
  const coll = getCollection('app');
  return coll.findOne({ type: 'iterations' })
    .then((res) => res && res.lastRun || new Date());
}

function* getLatestFlats(fromDate) {
  return getFlats({ creaAt: { $gte: new Date(fromDate) } });
};

module.exports = {
  connect,
  getUser,
  storeFlats: Promise.coroutine(storeFlats),
  getLatestFlats: Promise.coroutine(getLatestFlats),
  getAllForSource,
  clearFlats,
  getFlats,
  updateLastRun,
  getLastRun
};
