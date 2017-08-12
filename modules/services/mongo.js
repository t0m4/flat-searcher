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
    console.info('Item saved', item);
  }
}

function* getAllForSource(source) {
  if (!source) return;
  const coll = getCollection('flats');
  return coll.find({ source }).toArray();
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

function cleanFlats() {
  const coll = getCollection('flats');
  return coll.remove({});
}

module.exports = {
  connect,
  storeFlats: Promise.coroutine(storeFlats),
  getAllForSource: Promise.coroutine(getAllForSource),
  cleanFlats
};
